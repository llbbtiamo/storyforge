package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 角色视图对象
 */
@Data
@Builder
public class CharacterVO {

    private Long id;
    private Long projectId;
    private String name;
    private String roleType;
    private Map<String, Object> basicInfo;
    private String backstory;
    private String motivation;
    private String avatarUrl;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
