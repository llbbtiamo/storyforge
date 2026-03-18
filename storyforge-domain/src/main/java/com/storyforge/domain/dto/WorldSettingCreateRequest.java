package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

/**
 * 世界观设定创建请求
 */
@Data
public class WorldSettingCreateRequest {

    @NotBlank(message = "设定分类不能为空")
    @Size(max = 50, message = "设定分类长度不能超过50个字符")
    private String category;

    @NotBlank(message = "设定名称不能为空")
    @Size(max = 100, message = "设定名称长度不能超过100个字符")
    private String name;

    @NotNull(message = "设定内容不能为空")
    private Map<String, Object> content;

    @PositiveOrZero(message = "排序不能为负数")
    private Integer sortOrder;
}
