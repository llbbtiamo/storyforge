package com.storyforge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.storyforge.domain.entity.LoginLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LoginLogMapper extends BaseMapper<LoginLog> {
}
