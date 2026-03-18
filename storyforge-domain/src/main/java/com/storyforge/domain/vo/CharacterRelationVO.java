package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 角色关系视图对象
 */
@Data
@Builder
public class CharacterRelationVO {

    private Long id;
    private Long projectId;
    private Long characterIdA;
    private Long characterIdB;
    private String relationType;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
