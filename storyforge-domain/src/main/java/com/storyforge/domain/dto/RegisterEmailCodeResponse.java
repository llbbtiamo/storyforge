package com.storyforge.domain.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 注册邮箱验证码发送响应
 */
@Data
@Builder
public class RegisterEmailCodeResponse {

    private Integer expireSeconds;
    private Integer resendAfterSeconds;
}
