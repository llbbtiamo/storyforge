package com.storyforge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.storyforge.domain.entity.Character;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CharacterMapper extends BaseMapper<Character> {
}
