package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

/**
 * 角色创建请求
 */
@Data
public class CharacterCreateRequest {

    @NotBlank(message = "角色名不能为空")
    @Size(max = 100, message = "角色名长度不能超过100个字符")
    private String name;

    @Size(max = 20, message = "角色定位长度不能超过20个字符")
    private String roleType;

    private Map<String, Object> basicInfo;

    private String backstory;

    private String motivation;

    @Size(max = 500, message = "头像地址长度不能超过500个字符")
    private String avatarUrl;

    @PositiveOrZero(message = "排序不能为负数")
    private Integer sortOrder;
}
