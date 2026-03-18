package com.storyforge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.domain.dto.ApplyWorldTemplateRequest;
import com.storyforge.domain.dto.CreateWorldTemplateFromProjectRequest;
import com.storyforge.domain.dto.ProjectCreateRequest;
import com.storyforge.domain.vo.ProjectVO;
import com.storyforge.domain.vo.WorldTemplateVO;
import com.storyforge.service.IProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProjectController.class)
@ControllerSecurityTest
class ProjectControllerTest extends AuthenticatedControllerTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IProjectService projectService;

    @Test
    void shouldRejectUnauthenticatedProjectList() throws Exception {
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldReturnCurrentUsersProjects() throws Exception {
        when(projectService.listProjectsByUser(eq(USER_ID))).thenReturn(List.of(ProjectVO.builder()
                .id(1L)
                .title("Test Project")
                .status(StoryForgeConstants.PROJECT_DRAFT)
                .wordCount(0)
                .createdAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                .updatedAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                .build()));

        mockMvc.perform(get("/api/v1/projects").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].title").value("Test Project"));
    }

    @Test
    void shouldValidateProjectCreateRequest() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest();
        request.setDescription("missing title");

        mockMvc.perform(post("/api/v1/projects")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void shouldRejectUnauthenticatedApplyWorldTemplate() throws Exception {
        mockMvc.perform(post("/api/v1/projects/1/world-template/apply"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldValidateApplyWorldTemplateRequest() throws Exception {
        ApplyWorldTemplateRequest request = new ApplyWorldTemplateRequest();
        request.setOverwriteExistingSettings(true);

        mockMvc.perform(post("/api/v1/projects/1/world-template/apply")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void shouldApplyWorldTemplate() throws Exception {
        when(projectService.applyWorldTemplate(eq(USER_ID), eq(1L), org.mockito.ArgumentMatchers.any(ApplyWorldTemplateRequest.class)))
                .thenReturn(ProjectVO.builder()
                        .id(1L)
                        .title("Test Project")
                        .status(StoryForgeConstants.PROJECT_DRAFT)
                        .worldTemplateId(2L)
                        .wordCount(0)
                        .createdAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                        .updatedAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                        .build());

        ApplyWorldTemplateRequest request = new ApplyWorldTemplateRequest();
        request.setWorldTemplateId(2L);
        request.setOverwriteExistingSettings(true);

        mockMvc.perform(post("/api/v1/projects/1/world-template/apply")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.worldTemplateId").value(2));
    }

    @Test
    void shouldRejectUnauthenticatedCreateWorldTemplateFromProject() throws Exception {
        mockMvc.perform(post("/api/v1/projects/1/world-template"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldValidateCreateWorldTemplateFromProjectRequest() throws Exception {
        CreateWorldTemplateFromProjectRequest request = new CreateWorldTemplateFromProjectRequest();
        request.setName("x".repeat(101));

        mockMvc.perform(post("/api/v1/projects/1/world-template")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void shouldCreateWorldTemplateFromProject() throws Exception {
        when(projectService.createWorldTemplateFromProject(eq(USER_ID), eq(1L), org.mockito.ArgumentMatchers.any(CreateWorldTemplateFromProjectRequest.class)))
                .thenReturn(WorldTemplateVO.builder()
                        .id(2L)
                        .name("快照模板")
                        .description("snapshot")
                        .isPublic(false)
                        .createdAt(LocalDateTime.of(2026, 3, 17, 12, 0))
                        .updatedAt(LocalDateTime.of(2026, 3, 17, 12, 0))
                        .build());

        CreateWorldTemplateFromProjectRequest request = new CreateWorldTemplateFromProjectRequest();
        request.setName("快照模板");
        request.setDescription("snapshot");

        mockMvc.perform(post("/api/v1/projects/1/world-template")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("快照模板"))
                .andExpect(jsonPath("$.data.isPublic").value(false));
    }

    @Test
    void shouldAllowCreateWorldTemplateFromProjectWithoutName() throws Exception {
        when(projectService.createWorldTemplateFromProject(eq(USER_ID), eq(1L), org.mockito.ArgumentMatchers.any(CreateWorldTemplateFromProjectRequest.class)))
                .thenReturn(WorldTemplateVO.builder()
                        .id(2L)
                        .name("Test Project模板")
                        .description("snapshot")
                        .isPublic(false)
                        .createdAt(LocalDateTime.of(2026, 3, 17, 12, 0))
                        .updatedAt(LocalDateTime.of(2026, 3, 17, 12, 0))
                        .build());

        CreateWorldTemplateFromProjectRequest request = new CreateWorldTemplateFromProjectRequest();
        request.setDescription("snapshot");

        mockMvc.perform(post("/api/v1/projects/1/world-template")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("Test Project模板"));
    }
}
