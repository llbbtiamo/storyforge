package com.storyforge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyforge.domain.dto.WorldSettingCreateRequest;
import com.storyforge.domain.vo.WorldSettingVO;
import com.storyforge.service.IWorldSettingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WorldTemplateWorldSettingController.class)
@ControllerSecurityTest
class WorldTemplateWorldSettingControllerTest extends AuthenticatedControllerTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IWorldSettingService worldSettingService;

    @Test
    void shouldRejectUnauthenticatedTemplateWorldSettingsList() throws Exception {
        mockMvc.perform(get("/api/v1/world-templates/1/world-settings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldReturnTemplateWorldSettings() throws Exception {
        when(worldSettingService.listTemplateWorldSettings(eq(USER_ID), eq(1L))).thenReturn(List.of(WorldSettingVO.builder()
                .id(2L)
                .templateId(1L)
                .category("势力")
                .name("宗门")
                .content(Map.of("rank", "A"))
                .sortOrder(0)
                .createdAt(LocalDateTime.of(2026, 3, 17, 10, 0))
                .updatedAt(LocalDateTime.of(2026, 3, 17, 10, 0))
                .build()));

        mockMvc.perform(get("/api/v1/world-templates/1/world-settings").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].name").value("宗门"));
    }

    @Test
    void shouldValidateTemplateWorldSettingCreateRequest() throws Exception {
        WorldSettingCreateRequest request = new WorldSettingCreateRequest();
        request.setCategory("势力");

        mockMvc.perform(post("/api/v1/world-templates/1/world-settings")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }
}
