package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色关系表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_character_relation")
public class CharacterRelation extends BaseEntity {

    private Long projectId;
    private Long characterIdA;
    private Long characterIdB;
    private String relationType;
    private String description;
}
