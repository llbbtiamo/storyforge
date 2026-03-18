package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 世界观模板表（跨项目复用）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_world_template")
public class WorldTemplate extends BaseEntity {

    private Long userId;
    private String name;
    private String description;
    private Boolean isPublic;
}
