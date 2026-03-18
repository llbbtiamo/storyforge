package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 项目创建请求
 */
@Data
public class ProjectCreateRequest {

    @NotBlank(message = "项目标题不能为空")
    @Size(max = 200, message = "项目标题长度不能超过200个字符")
    private String title;

    private String description;

    @Size(max = 50, message = "题材长度不能超过50个字符")
    private String genre;

    @Size(max = 20, message = "状态长度不能超过20个字符")
    private String status;

    private Long worldTemplateId;

    @Size(max = 500, message = "封面地址长度不能超过500个字符")
    private String coverUrl;
}
