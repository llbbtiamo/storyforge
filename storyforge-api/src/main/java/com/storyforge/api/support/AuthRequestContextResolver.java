package com.storyforge.api.support;

import com.storyforge.domain.dto.AuthRequestContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

/**
 * 认证请求上下文解析器
 */
@Component
public class AuthRequestContextResolver {

    public AuthRequestContext resolve(HttpServletRequest request, String clientFingerprint) {
        String userAgent = trimToNull(request.getHeader("User-Agent"));
        return AuthRequestContext.builder()
                .ipAddress(truncate(resolveIpAddress(request), 64))
                .userAgent(truncate(userAgent, 1000))
                .browserName(truncate(resolveBrowserName(userAgent), 100))
                .osName(truncate(resolveOsName(userAgent), 100))
                .clientFingerprintHash(hashClientFingerprint(clientFingerprint))
                .build();
    }

    private String resolveIpAddress(HttpServletRequest request) {
        String forwardedFor = firstForwardedIp(request.getHeader("X-Forwarded-For"));
        if (forwardedFor != null) {
            return forwardedFor;
        }
        String realIp = trimToNull(request.getHeader("X-Real-IP"));
        if (realIp != null) {
            return realIp;
        }
        return trimToNull(request.getRemoteAddr());
    }

    private String firstForwardedIp(String forwardedFor) {
        String value = trimToNull(forwardedFor);
        if (value == null) {
            return null;
        }
        String first = value.split(",")[0].trim();
        return isUnknown(first) ? null : first;
    }

    private String resolveBrowserName(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return null;
        }
        String value = userAgent.toLowerCase(Locale.ROOT);
        if (value.contains("edg/")) {
            return "Edge";
        }
        if (value.contains("chrome/")) {
            return "Chrome";
        }
        if (value.contains("firefox/")) {
            return "Firefox";
        }
        if (value.contains("safari/") && value.contains("version/")) {
            return "Safari";
        }
        if (value.contains("trident/") || value.contains("msie")) {
            return "Internet Explorer";
        }
        if (value.contains("opera") || value.contains("opr/")) {
            return "Opera";
        }
        return "Other";
    }

    private String resolveOsName(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return null;
        }
        String value = userAgent.toLowerCase(Locale.ROOT);
        if (value.contains("windows")) {
            return "Windows";
        }
        if (value.contains("iphone") || value.contains("ipad") || value.contains("ios")) {
            return "iOS";
        }
        if (value.contains("android")) {
            return "Android";
        }
        if (value.contains("mac os") || value.contains("macintosh")) {
            return "macOS";
        }
        if (value.contains("linux")) {
            return "Linux";
        }
        return "Other";
    }

    private String hashClientFingerprint(String clientFingerprint) {
        String value = trimToNull(clientFingerprint);
        if (value == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String trimmed = value.trim();
        return isUnknown(trimmed) ? null : trimmed;
    }

    private boolean isUnknown(String value) {
        return value == null || "unknown".equalsIgnoreCase(value);
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
