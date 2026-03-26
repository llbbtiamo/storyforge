package com.storyforge.service.impl;

import cn.hutool.captcha.CaptchaUtil;
import cn.hutool.captcha.CircleCaptcha;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.CaptchaResponse;
import com.storyforge.domain.dto.RegisterEmailCodeResponse;
import com.storyforge.domain.entity.User;
import com.storyforge.mapper.UserMapper;
import com.storyforge.service.IAuthVerificationService;
import com.storyforge.service.config.AuthProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 认证验证码服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthVerificationServiceImpl implements IAuthVerificationService {

    private final StringRedisTemplate stringRedisTemplate;
    private final JavaMailSender javaMailSender;
    private final UserMapper userMapper;
    private final AuthProperties authProperties;

    @Override
    public CaptchaResponse createCaptcha(String purpose) {
        validateCaptchaPurpose(purpose);
        CircleCaptcha captcha = CaptchaUtil.createCircleCaptcha(
                authProperties.getCaptchaWidth(),
                authProperties.getCaptchaHeight(),
                authProperties.getCaptchaLength(),
                authProperties.getCaptchaCircleCount());
        String captchaId = UUID.randomUUID().toString();
        setRedisValue(captchaKey(purpose, captchaId), captcha.getCode().toUpperCase(Locale.ROOT),
                authProperties.getCaptchaExpireSeconds(), "验证码服务暂不可用");
        return CaptchaResponse.builder()
                .captchaId(captchaId)
                .imageBase64(captcha.getImageBase64())
                .expireSeconds(authProperties.getCaptchaExpireSeconds())
                .build();
    }

    @Override
    public RegisterEmailCodeResponse sendRegisterEmailCode(String email, String captchaId, String captchaCode) {
        String normalizedEmail = normalizeEmail(email);
        verifyCaptcha(StoryForgeConstants.CAPTCHA_PURPOSE_REGISTER_EMAIL, captchaId, captchaCode);

        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail, normalizedEmail)) > 0) {
            throw new BusinessException(400, "邮箱已被注册");
        }

        String cooldownKey = registerEmailCooldownKey(normalizedEmail);
        Long cooldownSeconds = getExpireSeconds(cooldownKey, "验证码服务暂不可用");
        if (cooldownSeconds != null && cooldownSeconds > 0) {
            throw new BusinessException(429, "邮箱验证码发送过于频繁，请" + cooldownSeconds + "秒后重试");
        }

        String code = resolveRegisterEmailCode();
        String codeKey = registerEmailCodeKey(normalizedEmail);
        setRedisValue(codeKey, code, authProperties.getRegisterEmailCodeExpireSeconds(), "验证码服务暂不可用");
        setRedisValue(cooldownKey, "1", authProperties.getRegisterEmailResendSeconds(), "验证码服务暂不可用");

        if (!authProperties.isDevFixedRegisterEmailCodeEnabled()) {
            try {
                sendRegisterEmail(normalizedEmail, code);
            } catch (MailException e) {
                deleteRedisValue(codeKey);
                deleteRedisValue(cooldownKey);
                log.error("发送注册邮箱验证码失败: email={}", normalizedEmail, e);
                throw new BusinessException(503, "邮件服务暂不可用");
            }
        } else {
            log.info("开发模式固定注册邮箱验证码已启用: email={}, code={}", normalizedEmail, code);
        }

        return RegisterEmailCodeResponse.builder()
                .expireSeconds(authProperties.getRegisterEmailCodeExpireSeconds())
                .resendAfterSeconds(authProperties.getRegisterEmailResendSeconds())
                .build();
    }

    @Override
    public void verifyLoginCaptcha(String captchaId, String captchaCode) {
        verifyCaptcha(StoryForgeConstants.CAPTCHA_PURPOSE_LOGIN, captchaId, captchaCode);
    }

    @Override
    public void verifyRegisterEmailCode(String email, String emailVerificationCode) {
        String normalizedEmail = normalizeEmail(email);
        String key = registerEmailCodeKey(normalizedEmail);
        String storedCode = getRedisValue(key, "验证码服务暂不可用");
        if (!StringUtils.hasText(storedCode)) {
            throw new BusinessException(400, "邮箱验证码不存在或已过期");
        }
        String actualCode = emailVerificationCode == null ? null : emailVerificationCode.trim();
        if (!storedCode.equals(actualCode)) {
            throw new BusinessException(400, "邮箱验证码错误");
        }
    }

    @Override
    public void consumeRegisterEmailCode(String email) {
        deleteRedisValue(registerEmailCodeKey(normalizeEmail(email)));
    }

    @Override
    public String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private void verifyCaptcha(String purpose, String captchaId, String captchaCode) {
        validateCaptchaPurpose(purpose);
        String key = captchaKey(purpose, captchaId);
        String storedCode = getRedisValue(key, "验证码服务暂不可用");
        if (!StringUtils.hasText(storedCode)) {
            throw new BusinessException(400, "图形验证码不存在或已过期");
        }
        String actualCode = captchaCode == null ? null : captchaCode.trim().toUpperCase(Locale.ROOT);
        if (!storedCode.equals(actualCode)) {
            throw new BusinessException(400, "图形验证码错误");
        }
        deleteRedisValue(key);
    }

    private void validateCaptchaPurpose(String purpose) {
        if (!StoryForgeConstants.CAPTCHA_PURPOSE_LOGIN.equals(purpose)
                && !StoryForgeConstants.CAPTCHA_PURPOSE_REGISTER_EMAIL.equals(purpose)) {
            throw new BusinessException(400, "验证码用途不合法");
        }
    }

    private void sendRegisterEmail(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(authProperties.getMailFrom())) {
            message.setFrom(authProperties.getMailFrom());
        }
        message.setTo(email);
        message.setSubject("StoryForge 注册验证码");
        message.setText("您的 StoryForge 注册验证码为：" + code
                + "，有效期 " + authProperties.getRegisterEmailCodeExpireSeconds() / 60
                + " 分钟。若非本人操作，请忽略此邮件。");
        javaMailSender.send(message);
    }

    private String resolveRegisterEmailCode() {
        if (authProperties.isDevFixedRegisterEmailCodeEnabled()) {
            String fixedCode = authProperties.getDevFixedRegisterEmailCode();
            if (!StringUtils.hasText(fixedCode)) {
                throw new BusinessException(500, "开发环境固定邮箱验证码未配置");
            }
            return fixedCode.trim();
        }
        return generateEmailCode();
    }

    private String generateEmailCode() {
        return String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
    }

    private String captchaKey(String purpose, String captchaId) {
        return "auth:captcha:" + purpose + ":" + captchaId;
    }

    private String registerEmailCodeKey(String normalizedEmail) {
        return "auth:register-email-code:" + normalizedEmail;
    }

    private String registerEmailCooldownKey(String normalizedEmail) {
        return "auth:register-email-cooldown:" + normalizedEmail;
    }

    private void setRedisValue(String key, String value, int expireSeconds, String failureMessage) {
        try {
            stringRedisTemplate.opsForValue().set(key, value, Duration.ofSeconds(expireSeconds));
        } catch (DataAccessException e) {
            log.error("写入 Redis 失败: key={}", key, e);
            throw new BusinessException(503, failureMessage);
        }
    }

    private String getRedisValue(String key, String failureMessage) {
        try {
            return stringRedisTemplate.opsForValue().get(key);
        } catch (DataAccessException e) {
            log.error("读取 Redis 失败: key={}", key, e);
            throw new BusinessException(503, failureMessage);
        }
    }

    private Long getExpireSeconds(String key, String failureMessage) {
        try {
            return stringRedisTemplate.getExpire(key);
        } catch (DataAccessException e) {
            log.error("读取 Redis TTL 失败: key={}", key, e);
            throw new BusinessException(503, failureMessage);
        }
    }

    private void deleteRedisValue(String key) {
        try {
            stringRedisTemplate.delete(key);
        } catch (DataAccessException e) {
            log.warn("删除 Redis 键失败: key={}", key, e);
        }
    }
}
