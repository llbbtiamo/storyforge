package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 项目视图对象
 */
@Data
@Builder
public class ProjectVO {

    private Long id;
    private String title;
    private String description;
    private String genre;
    private String status;
    private Long worldTemplateId;
    private String coverUrl;
    private Integer wordCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
