package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 章节视图对象
 */
@Data
@Builder
public class ChapterVO {

    private Long id;
    private Long projectId;
    private Long outlineId;
    private Integer chapterNumber;
    private String title;
    private String content;
    private Integer wordCount;
    private String status;
    private String aiModelUsed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
