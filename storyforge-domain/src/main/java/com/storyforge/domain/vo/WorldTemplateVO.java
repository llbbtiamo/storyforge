package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 世界模板视图对象
 */
@Data
@Builder
public class WorldTemplateVO {

    private Long id;
    private String name;
    private String description;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
