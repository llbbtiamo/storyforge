package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 登录日志
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_login_log")
public class LoginLog extends BaseEntity {

    private Long userId;
    private String loginIdentifier;
    private String result;
    private String failureReason;
    private String ipAddress;
    private String userAgent;
    private String browserName;
    private String osName;
    private String clientFingerprintHash;
}
