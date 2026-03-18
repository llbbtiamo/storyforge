package com.storyforge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.storyforge.domain.entity.KnowledgeEntry;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface KnowledgeEntryMapper extends BaseMapper<KnowledgeEntry> {
}
