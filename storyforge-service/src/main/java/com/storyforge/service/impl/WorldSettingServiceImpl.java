package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.WorldSettingCreateRequest;
import com.storyforge.domain.dto.WorldSettingUpdateRequest;
import com.storyforge.domain.entity.WorldSetting;
import com.storyforge.domain.vo.WorldSettingVO;
import com.storyforge.mapper.WorldSettingMapper;
import com.storyforge.service.IProjectService;
import com.storyforge.service.IWorldSettingService;
import com.storyforge.service.IWorldTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class WorldSettingServiceImpl extends ServiceImpl<WorldSettingMapper, WorldSetting>
        implements IWorldSettingService {

    private final IProjectService projectService;
    private final IWorldTemplateService worldTemplateService;

    @Override
    public List<WorldSettingVO> listWorldSettings(Long userId, Long projectId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        return listProjectWorldSettings(projectId).stream().map(this::toVO).toList();
    }

    @Override
    public WorldSettingVO getWorldSetting(Long userId, Long projectId, Long worldSettingId) {
        return toVO(getOwnedWorldSettingOrThrow(userId, projectId, worldSettingId));
    }

    @Override
    public WorldSettingVO createWorldSetting(Long userId, Long projectId, WorldSettingCreateRequest request) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        WorldSetting worldSetting = new WorldSetting();
        worldSetting.setProjectId(projectId);
        worldSetting.setTemplateId(null);
        apply(worldSetting, request);
        save(worldSetting);
        return getWorldSetting(userId, projectId, worldSetting.getId());
    }

    @Override
    public WorldSettingVO updateWorldSetting(Long userId, Long projectId, Long worldSettingId,
            WorldSettingUpdateRequest request) {
        WorldSetting worldSetting = getOwnedWorldSettingOrThrow(userId, projectId, worldSettingId);
        apply(worldSetting, request);
        updateById(worldSetting);
        return getWorldSetting(userId, projectId, worldSettingId);
    }

    @Override
    public List<WorldSettingVO> listTemplateWorldSettings(Long userId, Long templateId) {
        worldTemplateService.getOwnedWorldTemplateOrThrow(userId, templateId);
        return listTemplateSettings(templateId).stream().map(this::toVO).toList();
    }

    @Override
    public WorldSettingVO getTemplateWorldSetting(Long userId, Long templateId, Long worldSettingId) {
        return toVO(getOwnedTemplateWorldSettingOrThrow(userId, templateId, worldSettingId));
    }

    @Override
    public WorldSettingVO createTemplateWorldSetting(Long userId, Long templateId, WorldSettingCreateRequest request) {
        worldTemplateService.getOwnedWorldTemplateOrThrow(userId, templateId);
        WorldSetting worldSetting = new WorldSetting();
        worldSetting.setProjectId(null);
        worldSetting.setTemplateId(templateId);
        apply(worldSetting, request);
        save(worldSetting);
        return getTemplateWorldSetting(userId, templateId, worldSetting.getId());
    }

    @Override
    public WorldSettingVO updateTemplateWorldSetting(Long userId, Long templateId, Long worldSettingId,
            WorldSettingUpdateRequest request) {
        WorldSetting worldSetting = getOwnedTemplateWorldSettingOrThrow(userId, templateId, worldSettingId);
        apply(worldSetting, request);
        updateById(worldSetting);
        return getTemplateWorldSetting(userId, templateId, worldSettingId);
    }

    @Override
    @Transactional
    public void copyTemplateSettingsToProject(Long userId, Long templateId, Long projectId,
            boolean overwriteExistingSettings) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        worldTemplateService.getAccessibleWorldTemplateOrThrow(userId, templateId);
        List<WorldSetting> templateSettings = listTemplateSettings(templateId);
        if (templateSettings.isEmpty()) {
            throw new BusinessException(400, "世界模板暂无可应用的设定");
        }

        long projectSettingCount = count(new LambdaQueryWrapper<WorldSetting>()
                .eq(WorldSetting::getProjectId, projectId));
        if (projectSettingCount > 0 && !overwriteExistingSettings) {
            throw new BusinessException(400, "项目已有世界观设定，请确认是否覆盖");
        }
        if (projectSettingCount > 0) {
            remove(new LambdaQueryWrapper<WorldSetting>().eq(WorldSetting::getProjectId, projectId));
        }

        List<WorldSetting> copiedSettings = templateSettings.stream()
                .map(templateSetting -> copySetting(templateSetting, projectId, null))
                .toList();
        saveBatch(copiedSettings);
    }

    @Override
    @Transactional
    public void copyProjectSettingsToTemplate(Long userId, Long projectId, Long templateId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        worldTemplateService.getOwnedWorldTemplateOrThrow(userId, templateId);
        List<WorldSetting> projectSettings = listProjectWorldSettings(projectId);
        if (projectSettings.isEmpty()) {
            throw new BusinessException(400, "项目暂无可沉淀的世界观设定");
        }

        List<WorldSetting> copiedSettings = projectSettings.stream()
                .map(projectSetting -> copySetting(projectSetting, null, templateId))
                .toList();
        saveBatch(copiedSettings);
    }

    @Override
    public boolean deleteWorldSetting(Long userId, Long projectId, Long worldSettingId) {
        WorldSetting worldSetting = getOwnedWorldSettingOrThrow(userId, projectId, worldSettingId);
        return removeById(worldSetting.getId());
    }

    @Override
    public boolean deleteTemplateWorldSetting(Long userId, Long templateId, Long worldSettingId) {
        WorldSetting worldSetting = getOwnedTemplateWorldSettingOrThrow(userId, templateId, worldSettingId);
        return removeById(worldSetting.getId());
    }

    private WorldSetting getOwnedWorldSettingOrThrow(Long userId, Long projectId, Long worldSettingId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        WorldSetting worldSetting = getOne(new LambdaQueryWrapper<WorldSetting>()
                .eq(WorldSetting::getId, worldSettingId)
                .eq(WorldSetting::getProjectId, projectId));
        if (worldSetting == null) {
            throw new BusinessException(404, "世界观设定不存在");
        }
        return worldSetting;
    }

    private WorldSetting getOwnedTemplateWorldSettingOrThrow(Long userId, Long templateId, Long worldSettingId) {
        worldTemplateService.getOwnedWorldTemplateOrThrow(userId, templateId);
        WorldSetting worldSetting = getOne(new LambdaQueryWrapper<WorldSetting>()
                .eq(WorldSetting::getId, worldSettingId)
                .eq(WorldSetting::getTemplateId, templateId));
        if (worldSetting == null) {
            throw new BusinessException(404, "世界观设定不存在");
        }
        return worldSetting;
    }

    private List<WorldSetting> listProjectWorldSettings(Long projectId) {
        return list(new LambdaQueryWrapper<WorldSetting>()
                .eq(WorldSetting::getProjectId, projectId)
                .orderByAsc(WorldSetting::getSortOrder)
                .orderByAsc(WorldSetting::getId));
    }

    private List<WorldSetting> listTemplateSettings(Long templateId) {
        return list(new LambdaQueryWrapper<WorldSetting>()
                .eq(WorldSetting::getTemplateId, templateId)
                .orderByAsc(WorldSetting::getSortOrder)
                .orderByAsc(WorldSetting::getId));
    }

    private WorldSetting copySetting(WorldSetting source, Long projectId, Long templateId) {
        WorldSetting copiedSetting = new WorldSetting();
        copiedSetting.setProjectId(projectId);
        copiedSetting.setTemplateId(templateId);
        copiedSetting.setCategory(source.getCategory());
        copiedSetting.setName(source.getName());
        copiedSetting.setContent(source.getContent() == null ? null : new HashMap<>(source.getContent()));
        copiedSetting.setSortOrder(source.getSortOrder());
        return copiedSetting;
    }

    private void apply(WorldSetting worldSetting, String category, String name, Map<String, Object> content,
            Integer sortOrder) {
        worldSetting.setCategory(category);
        worldSetting.setName(name);
        worldSetting.setContent(content);
        worldSetting.setSortOrder(Objects.requireNonNullElse(sortOrder, 0));
    }

    private void apply(WorldSetting worldSetting, WorldSettingCreateRequest request) {
        apply(worldSetting, request.getCategory(), request.getName(), request.getContent(), request.getSortOrder());
    }

    private void apply(WorldSetting worldSetting, WorldSettingUpdateRequest request) {
        apply(worldSetting, request.getCategory(), request.getName(), request.getContent(), request.getSortOrder());
    }

    private WorldSettingVO toVO(WorldSetting worldSetting) {
        return WorldSettingVO.builder()
                .id(worldSetting.getId())
                .projectId(worldSetting.getProjectId())
                .templateId(worldSetting.getTemplateId())
                .category(worldSetting.getCategory())
                .name(worldSetting.getName())
                .content(worldSetting.getContent())
                .sortOrder(worldSetting.getSortOrder())
                .createdAt(worldSetting.getCreatedAt())
                .updatedAt(worldSetting.getUpdatedAt())
                .build();
    }
}
