package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.WorldSettingCreateRequest;
import com.storyforge.domain.entity.Project;
import com.storyforge.domain.entity.WorldSetting;
import com.storyforge.domain.entity.WorldTemplate;
import com.storyforge.service.IProjectService;
import com.storyforge.service.IWorldTemplateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorldSettingServiceImplTest {

    private static final Long USER_ID = 1L;
    private static final Long TEMPLATE_ID = 10L;
    private static final Long PROJECT_ID = 20L;
    private static final Long SETTING_ID = 30L;

    @Mock
    private IProjectService projectService;

    @Mock
    private IWorldTemplateService worldTemplateService;

    private WorldSettingServiceImpl service;

    @BeforeEach
    void setUp() {
        service = spy(new WorldSettingServiceImpl(projectService, worldTemplateService));
    }

    @Test
    void shouldCreateTemplateWorldSettingWithTemplateId() {
        WorldSettingCreateRequest request = new WorldSettingCreateRequest();
        request.setCategory("势力");
        request.setName("宗门");
        request.setContent(Map.of("rank", "A"));
        request.setSortOrder(1);

        when(worldTemplateService.getOwnedWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doReturn(true).when(service).save(any(WorldSetting.class));
        doReturn(templateSetting()).when(service).getOne(any(LambdaQueryWrapper.class));

        var result = service.createTemplateWorldSetting(USER_ID, TEMPLATE_ID, request);

        assertEquals(TEMPLATE_ID, result.getTemplateId());
        assertNull(result.getProjectId());
    }

    @Test
    void shouldRejectApplyWhenTemplateHasNoSettings() {
        when(projectService.getOwnedProjectOrThrow(USER_ID, PROJECT_ID)).thenReturn(project());
        when(worldTemplateService.getAccessibleWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doReturn(List.of()).when(service).list(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.copyTemplateSettingsToProject(USER_ID, TEMPLATE_ID, PROJECT_ID, false));

        assertEquals(400, ex.getCode());
        assertEquals("世界模板暂无可应用的设定", ex.getMessage());
        verify(service, never()).saveBatch(any());
    }

    @Test
    void shouldRejectApplyWhenProjectAlreadyHasSettingsWithoutOverwrite() {
        when(projectService.getOwnedProjectOrThrow(USER_ID, PROJECT_ID)).thenReturn(project());
        when(worldTemplateService.getAccessibleWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doReturn(List.of(templateSetting())).when(service).list(any(LambdaQueryWrapper.class));
        doReturn(1L).when(service).count(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.copyTemplateSettingsToProject(USER_ID, TEMPLATE_ID, PROJECT_ID, false));

        assertEquals(400, ex.getCode());
        assertEquals("项目已有世界观设定，请确认是否覆盖", ex.getMessage());
        verify(service, never()).remove(any(LambdaQueryWrapper.class));
    }

    @Test
    void shouldCopyTemplateSettingsToProjectWhenOverwriteEnabled() {
        when(projectService.getOwnedProjectOrThrow(USER_ID, PROJECT_ID)).thenReturn(project());
        when(worldTemplateService.getAccessibleWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doReturn(List.of(templateSetting())).when(service).list(any(LambdaQueryWrapper.class));
        doReturn(1L).when(service).count(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).remove(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).saveBatch(any());

        service.copyTemplateSettingsToProject(USER_ID, TEMPLATE_ID, PROJECT_ID, true);

        ArgumentCaptor<List<WorldSetting>> settingsCaptor = ArgumentCaptor.forClass(List.class);
        verify(service).saveBatch(settingsCaptor.capture());
        List<WorldSetting> copiedSettings = settingsCaptor.getValue();

        assertEquals(1, copiedSettings.size());
        assertEquals(PROJECT_ID, copiedSettings.get(0).getProjectId());
        assertNull(copiedSettings.get(0).getTemplateId());
        verify(service).remove(any(LambdaQueryWrapper.class));
        verify(service).saveBatch(any());
    }

    @Test
    void shouldRejectCreateTemplateFromProjectWhenProjectHasNoSettings() {
        when(projectService.getOwnedProjectOrThrow(USER_ID, PROJECT_ID)).thenReturn(project());
        when(worldTemplateService.getOwnedWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doReturn(List.of()).when(service).list(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.copyProjectSettingsToTemplate(USER_ID, PROJECT_ID, TEMPLATE_ID));

        assertEquals(400, ex.getCode());
        assertEquals("项目暂无可沉淀的世界观设定", ex.getMessage());
        verify(service, never()).saveBatch(any());
    }

    @Test
    void shouldCopyProjectSettingsToTemplate() {
        when(projectService.getOwnedProjectOrThrow(USER_ID, PROJECT_ID)).thenReturn(project());
        when(worldTemplateService.getOwnedWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        doReturn(List.of(projectSetting())).when(service).list(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).saveBatch(any());

        service.copyProjectSettingsToTemplate(USER_ID, PROJECT_ID, TEMPLATE_ID);

        ArgumentCaptor<List<WorldSetting>> settingsCaptor = ArgumentCaptor.forClass(List.class);
        verify(service).saveBatch(settingsCaptor.capture());
        List<WorldSetting> copiedSettings = settingsCaptor.getValue();

        assertEquals(1, copiedSettings.size());
        assertNull(copiedSettings.get(0).getProjectId());
        assertEquals(TEMPLATE_ID, copiedSettings.get(0).getTemplateId());
        verify(service).saveBatch(any());
    }

    @Test
    void shouldDefensivelyCopyProjectSettingContentWhenCreatingTemplate() {
        when(projectService.getOwnedProjectOrThrow(USER_ID, PROJECT_ID)).thenReturn(project());
        when(worldTemplateService.getOwnedWorldTemplateOrThrow(USER_ID, TEMPLATE_ID)).thenReturn(template());
        WorldSetting setting = projectSetting();
        doReturn(List.of(setting)).when(service).list(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).saveBatch(any());

        service.copyProjectSettingsToTemplate(USER_ID, PROJECT_ID, TEMPLATE_ID);

        ArgumentCaptor<List<WorldSetting>> settingsCaptor = ArgumentCaptor.forClass(List.class);
        verify(service).saveBatch(settingsCaptor.capture());
        List<WorldSetting> copiedSettings = settingsCaptor.getValue();

        assertEquals(false, copiedSettings.get(0).getContent() == setting.getContent());
        assertEquals(setting.getContent(), copiedSettings.get(0).getContent());
    }

    private WorldTemplate template() {
        WorldTemplate template = new WorldTemplate();
        template.setId(TEMPLATE_ID);
        template.setUserId(USER_ID);
        return template;
    }

    private WorldSetting templateSetting() {
        WorldSetting setting = new WorldSetting();
        setting.setId(SETTING_ID);
        setting.setTemplateId(TEMPLATE_ID);
        setting.setProjectId(null);
        setting.setCategory("势力");
        setting.setName("宗门");
        setting.setContent(Map.of("rank", "A"));
        setting.setSortOrder(1);
        return setting;
    }

    private WorldSetting projectSetting() {
        WorldSetting setting = new WorldSetting();
        setting.setId(SETTING_ID + 1);
        setting.setProjectId(PROJECT_ID);
        setting.setTemplateId(null);
        setting.setCategory("地理");
        setting.setName("中州");
        setting.setContent(new HashMap<>(Map.of("size", "large")));
        setting.setSortOrder(0);
        return setting;
    }

    private Project project() {
        Project project = new Project();
        project.setId(PROJECT_ID);
        project.setUserId(USER_ID);
        return project;
    }
}
