package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

/**
 * 世界观设定条目表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "sf_world_setting", autoResultMap = true)
public class WorldSetting extends BaseEntity {

    private Long projectId;
    private Long templateId;
    private String category;
    private String name;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> content;

    private Integer sortOrder;
}
