package com.storyforge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.storyforge.domain.entity.Chapter;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChapterMapper extends BaseMapper<Chapter> {
}
