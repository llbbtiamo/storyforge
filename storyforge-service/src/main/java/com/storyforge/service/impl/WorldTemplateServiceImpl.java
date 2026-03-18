package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.WorldTemplateCreateRequest;
import com.storyforge.domain.dto.WorldTemplateUpdateRequest;
import com.storyforge.domain.entity.Project;
import com.storyforge.domain.entity.WorldSetting;
import com.storyforge.domain.entity.WorldTemplate;
import com.storyforge.domain.vo.WorldTemplateVO;
import com.storyforge.mapper.ProjectMapper;
import com.storyforge.mapper.WorldSettingMapper;
import com.storyforge.mapper.WorldTemplateMapper;
import com.storyforge.service.IWorldTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorldTemplateServiceImpl extends ServiceImpl<WorldTemplateMapper, WorldTemplate>
        implements IWorldTemplateService {

    private final ProjectMapper projectMapper;
    private final WorldSettingMapper worldSettingMapper;

    @Override
    public List<WorldTemplateVO> listWorldTemplates(Long userId) {
        return list(new LambdaQueryWrapper<WorldTemplate>()
                .eq(WorldTemplate::getUserId, userId)
                .orderByDesc(WorldTemplate::getUpdatedAt)
                .orderByDesc(WorldTemplate::getId)).stream().map(this::toVO).toList();
    }

    @Override
    public WorldTemplateVO getWorldTemplate(Long userId, Long templateId) {
        return toVO(getOwnedWorldTemplateOrThrow(userId, templateId));
    }

    @Override
    public WorldTemplateVO createWorldTemplate(Long userId, WorldTemplateCreateRequest request) {
        WorldTemplate worldTemplate = new WorldTemplate();
        worldTemplate.setUserId(userId);
        apply(worldTemplate, request.getName(), request.getDescription());
        save(worldTemplate);
        return getWorldTemplate(userId, worldTemplate.getId());
    }

    @Override
    public WorldTemplateVO updateWorldTemplate(Long userId, Long templateId, WorldTemplateUpdateRequest request) {
        WorldTemplate worldTemplate = getOwnedWorldTemplateOrThrow(userId, templateId);
        apply(worldTemplate, request.getName(), request.getDescription());
        updateById(worldTemplate);
        return getWorldTemplate(userId, templateId);
    }

    @Override
    @Transactional
    public boolean deleteWorldTemplate(Long userId, Long templateId) {
        WorldTemplate worldTemplate = getOwnedWorldTemplateOrThrow(userId, templateId);
        validateTemplateNotUsedByProject(templateId);
        worldSettingMapper.delete(new LambdaQueryWrapper<WorldSetting>()
                .eq(WorldSetting::getTemplateId, templateId));
        return removeById(worldTemplate.getId());
    }

    @Override
    public WorldTemplate getOwnedWorldTemplateOrThrow(Long userId, Long templateId) {
        WorldTemplate worldTemplate = getOne(new LambdaQueryWrapper<WorldTemplate>()
                .eq(WorldTemplate::getId, templateId)
                .eq(WorldTemplate::getUserId, userId));
        if (worldTemplate == null) {
            throw new BusinessException(404, "世界模板不存在");
        }
        return worldTemplate;
    }

    @Override
    public WorldTemplate getAccessibleWorldTemplateOrThrow(Long userId, Long templateId) {
        return getOwnedWorldTemplateOrThrow(userId, templateId);
    }

    private void validateTemplateNotUsedByProject(Long templateId) {
        long count = projectMapper.selectCount(new LambdaQueryWrapper<Project>()
                .eq(Project::getWorldTemplateId, templateId));
        if (count > 0) {
            throw new BusinessException(400, "世界模板已被项目使用，无法删除");
        }
    }

    private void apply(WorldTemplate worldTemplate, String name, String description) {
        worldTemplate.setName(name);
        worldTemplate.setDescription(description);
        worldTemplate.setIsPublic(Boolean.FALSE);
    }

    private WorldTemplateVO toVO(WorldTemplate worldTemplate) {
        return WorldTemplateVO.builder()
                .id(worldTemplate.getId())
                .name(worldTemplate.getName())
                .description(worldTemplate.getDescription())
                .isPublic(worldTemplate.getIsPublic())
                .createdAt(worldTemplate.getCreatedAt())
                .updatedAt(worldTemplate.getUpdatedAt())
                .build();
    }
}
