package com.storyforge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.domain.dto.CharacterCreateRequest;
import com.storyforge.domain.vo.CharacterVO;
import com.storyforge.service.ICharacterService;
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

@WebMvcTest(CharacterController.class)
@ControllerSecurityTest
class CharacterControllerTest extends AuthenticatedControllerTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ICharacterService characterService;

    @Test
    void shouldRejectUnauthenticatedCharacterList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/1/characters"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldReturnProjectCharacters() throws Exception {
        when(characterService.listCharacters(eq(USER_ID), eq(1L))).thenReturn(List.of(CharacterVO.builder()
                .id(2L)
                .projectId(1L)
                .name("Alice")
                .roleType(StoryForgeConstants.ROLE_PROTAGONIST)
                .basicInfo(Map.of("age", 18))
                .sortOrder(0)
                .createdAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                .updatedAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                .build()));

        mockMvc.perform(get("/api/v1/projects/1/characters").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].name").value("Alice"));
    }

    @Test
    void shouldValidateCharacterCreateRequest() throws Exception {
        CharacterCreateRequest request = new CharacterCreateRequest();
        request.setRoleType(StoryForgeConstants.ROLE_PROTAGONIST);

        mockMvc.perform(post("/api/v1/projects/1/characters")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }
}
