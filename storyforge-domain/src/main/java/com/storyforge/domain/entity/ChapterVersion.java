package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

/**
 * 章节历史版本表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "sf_chapter_version", autoResultMap = true)
public class ChapterVersion extends BaseEntity {

    private Long chapterId;
    private Integer versionNumber;
    private String content;
    private String source;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> generationParams;
}
