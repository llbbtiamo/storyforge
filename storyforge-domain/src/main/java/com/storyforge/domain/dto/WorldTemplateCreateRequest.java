package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 世界模板创建请求
 */
@Data
public class WorldTemplateCreateRequest {

    @NotBlank(message = "模板名称不能为空")
    @Size(max = 100, message = "模板名称长度不能超过100个字符")
    private String name;

    @Size(max = 500, message = "模板描述长度不能超过500个字符")
    private String description;
}
