package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 章节表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_chapter")
public class Chapter extends BaseEntity {

    private Long projectId;
    private Long outlineId;
    private Integer chapterNumber;
    private String title;
    private String content;
    private Integer wordCount;
    private String status;
    private String aiModelUsed;
}
