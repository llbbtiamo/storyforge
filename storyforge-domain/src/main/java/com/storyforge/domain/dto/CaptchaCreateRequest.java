package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 图形验证码生成请求
 */
@Data
public class CaptchaCreateRequest {

    @NotBlank(message = "验证码用途不能为空")
    @Pattern(regexp = "LOGIN|REGISTER_EMAIL", message = "验证码用途不合法")
    private String purpose;
}
