package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.StyleConstraintCreateRequest;
import com.storyforge.domain.dto.StyleConstraintUpdateRequest;
import com.storyforge.domain.entity.StyleConstraint;
import com.storyforge.domain.vo.StyleConstraintVO;

public interface IStyleConstraintService extends IService<StyleConstraint> {

    StyleConstraintVO getStyleConstraint(Long userId, Long projectId);

    StyleConstraintVO createStyleConstraint(Long userId, Long projectId, StyleConstraintCreateRequest request);

    StyleConstraintVO updateStyleConstraint(Long userId, Long projectId, StyleConstraintUpdateRequest request);

    boolean deleteStyleConstraint(Long userId, Long projectId);
}
