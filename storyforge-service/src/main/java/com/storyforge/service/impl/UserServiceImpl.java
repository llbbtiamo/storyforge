package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.AuthRequestContext;
import com.storyforge.domain.dto.LoginRequest;
import com.storyforge.domain.dto.LoginResponse;
import com.storyforge.domain.dto.RegisterRequest;
import com.storyforge.domain.entity.User;
import com.storyforge.domain.vo.UserVO;
import com.storyforge.mapper.UserMapper;
import com.storyforge.service.IAuthVerificationService;
import com.storyforge.service.ILoginLogService;
import com.storyforge.service.IUserService;
import com.storyforge.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 用户服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final IAuthVerificationService authVerificationService;
    private final ILoginLogService loginLogService;

    @Override
    public LoginResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String normalizedEmail = authVerificationService.normalizeEmail(request.getEmail());

        // 校验用户名唯一
        if (count(new LambdaQueryWrapper<User>().eq(User::getUsername, username)) > 0) {
            throw new BusinessException(400, "用户名已存在");
        }
        // 校验邮箱唯一
        if (count(new LambdaQueryWrapper<User>().eq(User::getEmail, normalizedEmail)) > 0) {
            throw new BusinessException(400, "邮箱已被注册");
        }

        authVerificationService.verifyRegisterEmailCode(normalizedEmail, request.getEmailVerificationCode());

        // 创建用户
        User user = new User();
        user.setUsername(username);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNickname(StringUtils.hasText(request.getNickname()) ? request.getNickname().trim() : username);
        user.setVipLevel(StoryForgeConstants.VIP_FREE);
        user.setStatus(StoryForgeConstants.USER_STATUS_ACTIVE);

        try {
            save(user);
        } catch (DataIntegrityViolationException e) {
            throw resolveRegistrationConflict(username, normalizedEmail, e);
        }

        authVerificationService.consumeRegisterEmailCode(normalizedEmail);
        log.info("用户注册成功: {}", user.getUsername());

        // 注册成功直接签发 Token
        return buildLoginResponse(user);
    }

    @Override
    public LoginResponse login(LoginRequest request, AuthRequestContext requestContext) {
        String username = request.getUsername() == null ? null : request.getUsername().trim();
        User user = null;
        try {
            authVerificationService.verifyLoginCaptcha(request.getCaptchaId(), request.getCaptchaCode());

            // 根据用户名查找
            user = getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
            if (user == null) {
                throw new BusinessException(401, "用户名或密码错误");
            }

            // 校验密码
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new BusinessException(401, "用户名或密码错误");
            }

            // 校验账户状态
            if (user.getStatus() == null || user.getStatus() != StoryForgeConstants.USER_STATUS_ACTIVE) {
                throw new BusinessException(403, "账户已被禁用");
            }

            loginLogService.recordSuccess(user.getId(), username, requestContext);
            log.info("用户登录成功: {}", user.getUsername());
            return buildLoginResponse(user);
        } catch (BusinessException e) {
            loginLogService.recordFailure(user != null ? user.getId() : null, username, e.getMessage(), requestContext);
            throw e;
        }
    }

    @Override
    public UserVO getCurrentUser(Long userId) {
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return toUserVO(user);
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        // 校验 Refresh Token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(401, "刷新令牌无效或已过期");
        }

        // 确认是 refresh 类型
        String tokenType = jwtTokenProvider.getTokenType(refreshToken);
        if (!StoryForgeConstants.TOKEN_TYPE_REFRESH.equals(tokenType)) {
            throw new BusinessException(401, "无效的刷新令牌");
        }

        // 提取用户信息并重新签发
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(401, "用户不存在");
        }

        if (user.getStatus() == null || user.getStatus() != StoryForgeConstants.USER_STATUS_ACTIVE) {
            throw new BusinessException(403, "账户已被禁用");
        }

        log.info("用户刷新Token: {}", user.getUsername());

        return buildLoginResponse(user);
    }

    // ==================== 私有方法 ====================

    private LoginResponse buildLoginResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessExpirationSeconds())
                .userInfo(toUserVO(user))
                .build();
    }

    private UserVO toUserVO(User user) {
        return UserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .vipLevel(user.getVipLevel())
                .build();
    }

    private BusinessException resolveRegistrationConflict(String username, String normalizedEmail,
                                                       DataIntegrityViolationException e) {
        boolean usernameExists = count(new LambdaQueryWrapper<User>().eq(User::getUsername, username)) > 0;
        boolean emailExists = count(new LambdaQueryWrapper<User>().eq(User::getEmail, normalizedEmail)) > 0;

        if (usernameExists && !emailExists) {
            return new BusinessException(400, "用户名已存在");
        }
        if (!usernameExists && emailExists) {
            return new BusinessException(400, "邮箱已被注册");
        }
        if (usernameExists || emailExists) {
            return new BusinessException(400, "用户名或邮箱已存在");
        }

        log.error("用户注册出现未知数据约束异常: username={}, email={}", username, normalizedEmail, e);
        return new BusinessException(500, "用户注册失败，请稍后重试");
    }
}
