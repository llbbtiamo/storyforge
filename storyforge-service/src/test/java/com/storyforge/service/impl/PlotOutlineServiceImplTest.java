package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.PlotOutlineCreateRequest;
import com.storyforge.domain.dto.PlotOutlineUpdateRequest;
import com.storyforge.domain.entity.PlotOutline;
import com.storyforge.domain.entity.Project;
import com.storyforge.service.IProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

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
class PlotOutlineServiceImplTest {

    private static final Long USER_ID = 1L;
    private static final Long PROJECT_ID = 10L;
    private static final Long OUTLINE_ID = 100L;
    private static final Long PARENT_ID = 101L;

    @Mock
    private IProjectService projectService;

    private PlotOutlineServiceImpl service;

    @BeforeEach
    void setUp() {
        service = spy(new PlotOutlineServiceImpl(projectService));
    }

    @Test
    void shouldRejectCreateWhenParentOutlineIsOutsideProject() {
        PlotOutlineCreateRequest request = new PlotOutlineCreateRequest();
        request.setParentId(PARENT_ID);
        request.setTitle("Act 1");
        request.setKeyEvents(List.of("event"));

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(null).when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createPlotOutline(USER_ID, PROJECT_ID, request));

        assertEquals(404, ex.getCode());
        assertEquals("剧情大纲不存在", ex.getMessage());
        verify(service, never()).save(any(PlotOutline.class));
    }

    @Test
    void shouldRejectUpdateWhenParentOutlineIsOutsideProject() {
        PlotOutlineUpdateRequest request = new PlotOutlineUpdateRequest();
        request.setParentId(PARENT_ID);
        request.setTitle("Act 2");
        request.setKeyEvents(List.of("event"));

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(outline(OUTLINE_ID, null)).doReturn(null).when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.updatePlotOutline(USER_ID, PROJECT_ID, OUTLINE_ID, request));

        assertEquals(404, ex.getCode());
        assertEquals("剧情大纲不存在", ex.getMessage());
        verify(service, never()).updateById(any(PlotOutline.class));
    }

    @Test
    void shouldAllowCreateWhenParentIdIsNull() {
        PlotOutlineCreateRequest request = new PlotOutlineCreateRequest();
        request.setParentId(null);
        request.setTitle("Root Outline");
        request.setSummary("summary");
        request.setKeyEvents(List.of("event"));

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(true).when(service).save(any(PlotOutline.class));
        doReturn(outline(OUTLINE_ID, null)).when(service).getOne(any(LambdaQueryWrapper.class));

        var result = service.createPlotOutline(USER_ID, PROJECT_ID, request);

        assertEquals(OUTLINE_ID, result.getId());
        assertNull(result.getParentId());
        verify(service).save(any(PlotOutline.class));
    }

    @Test
    void shouldAllowUpdateWhenParentIdIsNull() {
        PlotOutlineUpdateRequest request = new PlotOutlineUpdateRequest();
        request.setParentId(null);
        request.setTitle("Updated Root Outline");
        request.setSummary("summary");
        request.setKeyEvents(List.of("event"));

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(outline(OUTLINE_ID, 999L)).when(service).getOne(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).updateById(any(PlotOutline.class));

        var result = service.updatePlotOutline(USER_ID, PROJECT_ID, OUTLINE_ID, request);

        assertEquals(OUTLINE_ID, result.getId());
        assertNull(result.getParentId());
        verify(service).updateById(any(PlotOutline.class));
    }

    private Project project() {
        Project project = new Project();
        project.setId(PROJECT_ID);
        project.setUserId(USER_ID);
        return project;
    }

    private PlotOutline outline(Long outlineId, Long parentId) {
        PlotOutline outline = new PlotOutline();
        outline.setId(outlineId);
        outline.setProjectId(PROJECT_ID);
        outline.setParentId(parentId);
        outline.setTitle("Outline-" + outlineId);
        outline.setSummary("summary");
        outline.setKeyEvents(List.of("event"));
        outline.setLevel(1);
        outline.setSortOrder(0);
        return outline;
    }
}
