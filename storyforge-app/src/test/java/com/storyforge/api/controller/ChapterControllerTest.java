package com.storyforge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.vo.ChapterVO;
import com.storyforge.domain.vo.ChapterVersionVO;
import com.storyforge.service.IChapterService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
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

@WebMvcTest(ChapterController.class)
@ControllerSecurityTest
class ChapterControllerTest extends AuthenticatedControllerTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IChapterService chapterService;

    @Test
    void shouldRejectUnauthenticatedApprove() throws Exception {
        mockMvc.perform(post("/api/v1/projects/1/chapters/2/approve"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldRejectUnauthenticatedVersionList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/1/chapters/2/versions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldApproveChapter() throws Exception {
        when(chapterService.approveChapter(eq(USER_ID), eq(1L), eq(2L))).thenReturn(ChapterVO.builder()
                .id(2L)
                .projectId(1L)
                .chapterNumber(1)
                .title("Chapter 1")
                .content("approved content")
                .wordCount(1200)
                .status(StoryForgeConstants.CHAPTER_PUBLISHED)
                .createdAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                .updatedAt(LocalDateTime.of(2026, 3, 16, 12, 5))
                .build());

        mockMvc.perform(post("/api/v1/projects/1/chapters/2/approve").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value(StoryForgeConstants.CHAPTER_PUBLISHED));
    }

    @Test
    void shouldReturnChapterVersions() throws Exception {
        when(chapterService.listChapterVersions(eq(USER_ID), eq(1L), eq(2L))).thenReturn(List.of(
                ChapterVersionVO.builder()
                        .id(10L)
                        .chapterId(2L)
                        .versionNumber(2)
                        .content("version 2")
                        .source(StoryForgeConstants.SOURCE_USER_EDITED)
                        .createdAt(LocalDateTime.of(2026, 3, 16, 13, 0))
                        .updatedAt(LocalDateTime.of(2026, 3, 16, 13, 0))
                        .build(),
                ChapterVersionVO.builder()
                        .id(9L)
                        .chapterId(2L)
                        .versionNumber(1)
                        .content("version 1")
                        .source(StoryForgeConstants.SOURCE_USER_EDITED)
                        .createdAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                        .updatedAt(LocalDateTime.of(2026, 3, 16, 12, 0))
                        .build()));

        mockMvc.perform(get("/api/v1/projects/1/chapters/2/versions").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].versionNumber").value(2))
                .andExpect(jsonPath("$.data[1].versionNumber").value(1));
    }

    @Test
    void shouldRenderBusinessExceptionForApprove() throws Exception {
        when(chapterService.approveChapter(eq(USER_ID), eq(1L), eq(2L)))
                .thenThrow(new BusinessException(400, "章节正文不能为空"));

        mockMvc.perform(post("/api/v1/projects/1/chapters/2/approve").with(auth()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("章节正文不能为空"));
    }
}
