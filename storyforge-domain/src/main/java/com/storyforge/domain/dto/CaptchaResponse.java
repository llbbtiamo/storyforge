package com.storyforge.domain.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 图形验证码响应
 */
@Data
@Builder
public class CaptchaResponse {

    private String captchaId;
    private String imageBase64;
    private Integer expireSeconds;
}
