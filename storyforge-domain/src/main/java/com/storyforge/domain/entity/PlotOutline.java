package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 剧情大纲表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "sf_plot_outline", autoResultMap = true)
public class PlotOutline extends BaseEntity {

    private Long projectId;
    private Long parentId;
    private String title;
    private String summary;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> keyEvents;

    private Integer level;
    private Integer sortOrder;
}
