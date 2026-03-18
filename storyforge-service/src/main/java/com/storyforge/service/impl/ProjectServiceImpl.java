package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.ApplyWorldTemplateRequest;
import com.storyforge.domain.dto.CreateWorldTemplateFromProjectRequest;
import com.storyforge.domain.dto.ProjectCreateRequest;
import com.storyforge.domain.dto.ProjectUpdateRequest;
import com.storyforge.domain.dto.WorldTemplateCreateRequest;
import com.storyforge.domain.entity.Project;
import com.storyforge.domain.entity.WorldTemplate;
import com.storyforge.domain.vo.ProjectVO;
import com.storyforge.domain.vo.WorldTemplateVO;
import com.storyforge.mapper.ProjectMapper;
import com.storyforge.service.IProjectService;
import com.storyforge.service.IWorldSettingService;
import com.storyforge.service.IWorldTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements IProjectService {

    private static final Set<String> PROJECT_STATUSES = Set.of(
            StoryForgeConstants.PROJECT_DRAFT,
            StoryForgeConstants.PROJECT_IN_PROGRESS,
            StoryForgeConstants.PROJECT_COMPLETED);

    private final IWorldTemplateService worldTemplateService;
    private final IWorldSettingService worldSettingService;

    @Override
    public List<ProjectVO> listProjectsByUser(Long userId) {
        return list(new LambdaQueryWrapper<Project>()
                .eq(Project::getUserId, userId)
                .orderByDesc(Project::getUpdatedAt)).stream().map(this::toVO).toList();
    }

    @Override
    public ProjectVO getProject(Long userId, Long projectId) {
        return toVO(getOwnedProjectOrThrow(userId, projectId));
    }

    @Override
    @Transactional
    public ProjectVO createProject(Long userId, ProjectCreateRequest request) {
        Project project = new Project();
        project.setUserId(userId);
        apply(project, request);
        project.setWordCount(0);
        Long requestedWorldTemplateId = request.getWorldTemplateId();
        if (requestedWorldTemplateId != null) {
            project.setWorldTemplateId(null);
        }
        save(project);
        if (requestedWorldTemplateId != null) {
            applyWorldTemplate(userId, project, requestedWorldTemplateId, false);
        }
        return toVO(project);
    }

    @Override
    public ProjectVO updateProject(Long userId, Long projectId, ProjectUpdateRequest request) {
        Project project = getOwnedProjectOrThrow(userId, projectId);
        Long effectiveWorldTemplateId = Objects.requireNonNullElse(request.getWorldTemplateId(), project.getWorldTemplateId());
        validateTemplateSwitchOnUpdate(project, effectiveWorldTemplateId);
        apply(project, request, effectiveWorldTemplateId);
        updateById(project);
        return getProject(userId, projectId);
    }

    @Override
    @Transactional
    public ProjectVO applyWorldTemplate(Long userId, Long projectId, ApplyWorldTemplateRequest request) {
        Project project = getOwnedProjectOrThrow(userId, projectId);
        applyWorldTemplate(userId, project, request.getWorldTemplateId(), Boolean.TRUE.equals(request.getOverwriteExistingSettings()));
        return toVO(project);
    }

    @Override
    @Transactional
    public WorldTemplateVO createWorldTemplateFromProject(Long userId, Long projectId,
            CreateWorldTemplateFromProjectRequest request) {
        Project project = getOwnedProjectOrThrow(userId, projectId);
        WorldTemplateCreateRequest createRequest = new WorldTemplateCreateRequest();
        createRequest.setName(resolveTemplateName(project, request.getName()));
        createRequest.setDescription(request.getDescription());
        WorldTemplateVO worldTemplate = worldTemplateService.createWorldTemplate(userId, createRequest);
        worldSettingService.copyProjectSettingsToTemplate(userId, projectId, worldTemplate.getId());
        return worldTemplate;
    }

    @Override
    public boolean deleteProject(Long userId, Long projectId) {
        Project project = getOwnedProjectOrThrow(userId, projectId);
        return removeById(project.getId());
    }

    @Override
    public Project getOwnedProjectOrThrow(Long userId, Long projectId) {
        Project project = getOne(new LambdaQueryWrapper<Project>()
                .eq(Project::getId, projectId)
                .eq(Project::getUserId, userId));
        if (project == null) {
            throw new BusinessException(404, "项目不存在");
        }
        return project;
    }

    private void apply(Project project, ProjectCreateRequest request) {
        applyProjectFields(project, request.getTitle(), request.getDescription(), request.getGenre(), request.getStatus(),
                request.getWorldTemplateId(), request.getCoverUrl());
    }

    private void apply(Project project, ProjectUpdateRequest request) {
        apply(project, request, request.getWorldTemplateId());
    }

    private void apply(Project project, ProjectUpdateRequest request, Long worldTemplateId) {
        applyProjectFields(project, request.getTitle(), request.getDescription(), request.getGenre(), request.getStatus(),
                worldTemplateId, request.getCoverUrl());
    }

    private void applyProjectFields(Project project,
            String title,
            String description,
            String genre,
            String status,
            Long worldTemplateId,
            String coverUrl) {
        String finalStatus = Objects.requireNonNullElse(status, StoryForgeConstants.PROJECT_DRAFT);
        validateProjectStatus(finalStatus);
        project.setTitle(title);
        project.setDescription(description);
        project.setGenre(genre);
        project.setStatus(finalStatus);
        project.setWorldTemplateId(worldTemplateId);
        project.setCoverUrl(coverUrl);
    }

    private void validateProjectStatus(String status) {
        if (!PROJECT_STATUSES.contains(status)) {
            throw new BusinessException(400, "项目状态不合法");
        }
    }

    private void validateTemplateSwitchOnUpdate(Project project, Long requestedTemplateId) {
        if (!Objects.equals(project.getWorldTemplateId(), requestedTemplateId)) {
            throw new BusinessException(400, "请通过应用模板接口切换世界模板");
        }
    }

    private void applyWorldTemplate(Long userId, Project project, Long worldTemplateId, boolean overwriteExistingSettings) {
        WorldTemplate worldTemplate = worldTemplateService.getAccessibleWorldTemplateOrThrow(userId, worldTemplateId);
        worldSettingService.copyTemplateSettingsToProject(userId, worldTemplate.getId(), project.getId(), overwriteExistingSettings);
        project.setWorldTemplateId(worldTemplate.getId());
        updateById(project);
    }

    private String resolveTemplateName(Project project, String requestedName) {
        if (requestedName == null || requestedName.isBlank()) {
            return project.getTitle() + "模板";
        }
        return requestedName;
    }

    private ProjectVO toVO(Project project) {
        return ProjectVO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .genre(project.getGenre())
                .status(project.getStatus())
                .worldTemplateId(project.getWorldTemplateId())
                .coverUrl(project.getCoverUrl())
                .wordCount(project.getWordCount())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
