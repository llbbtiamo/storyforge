package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.AuthRequestContext;
import com.storyforge.domain.dto.LoginRequest;
import com.storyforge.domain.dto.RegisterRequest;
import com.storyforge.domain.entity.User;
import com.storyforge.service.IAuthVerificationService;
import com.storyforge.service.ILoginLogService;
import com.storyforge.service.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private IAuthVerificationService authVerificationService;

    @Mock
    private ILoginLogService loginLogService;

    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        service = spy(new UserServiceImpl(jwtTokenProvider, passwordEncoder, authVerificationService, loginLogService));
    }

    @Test
    void shouldRegisterWithNormalizedEmailAfterVerification() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(" tester ");
        request.setEmail(" User@Example.com ");
        request.setPassword("secret123");
        request.setEmailVerificationCode("123456");
        request.setNickname(" Tester ");

        when(authVerificationService.normalizeEmail(eq(" User@Example.com "))).thenReturn("user@example.com");
        doNothing().when(authVerificationService).verifyRegisterEmailCode(eq("user@example.com"), eq("123456"));
        doNothing().when(authVerificationService).consumeRegisterEmailCode(eq("user@example.com"));
        doReturn(0L, 0L).when(service).count(any(LambdaQueryWrapper.class));
        when(passwordEncoder.encode(eq("secret123"))).thenReturn("encoded-password");
        doAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(9L);
            return true;
        }).when(service).save(any(User.class));
        mockTokenIssuance(9L, "tester");

        var result = service.register(request);

        assertEquals("access-token", result.getAccessToken());
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(service).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("tester", savedUser.getUsername());
        assertEquals("user@example.com", savedUser.getEmail());
        assertEquals("encoded-password", savedUser.getPasswordHash());
        assertEquals("Tester", savedUser.getNickname());
        verify(authVerificationService).verifyRegisterEmailCode("user@example.com", "123456");
        verify(authVerificationService).consumeRegisterEmailCode("user@example.com");
    }

    @Test
    void shouldRejectDuplicateUsernameBeforeVerifyingEmailCode() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("tester");
        request.setEmail("user@example.com");
        request.setPassword("secret123");
        request.setEmailVerificationCode("123456");

        when(authVerificationService.normalizeEmail(eq("user@example.com"))).thenReturn("user@example.com");
        doReturn(1L).when(service).count(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.register(request));

        assertEquals(400, ex.getCode());
        assertEquals("用户名已存在", ex.getMessage());
        verify(authVerificationService, never()).verifyRegisterEmailCode(any(), any());
        verify(authVerificationService, never()).consumeRegisterEmailCode(any());
    }

    @Test
    void shouldRejectDuplicateEmailBeforeVerifyingEmailCode() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("tester");
        request.setEmail("user@example.com");
        request.setPassword("secret123");
        request.setEmailVerificationCode("123456");

        when(authVerificationService.normalizeEmail(eq("user@example.com"))).thenReturn("user@example.com");
        doReturn(0L, 1L).when(service).count(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.register(request));

        assertEquals(400, ex.getCode());
        assertEquals("邮箱已被注册", ex.getMessage());
        verify(authVerificationService, never()).verifyRegisterEmailCode(any(), any());
        verify(authVerificationService, never()).consumeRegisterEmailCode(any());
    }

    @Test
    void shouldResolveDuplicateEmailAfterConstraintViolation() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("tester");
        request.setEmail("user@example.com");
        request.setPassword("secret123");
        request.setEmailVerificationCode("123456");

        when(authVerificationService.normalizeEmail(eq("user@example.com"))).thenReturn("user@example.com");
        doNothing().when(authVerificationService).verifyRegisterEmailCode(eq("user@example.com"), eq("123456"));
        doReturn(0L, 0L, 0L, 1L).when(service).count(any(LambdaQueryWrapper.class));
        when(passwordEncoder.encode(eq("secret123"))).thenReturn("encoded-password");
        doThrow(new DataIntegrityViolationException("constraint violation"))
                .when(service).save(any(User.class));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.register(request));

        assertEquals(400, ex.getCode());
        assertEquals("邮箱已被注册", ex.getMessage());
        verify(authVerificationService, never()).consumeRegisterEmailCode(any());
    }

    @Test
    void shouldResolveDuplicateUsernameAfterConstraintViolation() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("tester");
        request.setEmail("user@example.com");
        request.setPassword("secret123");
        request.setEmailVerificationCode("123456");

        when(authVerificationService.normalizeEmail(eq("user@example.com"))).thenReturn("user@example.com");
        doNothing().when(authVerificationService).verifyRegisterEmailCode(eq("user@example.com"), eq("123456"));
        doReturn(0L, 0L, 1L, 0L).when(service).count(any(LambdaQueryWrapper.class));
        when(passwordEncoder.encode(eq("secret123"))).thenReturn("encoded-password");
        doThrow(new DataIntegrityViolationException("constraint violation"))
                .when(service).save(any(User.class));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.register(request));

        assertEquals(400, ex.getCode());
        assertEquals("用户名已存在", ex.getMessage());
        verify(authVerificationService, never()).consumeRegisterEmailCode(any());
    }

    @Test
    void shouldVerifyCaptchaAndRecordLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setUsername(" tester ");
        request.setPassword("secret123");
        request.setCaptchaId("captcha-1");
        request.setCaptchaCode("ABCD");
        AuthRequestContext requestContext = AuthRequestContext.builder().ipAddress("127.0.0.1").build();

        User user = activeUser();
        doNothing().when(authVerificationService).verifyLoginCaptcha(eq("captcha-1"), eq("ABCD"));
        doReturn(user).when(service).getOne(any(LambdaQueryWrapper.class));
        when(passwordEncoder.matches(eq("secret123"), eq("encoded-password"))).thenReturn(true);
        mockTokenIssuance(7L, "tester");

        var result = service.login(request, requestContext);

        assertEquals("access-token", result.getAccessToken());
        verify(loginLogService).recordSuccess(7L, "tester", requestContext);
        verify(loginLogService, never()).recordFailure(any(), any(), any(), any());
    }

    @Test
    void shouldRecordFailureWithUserIdWhenPasswordIsWrong() {
        LoginRequest request = new LoginRequest();
        request.setUsername(" tester ");
        request.setPassword("wrong-password");
        request.setCaptchaId("captcha-1");
        request.setCaptchaCode("ABCD");
        AuthRequestContext requestContext = AuthRequestContext.builder().ipAddress("127.0.0.1").build();

        User user = activeUser();
        doNothing().when(authVerificationService).verifyLoginCaptcha(eq("captcha-1"), eq("ABCD"));
        doReturn(user).when(service).getOne(any(LambdaQueryWrapper.class));
        when(passwordEncoder.matches(eq("wrong-password"), eq("encoded-password"))).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(request, requestContext));

        assertEquals(401, ex.getCode());
        assertEquals("用户名或密码错误", ex.getMessage());
        verify(loginLogService).recordFailure(7L, "tester", "用户名或密码错误", requestContext);
        verify(loginLogService, never()).recordSuccess(any(), any(), any());
    }

    @Test
    void shouldRecordFailureWhenCaptchaIsInvalid() {
        LoginRequest request = new LoginRequest();
        request.setUsername(" tester ");
        request.setPassword("secret123");
        request.setCaptchaId("captcha-1");
        request.setCaptchaCode("WRONG");
        AuthRequestContext requestContext = AuthRequestContext.builder().ipAddress("127.0.0.1").build();

        doThrow(new BusinessException(400, "图形验证码错误"))
                .when(authVerificationService).verifyLoginCaptcha(eq("captcha-1"), eq("WRONG"));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(request, requestContext));

        assertEquals(400, ex.getCode());
        assertEquals("图形验证码错误", ex.getMessage());
        verify(loginLogService).recordFailure(null, "tester", "图形验证码错误", requestContext);
        verify(service, never()).getOne(any(LambdaQueryWrapper.class));
    }

    private void mockTokenIssuance(Long userId, String username) {
        when(jwtTokenProvider.generateAccessToken(eq(userId), eq(username))).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(eq(userId), eq(username))).thenReturn("refresh-token");
        when(jwtTokenProvider.getAccessExpirationSeconds()).thenReturn(86400L);
    }

    private User activeUser() {
        User user = new User();
        user.setId(7L);
        user.setUsername("tester");
        user.setEmail("user@example.com");
        user.setPasswordHash("encoded-password");
        user.setStatus(StoryForgeConstants.USER_STATUS_ACTIVE);
        return user;
    }
}
