package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.ApplyWorldTemplateRequest;
import com.storyforge.domain.dto.CreateWorldTemplateFromProjectRequest;
import com.storyforge.domain.dto.ProjectCreateRequest;
import com.storyforge.domain.dto.ProjectUpdateRequest;
import com.storyforge.domain.dto.WorldTemplateCreateRequest;
import com.storyforge.domain.entity.Project;
import com.storyforge.domain.entity.WorldTemplate;
import com.storyforge.domain.vo.WorldTemplateVO;
import com.storyforge.service.IWorldSettingService;
import com.storyforge.service.IWorldTemplateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    private static final Long USER_ID = 1L;
    private static final Long PROJECT_ID = 10L;
    private static final Long TEMPLATE_ID = 20L;

    @Mock
    private IWorldTemplateService worldTemplateService;

    @Mock
    private IWorldSettingService worldSettingService;

    private ProjectServiceImpl service;

    @BeforeEach
    void setUp() {
        service = spy(new ProjectServiceImpl(worldTemplateService, worldSettingService));
    }

    @Test
    void shouldRejectProjectStatusWhenInvalid() {
        ProjectCreateRequest request = new ProjectCreateRequest();
        request.setTitle("Novel");
        request.setStatus("BROKEN");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createProject(USER_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("项目状态不合法", ex.getMessage());
    }

    @Test
    void shouldRejectTemplateSwitchThroughUpdateProject() {
        ProjectUpdateRequest request = new ProjectUpdateRequest();
        request.setTitle("Novel");
        request.setStatus(StoryForgeConstants.PROJECT_DRAFT);
        request.setWorldTemplateId(TEMPLATE_ID + 1);

        doReturn(project(TEMPLATE_ID)).when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.updateProject(USER_ID, PROJECT_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("请通过应用模板接口切换世界模板", ex.getMessage());
    }

    @Test
    void shouldApplyTemplateToProject() {
        ApplyWorldTemplateRequest request = new ApplyWorldTemplateRequest();
        request.setWorldTemplateId(TEMPLATE_ID);
        request.setOverwriteExistingSettings(true);

        when(worldTemplateService.getAccessibleWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doNothing().when(worldSettingService).copyTemplateSettingsToProject(USER_ID, TEMPLATE_ID, PROJECT_ID, true);
        doReturn(project(null)).doReturn(project(TEMPLATE_ID)).when(service).getOne(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).updateById(any(Project.class));

        var result = service.applyWorldTemplate(USER_ID, PROJECT_ID, request);

        assertEquals(TEMPLATE_ID, result.getWorldTemplateId());
        verify(worldSettingService).copyTemplateSettingsToProject(USER_ID, TEMPLATE_ID, PROJECT_ID, true);
    }

    @Test
    void shouldApplyTemplateDuringProjectCreate() {
        ProjectCreateRequest request = new ProjectCreateRequest();
        request.setTitle("Novel");
        request.setStatus(StoryForgeConstants.PROJECT_DRAFT);
        request.setWorldTemplateId(TEMPLATE_ID);

        when(worldTemplateService.getAccessibleWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doNothing().when(worldSettingService).copyTemplateSettingsToProject(USER_ID, TEMPLATE_ID, PROJECT_ID, false);
        org.mockito.Mockito.doAnswer(invocation -> {
            Project savedProject = invocation.getArgument(0);
            savedProject.setId(PROJECT_ID);
            return true;
        }).when(service).save(any(Project.class));
        doReturn(true).when(service).updateById(any(Project.class));

        var result = service.createProject(USER_ID, request);

        assertEquals(TEMPLATE_ID, result.getWorldTemplateId());
        verify(worldSettingService).copyTemplateSettingsToProject(USER_ID, TEMPLATE_ID, PROJECT_ID, false);
    }

    @Test
    void shouldCreatePrivateTemplateFromProjectWithoutChangingProjectTemplateBinding() {
        CreateWorldTemplateFromProjectRequest request = new CreateWorldTemplateFromProjectRequest();
        request.setName("快照模板");
        request.setDescription("snapshot");

        when(worldTemplateService.createWorldTemplate(eq(USER_ID), any(WorldTemplateCreateRequest.class)))
                .thenReturn(WorldTemplateVO.builder()
                        .id(TEMPLATE_ID)
                        .name("快照模板")
                        .description("snapshot")
                        .isPublic(false)
                        .build());
        doReturn(project(999L)).when(service).getOne(any(LambdaQueryWrapper.class));
        doNothing().when(worldSettingService).copyProjectSettingsToTemplate(USER_ID, PROJECT_ID, TEMPLATE_ID);

        var result = service.createWorldTemplateFromProject(USER_ID, PROJECT_ID, request);

        assertEquals(TEMPLATE_ID, result.getId());
        assertEquals(Boolean.FALSE, result.getIsPublic());
        verify(worldSettingService).copyProjectSettingsToTemplate(USER_ID, PROJECT_ID, TEMPLATE_ID);
    }

    @Test
    void shouldDefaultTemplateNameWhenMissing() {
        CreateWorldTemplateFromProjectRequest request = new CreateWorldTemplateFromProjectRequest();
        request.setDescription("snapshot");

        when(worldTemplateService.createWorldTemplate(eq(USER_ID), any(WorldTemplateCreateRequest.class)))
                .thenReturn(WorldTemplateVO.builder()
                        .id(TEMPLATE_ID)
                        .name("Novel模板")
                        .description("snapshot")
                        .isPublic(false)
                        .build());
        doReturn(project(999L)).when(service).getOne(any(LambdaQueryWrapper.class));
        doNothing().when(worldSettingService).copyProjectSettingsToTemplate(USER_ID, PROJECT_ID, TEMPLATE_ID);

        var result = service.createWorldTemplateFromProject(USER_ID, PROJECT_ID, request);

        assertEquals("Novel模板", result.getName());
        verify(worldTemplateService).createWorldTemplate(eq(USER_ID), any(WorldTemplateCreateRequest.class));
    }

    private Project project(Long worldTemplateId) {
        Project project = new Project();
        project.setId(PROJECT_ID);
        project.setUserId(USER_ID);
        project.setTitle("Novel");
        project.setStatus(StoryForgeConstants.PROJECT_DRAFT);
        project.setWorldTemplateId(worldTemplateId);
        project.setWordCount(0);
        return project;
    }

    private WorldTemplate template() {
        WorldTemplate template = new WorldTemplate();
        template.setId(TEMPLATE_ID);
        template.setUserId(USER_ID);
        template.setName("模板");
        template.setIsPublic(false);
        return template;
    }
}
