package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.Map;

/**
 * 风格约束表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "sf_style_constraint", autoResultMap = true)
public class StyleConstraint extends BaseEntity {

    private Long projectId;
    private String narrativeVoice;
    private String writingStyle;
    private String tone;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> taboos;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> customRules;

    private String referenceText;
}
