package com.storyforge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.storyforge.domain.entity.ChapterVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ChapterVersionMapper extends BaseMapper<ChapterVersion> {

    @Select("SELECT MAX(version_number) FROM sf_chapter_version WHERE chapter_id = #{chapterId}")
    Integer selectMaxVersionNumberByChapterId(@Param("chapterId") Long chapterId);
}
