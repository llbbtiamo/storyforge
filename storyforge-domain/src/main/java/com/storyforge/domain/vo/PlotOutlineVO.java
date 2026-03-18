package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 剧情大纲视图对象
 */
@Data
@Builder
public class PlotOutlineVO {

    private Long id;
    private Long projectId;
    private Long parentId;
    private String title;
    private String summary;
    private List<String> keyEvents;
    private Integer level;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
