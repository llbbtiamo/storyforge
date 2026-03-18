package com.storyforge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.WorldTemplateCreateRequest;
import com.storyforge.domain.vo.WorldTemplateVO;
import com.storyforge.service.IWorldTemplateService;
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

@WebMvcTest(WorldTemplateController.class)
@ControllerSecurityTest
class WorldTemplateControllerTest extends AuthenticatedControllerTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IWorldTemplateService worldTemplateService;

    @Test
    void shouldRejectUnauthenticatedTemplateList() throws Exception {
        mockMvc.perform(get("/api/v1/world-templates"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldReturnWorldTemplates() throws Exception {
        when(worldTemplateService.listWorldTemplates(eq(USER_ID))).thenReturn(List.of(WorldTemplateVO.builder()
                .id(1L)
                .name("玄幻模板")
                .description("desc")
                .isPublic(false)
                .createdAt(LocalDateTime.of(2026, 3, 17, 10, 0))
                .updatedAt(LocalDateTime.of(2026, 3, 17, 10, 0))
                .build()));

        mockMvc.perform(get("/api/v1/world-templates").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].name").value("玄幻模板"));
    }

    @Test
    void shouldValidateTemplateCreateRequest() throws Exception {
        WorldTemplateCreateRequest request = new WorldTemplateCreateRequest();
        request.setDescription("missing name");

        mockMvc.perform(post("/api/v1/world-templates")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void shouldRenderBusinessExceptionForDelete() throws Exception {
        when(worldTemplateService.deleteWorldTemplate(eq(USER_ID), eq(1L)))
                .thenThrow(new BusinessException(400, "世界模板已被项目使用，无法删除"));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/v1/world-templates/1").with(auth()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("世界模板已被项目使用，无法删除"));
    }
}
