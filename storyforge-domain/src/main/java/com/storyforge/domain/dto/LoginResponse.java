package com.storyforge.domain.dto;

import com.storyforge.domain.vo.UserVO;
import lombok.Builder;
import lombok.Data;

/**
 * 登录响应
 */
@Data
@Builder
public class LoginResponse {

    /** 访问令牌 */
    private String accessToken;

    /** 刷新令牌 */
    private String refreshToken;

    /** 过期时间（秒） */
    private Long expiresIn;

    /** 用户信息 */
    private UserVO userInfo;
}
