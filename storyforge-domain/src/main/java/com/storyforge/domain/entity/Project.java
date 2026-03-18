package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 小说项目表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_project")
public class Project extends BaseEntity {

    private Long userId;
    private String title;
    private String description;
    private String genre;
    private String status;
    private Long worldTemplateId;
    private String coverUrl;
    private Integer wordCount;
}
