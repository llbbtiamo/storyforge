package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 章节版本视图对象
 */
@Data
@Builder
public class ChapterVersionVO {

    private Long id;
    private Long chapterId;
    private Integer versionNumber;
    private String content;
    private String source;
    private Map<String, Object> generationParams;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
