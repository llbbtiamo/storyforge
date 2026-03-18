package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 知识库条目表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_knowledge_entry")
public class KnowledgeEntry extends BaseEntity {

    private Long projectId;
    private String title;
    private String content;
    private String category;
}
