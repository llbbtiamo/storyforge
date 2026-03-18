package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.api.support.AuthRequestContextResolver;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.CaptchaCreateRequest;
import com.storyforge.domain.dto.CaptchaResponse;
import com.storyforge.domain.dto.LoginRequest;
import com.storyforge.domain.dto.LoginResponse;
import com.storyforge.domain.dto.RefreshTokenRequest;
import com.storyforge.domain.dto.RegisterEmailCodeRequest;
import com.storyforge.domain.dto.RegisterEmailCodeResponse;
import com.storyforge.domain.dto.RegisterRequest;
import com.storyforge.domain.vo.UserVO;
import com.storyforge.service.IAuthVerificationService;
import com.storyforge.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证控制器
 */
@Tag(name = "认证模块", description = "用户注册、登录、Token 刷新")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IUserService userService;
    private final IAuthVerificationService authVerificationService;
    private final AuthRequestContextResolver authRequestContextResolver;

    @Operation(summary = "生成图形验证码")
    @PostMapping("/captcha")
    public R<CaptchaResponse> createCaptcha(@Valid @RequestBody CaptchaCreateRequest request) {
        return R.ok(authVerificationService.createCaptcha(request.getPurpose()));
    }

    @Operation(summary = "发送注册邮箱验证码")
    @PostMapping("/register/email-code")
    public R<RegisterEmailCodeResponse> sendRegisterEmailCode(@Valid @RequestBody RegisterEmailCodeRequest request) {
        return R.ok(authVerificationService.sendRegisterEmailCode(
                request.getEmail(), request.getCaptchaId(), request.getCaptchaCode()));
    }

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public R<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return R.ok(userService.register(request));
    }

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public R<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                  @RequestHeader(value = "X-Client-Fingerprint", required = false)
                                  String clientFingerprint,
                                  HttpServletRequest httpServletRequest) {
        return R.ok(userService.login(
                request,
                authRequestContextResolver.resolve(httpServletRequest, clientFingerprint)));
    }

    @Operation(summary = "刷新 Token")
    @PostMapping("/refresh")
    public R<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return R.ok(userService.refreshToken(request.getRefreshToken()));
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public R<UserVO> getCurrentUser(@CurrentUserId Long userId) {
        return R.ok(userService.getCurrentUser(userId));
    }
}
