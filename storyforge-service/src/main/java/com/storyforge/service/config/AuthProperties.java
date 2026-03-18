package com.storyforge.service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 认证相关配置
 */
@Data
@Component
@ConfigurationProperties(prefix = "auth")
public class AuthProperties {

    private int captchaExpireSeconds = 120;
    private int captchaLength = 4;
    private int captchaWidth = 160;
    private int captchaHeight = 50;
    private int captchaCircleCount = 20;
    private int registerEmailCodeExpireSeconds = 300;
    private int registerEmailResendSeconds = 60;
    private String mailFrom;
}
