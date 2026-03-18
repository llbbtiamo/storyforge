package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.StyleConstraintCreateRequest;
import com.storyforge.domain.dto.StyleConstraintUpdateRequest;
import com.storyforge.domain.entity.StyleConstraint;
import com.storyforge.domain.vo.StyleConstraintVO;
import com.storyforge.mapper.StyleConstraintMapper;
import com.storyforge.service.IProjectService;
import com.storyforge.service.IStyleConstraintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StyleConstraintServiceImpl extends ServiceImpl<StyleConstraintMapper, StyleConstraint>
        implements IStyleConstraintService {

    private final IProjectService projectService;

    @Override
    public StyleConstraintVO getStyleConstraint(Long userId, Long projectId) {
        return toVO(getOwnedStyleConstraintOrThrow(userId, projectId));
    }

    @Override
    public StyleConstraintVO createStyleConstraint(Long userId, Long projectId, StyleConstraintCreateRequest request) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        if (findByProjectId(projectId) != null) {
            throw new BusinessException(400, "风格约束已存在");
        }
        StyleConstraint styleConstraint = new StyleConstraint();
        styleConstraint.setProjectId(projectId);
        apply(styleConstraint, request);
        save(styleConstraint);
        return getStyleConstraint(userId, projectId);
    }

    @Override
    public StyleConstraintVO updateStyleConstraint(Long userId, Long projectId, StyleConstraintUpdateRequest request) {
        StyleConstraint styleConstraint = getOwnedStyleConstraintOrThrow(userId, projectId);
        apply(styleConstraint, request);
        updateById(styleConstraint);
        return getStyleConstraint(userId, projectId);
    }

    @Override
    public boolean deleteStyleConstraint(Long userId, Long projectId) {
        StyleConstraint styleConstraint = getOwnedStyleConstraintOrThrow(userId, projectId);
        return removeById(styleConstraint.getId());
    }

    private StyleConstraint getOwnedStyleConstraintOrThrow(Long userId, Long projectId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        StyleConstraint styleConstraint = findByProjectId(projectId);
        if (styleConstraint == null) {
            throw new BusinessException(404, "风格约束不存在");
        }
        return styleConstraint;
    }

    private StyleConstraint findByProjectId(Long projectId) {
        return getOne(new LambdaQueryWrapper<StyleConstraint>()
                .eq(StyleConstraint::getProjectId, projectId));
    }

    private void apply(StyleConstraint styleConstraint, StyleConstraintCreateRequest request) {
        styleConstraint.setNarrativeVoice(request.getNarrativeVoice());
        styleConstraint.setWritingStyle(request.getWritingStyle());
        styleConstraint.setTone(request.getTone());
        styleConstraint.setTaboos(request.getTaboos());
        styleConstraint.setCustomRules(request.getCustomRules());
        styleConstraint.setReferenceText(request.getReferenceText());
    }

    private void apply(StyleConstraint styleConstraint, StyleConstraintUpdateRequest request) {
        styleConstraint.setNarrativeVoice(request.getNarrativeVoice());
        styleConstraint.setWritingStyle(request.getWritingStyle());
        styleConstraint.setTone(request.getTone());
        styleConstraint.setTaboos(request.getTaboos());
        styleConstraint.setCustomRules(request.getCustomRules());
        styleConstraint.setReferenceText(request.getReferenceText());
    }

    private StyleConstraintVO toVO(StyleConstraint styleConstraint) {
        return StyleConstraintVO.builder()
                .id(styleConstraint.getId())
                .projectId(styleConstraint.getProjectId())
                .narrativeVoice(styleConstraint.getNarrativeVoice())
                .writingStyle(styleConstraint.getWritingStyle())
                .tone(styleConstraint.getTone())
                .taboos(styleConstraint.getTaboos())
                .customRules(styleConstraint.getCustomRules())
                .referenceText(styleConstraint.getReferenceText())
                .createdAt(styleConstraint.getCreatedAt())
                .updatedAt(styleConstraint.getUpdatedAt())
                .build();
    }
}
