package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

/**
 * 角色档案表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "sf_character", autoResultMap = true)
public class Character extends BaseEntity {

    private Long projectId;
    private String name;
    private String roleType;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> basicInfo;

    private String backstory;
    private String motivation;
    private String avatarUrl;
    private Integer sortOrder;
}
