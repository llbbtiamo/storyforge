package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.ChapterCreateRequest;
import com.storyforge.domain.dto.ChapterUpdateRequest;
import com.storyforge.domain.entity.Chapter;
import com.storyforge.domain.entity.ChapterVersion;
import com.storyforge.domain.entity.Project;
import com.storyforge.service.IPlotOutlineService;
import com.storyforge.service.IProjectService;
import com.storyforge.mapper.ChapterVersionMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterServiceImplTest {

    private static final Long USER_ID = 1L;
    private static final Long PROJECT_ID = 10L;
    private static final Long CHAPTER_ID = 100L;
    private static final Long OUTLINE_ID = 101L;

    @Mock
    private IProjectService projectService;

    @Mock
    private IPlotOutlineService plotOutlineService;

    @Mock
    private ChapterVersionMapper chapterVersionMapper;

    private ChapterServiceImpl service;

    @BeforeEach
    void setUp() {
        service = spy(new ChapterServiceImpl(projectService, plotOutlineService, chapterVersionMapper));
    }

    @Test
    void shouldRejectCreateWhenOutlineIsOutsideProject() {
        ChapterCreateRequest request = createRequest(OUTLINE_ID, 1, StoryForgeConstants.CHAPTER_DRAFT, "content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        when(plotOutlineService.getProjectPlotOutlineOrThrow(PROJECT_ID, OUTLINE_ID))
                .thenThrow(new BusinessException(404, "剧情大纲不存在"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createChapter(USER_ID, PROJECT_ID, request));

        assertEquals(404, ex.getCode());
        assertEquals("剧情大纲不存在", ex.getMessage());
        verify(service, never()).save(any(Chapter.class));
    }

    @Test
    void shouldRejectUpdateWhenOutlineIsOutsideProject() {
        ChapterUpdateRequest request = updateRequest(OUTLINE_ID, 2, StoryForgeConstants.CHAPTER_DRAFT, "content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(chapter(CHAPTER_ID, null, 1, StoryForgeConstants.CHAPTER_DRAFT, "content"))
                .when(service).getOne(any(LambdaQueryWrapper.class));
        when(plotOutlineService.getProjectPlotOutlineOrThrow(PROJECT_ID, OUTLINE_ID))
                .thenThrow(new BusinessException(404, "剧情大纲不存在"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.updateChapter(USER_ID, PROJECT_ID, CHAPTER_ID, request));

        assertEquals(404, ex.getCode());
        assertEquals("剧情大纲不存在", ex.getMessage());
        verify(service, never()).updateById(any(Chapter.class));
    }

    @Test
    void shouldAllowCreateWhenOutlineIdIsNull() {
        ChapterCreateRequest request = createRequest(null, 1, StoryForgeConstants.CHAPTER_DRAFT, "content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(0L).when(service).count(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).save(any(Chapter.class));
        doReturn(chapter(CHAPTER_ID, null, 1, StoryForgeConstants.CHAPTER_DRAFT, "content"))
                .when(service).getOne(any(LambdaQueryWrapper.class));

        var result = service.createChapter(USER_ID, PROJECT_ID, request);

        assertEquals(CHAPTER_ID, result.getId());
        assertNull(result.getOutlineId());
        verify(service).save(any(Chapter.class));
        verify(plotOutlineService, never()).getProjectPlotOutlineOrThrow(any(), any());
    }

    @Test
    void shouldAllowUpdateWhenOutlineIdIsNull() {
        ChapterUpdateRequest request = updateRequest(null, 2, StoryForgeConstants.CHAPTER_DRAFT, "content");

        Chapter existing = chapter(CHAPTER_ID, OUTLINE_ID, 1, StoryForgeConstants.CHAPTER_DRAFT, "content");
        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(existing).when(service).getOne(any(LambdaQueryWrapper.class));
        doReturn(0L).when(service).count(any(LambdaQueryWrapper.class));
        doReturn(true).when(service).updateById(any(Chapter.class));

        var result = service.updateChapter(USER_ID, PROJECT_ID, CHAPTER_ID, request);

        assertEquals(CHAPTER_ID, result.getId());
        assertNull(result.getOutlineId());
        assertEquals(2, result.getChapterNumber());
        verify(service).updateById(any(Chapter.class));
        verify(plotOutlineService, never()).getProjectPlotOutlineOrThrow(any(), any());
    }

    @Test
    void shouldRejectCreateWhenChapterNumberAlreadyExistsInProject() {
        ChapterCreateRequest request = createRequest(null, 1, StoryForgeConstants.CHAPTER_DRAFT, "content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(1L).when(service).count(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createChapter(USER_ID, PROJECT_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("章节序号已存在", ex.getMessage());
        verify(service, never()).save(any(Chapter.class));
    }

    @Test
    void shouldRejectUpdateWhenChapterNumberAlreadyExistsInProject() {
        ChapterUpdateRequest request = updateRequest(null, 2, StoryForgeConstants.CHAPTER_DRAFT, "content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(chapter(CHAPTER_ID, null, 1, StoryForgeConstants.CHAPTER_DRAFT, "content"))
                .when(service).getOne(any(LambdaQueryWrapper.class));
        doReturn(1L).when(service).count(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.updateChapter(USER_ID, PROJECT_ID, CHAPTER_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("章节序号已存在", ex.getMessage());
        verify(service, never()).updateById(any(Chapter.class));
    }

    @Test
    void shouldRejectCreateWhenStatusIsPublished() {
        ChapterCreateRequest request = createRequest(null, 1, StoryForgeConstants.CHAPTER_PUBLISHED, "content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createChapter(USER_ID, PROJECT_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("不能通过普通编辑直接发布章节", ex.getMessage());
        verify(service, never()).save(any(Chapter.class));
    }

    @Test
    void shouldRejectUpdateWhenStatusIsPublished() {
        ChapterUpdateRequest request = updateRequest(null, 1, StoryForgeConstants.CHAPTER_PUBLISHED, "content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(chapter(CHAPTER_ID, null, 1, StoryForgeConstants.CHAPTER_DRAFT, "content"))
                .when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.updateChapter(USER_ID, PROJECT_ID, CHAPTER_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("不能通过普通编辑直接发布章节", ex.getMessage());
        verify(service, never()).updateById(any(Chapter.class));
    }

    @Test
    void shouldApproveChapterAndCreateFirstVersion() {
        Chapter chapter = chapter(CHAPTER_ID, null, 1, StoryForgeConstants.CHAPTER_REVIEW, "approved content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(chapter).when(service).getOne(any(LambdaQueryWrapper.class));
        when(chapterVersionMapper.selectMaxVersionNumberByChapterId(CHAPTER_ID)).thenReturn(null);
        when(chapterVersionMapper.insert(any(ChapterVersion.class))).thenReturn(1);
        doReturn(true).when(service).updateById(any(Chapter.class));

        var result = service.approveChapter(USER_ID, PROJECT_ID, CHAPTER_ID);

        assertEquals(StoryForgeConstants.CHAPTER_PUBLISHED, result.getStatus());
        ArgumentCaptor<ChapterVersion> versionCaptor = ArgumentCaptor.forClass(ChapterVersion.class);
        verify(chapterVersionMapper).insert(versionCaptor.capture());
        ChapterVersion version = versionCaptor.getValue();
        assertEquals(CHAPTER_ID, version.getChapterId());
        assertEquals(1, version.getVersionNumber());
        assertEquals("approved content", version.getContent());
        assertEquals(StoryForgeConstants.SOURCE_USER_EDITED, version.getSource());
        assertNull(version.getGenerationParams());
    }

    @Test
    void shouldIncreaseVersionNumberOnRepeatedApprove() {
        Chapter chapter = chapter(CHAPTER_ID, null, 1, StoryForgeConstants.CHAPTER_REVIEW, "approved content");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(chapter).when(service).getOne(any(LambdaQueryWrapper.class));
        when(chapterVersionMapper.selectMaxVersionNumberByChapterId(CHAPTER_ID)).thenReturn(null, 1);
        when(chapterVersionMapper.insert(any(ChapterVersion.class))).thenReturn(1);
        doReturn(true).when(service).updateById(any(Chapter.class));

        service.approveChapter(USER_ID, PROJECT_ID, CHAPTER_ID);
        service.approveChapter(USER_ID, PROJECT_ID, CHAPTER_ID);

        ArgumentCaptor<ChapterVersion> versionCaptor = ArgumentCaptor.forClass(ChapterVersion.class);
        verify(chapterVersionMapper, times(2)).insert(versionCaptor.capture());
        List<ChapterVersion> versions = versionCaptor.getAllValues();
        assertEquals(1, versions.get(0).getVersionNumber());
        assertEquals(2, versions.get(1).getVersionNumber());
    }

    @Test
    void shouldRejectApproveWhenContentIsBlank() {
        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(chapter(CHAPTER_ID, null, 1, StoryForgeConstants.CHAPTER_REVIEW, "   "))
                .when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.approveChapter(USER_ID, PROJECT_ID, CHAPTER_ID));

        assertEquals(400, ex.getCode());
        assertEquals("章节正文不能为空", ex.getMessage());
        verify(chapterVersionMapper, never()).insert(any(ChapterVersion.class));
        verify(service, never()).updateById(any(Chapter.class));
    }

    @Test
    void shouldRejectApproveWhenChapterIsOutsideProject() {
        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(null).when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.approveChapter(USER_ID, PROJECT_ID, CHAPTER_ID));

        assertEquals(404, ex.getCode());
        assertEquals("章节不存在", ex.getMessage());
        verify(chapterVersionMapper, never()).insert(any(ChapterVersion.class));
    }

    @Test
    void shouldRejectVersionListWhenChapterIsOutsideProject() {
        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(null).when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.listChapterVersions(USER_ID, PROJECT_ID, CHAPTER_ID));

        assertEquals(404, ex.getCode());
        assertEquals("章节不存在", ex.getMessage());
        verify(chapterVersionMapper, never()).selectList(any(LambdaQueryWrapper.class));
    }

    private ChapterCreateRequest createRequest(Long outlineId, Integer chapterNumber, String status, String content) {
        ChapterCreateRequest request = new ChapterCreateRequest();
        request.setOutlineId(outlineId);
        request.setChapterNumber(chapterNumber);
        request.setTitle("Chapter " + chapterNumber);
        request.setContent(content);
        request.setStatus(status);
        request.setWordCount(0);
        request.setAiModelUsed("model");
        return request;
    }

    private ChapterUpdateRequest updateRequest(Long outlineId, Integer chapterNumber, String status, String content) {
        ChapterUpdateRequest request = new ChapterUpdateRequest();
        request.setOutlineId(outlineId);
        request.setChapterNumber(chapterNumber);
        request.setTitle("Chapter " + chapterNumber);
        request.setContent(content);
        request.setStatus(status);
        request.setWordCount(0);
        request.setAiModelUsed("model");
        return request;
    }

    private Project project() {
        Project project = new Project();
        project.setId(PROJECT_ID);
        project.setUserId(USER_ID);
        return project;
    }

    private Chapter chapter(Long chapterId, Long outlineId, Integer chapterNumber, String status, String content) {
        Chapter chapter = new Chapter();
        chapter.setId(chapterId);
        chapter.setProjectId(PROJECT_ID);
        chapter.setOutlineId(outlineId);
        chapter.setChapterNumber(chapterNumber);
        chapter.setTitle("Chapter-" + chapterId);
        chapter.setContent(content);
        chapter.setWordCount(0);
        chapter.setStatus(status);
        chapter.setAiModelUsed("model");
        return chapter;
    }
}
