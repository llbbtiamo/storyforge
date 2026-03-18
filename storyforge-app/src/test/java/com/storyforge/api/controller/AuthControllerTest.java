package com.storyforge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyforge.api.support.AuthRequestContextResolver;
import com.storyforge.domain.dto.AuthRequestContext;
import com.storyforge.domain.dto.CaptchaResponse;
import com.storyforge.domain.dto.LoginRequest;
import com.storyforge.domain.dto.LoginResponse;
import com.storyforge.domain.dto.RegisterEmailCodeResponse;
import com.storyforge.domain.vo.UserVO;
import com.storyforge.service.IAuthVerificationService;
import com.storyforge.service.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@ControllerSecurityTest
class AuthControllerTest extends AuthenticatedControllerTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IUserService userService;

    @MockitoBean
    private IAuthVerificationService authVerificationService;

    @MockitoBean
    private AuthRequestContextResolver authRequestContextResolver;

    @Test
    void shouldAllowUnauthenticatedCaptchaGeneration() throws Exception {
        when(authVerificationService.createCaptcha(eq("LOGIN")))
                .thenReturn(CaptchaResponse.builder()
                        .captchaId("captcha-1")
                        .imageBase64("base64-image")
                        .expireSeconds(120)
                        .build());

        mockMvc.perform(post("/api/v1/auth/captcha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"purpose":"LOGIN"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.captchaId").value("captcha-1"));
    }

    @Test
    void shouldAllowUnauthenticatedRegisterEmailCodeSending() throws Exception {
        when(authVerificationService.sendRegisterEmailCode(eq("user@example.com"), eq("captcha-1"), eq("ABCD")))
                .thenReturn(RegisterEmailCodeResponse.builder()
                        .expireSeconds(300)
                        .resendAfterSeconds(60)
                        .build());

        mockMvc.perform(post("/api/v1/auth/register/email-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"user@example.com","captchaId":"captcha-1","captchaCode":"ABCD"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.expireSeconds").value(300))
                .andExpect(jsonPath("$.data.resendAfterSeconds").value(60));
    }

    @Test
    void shouldValidateRegisterEmailVerificationCode() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"tester","email":"user@example.com","password":"secret123"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void shouldPassResolvedRequestContextToLogin() throws Exception {
        AuthRequestContext requestContext = AuthRequestContext.builder()
                .ipAddress("127.0.0.1")
                .userAgent("Mozilla/5.0")
                .browserName("Chrome")
                .osName("Windows")
                .clientFingerprintHash("fingerprint-hash")
                .build();
        when(authRequestContextResolver.resolve(any(HttpServletRequest.class), eq("device-fingerprint")))
                .thenReturn(requestContext);
        when(userService.login(any(LoginRequest.class), eq(requestContext))).thenReturn(loginResponse());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Client-Fingerprint", "device-fingerprint")
                        .header("User-Agent", "Mozilla/5.0")
                        .content("""
                                {"username":"tester","password":"secret123","captchaId":"captcha-1","captchaCode":"ABCD"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.userInfo.username").value("tester"));

        verify(userService).login(argThat(request ->
                        "tester".equals(request.getUsername())
                                && "secret123".equals(request.getPassword())
                                && "captcha-1".equals(request.getCaptchaId())
                                && "ABCD".equals(request.getCaptchaCode())),
                eq(requestContext));
    }

    @Test
    void shouldRejectUnauthenticatedCurrentUserRequest() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldReturnCurrentUserInfo() throws Exception {
        when(userService.getCurrentUser(eq(USER_ID))).thenReturn(UserVO.builder()
                .id(USER_ID)
                .username("tester")
                .email("user@example.com")
                .nickname("Tester")
                .vipLevel(0)
                .build());

        mockMvc.perform(get("/api/v1/auth/me").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("tester"));
    }

    private LoginResponse loginResponse() {
        return LoginResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .expiresIn(86400L)
                .userInfo(UserVO.builder()
                        .id(USER_ID)
                        .username("tester")
                        .email("user@example.com")
                        .nickname("Tester")
                        .vipLevel(0)
                        .build())
                .build();
    }
}
