package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 角色关系更新请求
 */
@Data
public class CharacterRelationUpdateRequest {

    @NotNull(message = "角色A不能为空")
    private Long characterIdA;

    @NotNull(message = "角色B不能为空")
    private Long characterIdB;

    @NotBlank(message = "关系类型不能为空")
    @Size(max = 50, message = "关系类型长度不能超过50个字符")
    private String relationType;

    private String description;
}
