package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 世界观设定视图对象
 */
@Data
@Builder
public class WorldSettingVO {

    private Long id;
    private Long projectId;
    private Long templateId;
    private String category;
    private String name;
    private Map<String, Object> content;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
