package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 应用世界模板请求
 */
@Data
public class ApplyWorldTemplateRequest {

    @NotNull(message = "世界模板ID不能为空")
    private Long worldTemplateId;

    private Boolean overwriteExistingSettings;
}
