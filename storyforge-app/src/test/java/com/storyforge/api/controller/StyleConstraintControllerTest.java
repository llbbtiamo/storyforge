package com.storyforge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.domain.dto.StyleConstraintCreateRequest;
import com.storyforge.domain.vo.StyleConstraintVO;
import com.storyforge.service.IStyleConstraintService;
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

@WebMvcTest(StyleConstraintController.class)
@ControllerSecurityTest
class StyleConstraintControllerTest extends AuthenticatedControllerTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IStyleConstraintService styleConstraintService;

    @Test
    void shouldRejectUnauthenticatedStyleConstraintGet() throws Exception {
        mockMvc.perform(get("/api/v1/projects/1/style-constraint"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldReturnStyleConstraint() throws Exception {
        when(styleConstraintService.getStyleConstraint(eq(USER_ID), eq(1L))).thenReturn(StyleConstraintVO.builder()
                .id(3L)
                .projectId(1L)
                .narrativeVoice("第一人称")
                .writingStyle("古风")
                .tone("黑暗")
                .taboos(List.of("不要跳出视角"))
                .customRules(Map.of("pace", "slow"))
                .createdAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                .updatedAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                .build());

        mockMvc.perform(get("/api/v1/projects/1/style-constraint").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.narrativeVoice").value("第一人称"));
    }

    @Test
    void shouldValidateStyleConstraintCreateRequest() throws Exception {
        StyleConstraintCreateRequest request = new StyleConstraintCreateRequest();
        request.setNarrativeVoice("x".repeat(51));

        mockMvc.perform(post("/api/v1/projects/1/style-constraint")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }
}
