package com.storyforge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.storyforge.domain.entity.Subscription;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SubscriptionMapper extends BaseMapper<Subscription> {
}
