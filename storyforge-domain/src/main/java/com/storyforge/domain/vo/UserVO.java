package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

/**
 * 用户视图对象（不含敏感信息）
 */
@Data
@Builder
public class UserVO {

    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String avatarUrl;
    private Integer vipLevel;
}
