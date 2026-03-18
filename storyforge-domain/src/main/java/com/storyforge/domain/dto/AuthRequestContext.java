package com.storyforge.domain.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 认证请求上下文
 */
@Data
@Builder
public class AuthRequestContext {

    private String ipAddress;
    private String userAgent;
    private String browserName;
    private String osName;
    private String clientFingerprintHash;

    public static AuthRequestContext empty() {
        return AuthRequestContext.builder().build();
    }
}
