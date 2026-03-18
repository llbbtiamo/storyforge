package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.ChapterCreateRequest;
import com.storyforge.domain.dto.ChapterUpdateRequest;
import com.storyforge.domain.entity.Chapter;
import com.storyforge.domain.entity.ChapterVersion;
import com.storyforge.domain.vo.ChapterVO;
import com.storyforge.domain.vo.ChapterVersionVO;
import com.storyforge.mapper.ChapterMapper;
import com.storyforge.mapper.ChapterVersionMapper;
import com.storyforge.service.IChapterService;
import com.storyforge.service.IPlotOutlineService;
import com.storyforge.service.IProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl extends ServiceImpl<ChapterMapper, Chapter> implements IChapterService {

    private static final Set<String> EDITABLE_CHAPTER_STATUSES = Set.of(
            StoryForgeConstants.CHAPTER_DRAFT,
            StoryForgeConstants.CHAPTER_GENERATING,
            StoryForgeConstants.CHAPTER_REVIEW);

    private final IProjectService projectService;
    private final IPlotOutlineService plotOutlineService;
    private final ChapterVersionMapper chapterVersionMapper;

    @Override
    public List<ChapterVO> listChapters(Long userId, Long projectId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        return list(new LambdaQueryWrapper<Chapter>()
                .eq(Chapter::getProjectId, projectId)
                .orderByAsc(Chapter::getChapterNumber)
                .orderByAsc(Chapter::getId)).stream().map(this::toVO).toList();
    }

    @Override
    public ChapterVO getChapter(Long userId, Long projectId, Long chapterId) {
        return toVO(getOwnedChapterOrThrow(userId, projectId, chapterId));
    }

    @Override
    public ChapterVO createChapter(Long userId, Long projectId, ChapterCreateRequest request) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        Chapter chapter = new Chapter();
        chapter.setProjectId(projectId);
        apply(chapter, request);
        validateOutlineIdInProject(projectId, chapter.getOutlineId());
        validateChapterNumberUnique(projectId, chapter.getChapterNumber(), null);
        save(chapter);
        return getChapter(userId, projectId, chapter.getId());
    }

    @Override
    public ChapterVO updateChapter(Long userId, Long projectId, Long chapterId, ChapterUpdateRequest request) {
        Chapter chapter = getOwnedChapterOrThrow(userId, projectId, chapterId);
        apply(chapter, request);
        validateOutlineIdInProject(projectId, chapter.getOutlineId());
        validateChapterNumberUnique(projectId, chapter.getChapterNumber(), chapterId);
        updateById(chapter);
        return getChapter(userId, projectId, chapterId);
    }

    @Override
    @Transactional
    public ChapterVO approveChapter(Long userId, Long projectId, Long chapterId) {
        Chapter chapter = getOwnedChapterOrThrow(userId, projectId, chapterId);
        validatePublishableContent(chapter.getContent());
        createVersionSnapshot(chapter);
        chapter.setStatus(StoryForgeConstants.CHAPTER_PUBLISHED);
        if (!updateById(chapter)) {
            throw new BusinessException(500, "章节发布失败");
        }
        return getChapter(userId, projectId, chapterId);
    }

    @Override
    public List<ChapterVersionVO> listChapterVersions(Long userId, Long projectId, Long chapterId) {
        Chapter chapter = getOwnedChapterOrThrow(userId, projectId, chapterId);
        return chapterVersionMapper.selectList(new LambdaQueryWrapper<ChapterVersion>()
                        .eq(ChapterVersion::getChapterId, chapter.getId())
                        .orderByDesc(ChapterVersion::getVersionNumber)
                        .orderByDesc(ChapterVersion::getId))
                .stream()
                .map(this::toVersionVO)
                .toList();
    }

    @Override
    public boolean deleteChapter(Long userId, Long projectId, Long chapterId) {
        Chapter chapter = getOwnedChapterOrThrow(userId, projectId, chapterId);
        return removeById(chapter.getId());
    }

    private Chapter getOwnedChapterOrThrow(Long userId, Long projectId, Long chapterId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        Chapter chapter = getOne(new LambdaQueryWrapper<Chapter>()
                .eq(Chapter::getId, chapterId)
                .eq(Chapter::getProjectId, projectId));
        if (chapter == null) {
            throw new BusinessException(404, "章节不存在");
        }
        return chapter;
    }

    private void validateOutlineIdInProject(Long projectId, Long outlineId) {
        if (outlineId != null) {
            plotOutlineService.getProjectPlotOutlineOrThrow(projectId, outlineId);
        }
    }

    private void validateChapterNumberUnique(Long projectId, Integer chapterNumber, Long excludeChapterId) {
        long count = count(new LambdaQueryWrapper<Chapter>()
                .eq(Chapter::getProjectId, projectId)
                .eq(Chapter::getChapterNumber, chapterNumber)
                .ne(excludeChapterId != null, Chapter::getId, excludeChapterId));
        if (count > 0) {
            throw new BusinessException(400, "章节序号已存在");
        }
    }

    private void validateEditableStatus(String status) {
        if (!EDITABLE_CHAPTER_STATUSES.contains(status)) {
            throw new BusinessException(400, StoryForgeConstants.CHAPTER_PUBLISHED.equals(status)
                    ? "不能通过普通编辑直接发布章节"
                    : "章节状态不合法");
        }
    }

    private void validatePublishableContent(String content) {
        if (content == null || content.isBlank()) {
            throw new BusinessException(400, "章节正文不能为空");
        }
    }

    private void createVersionSnapshot(Chapter chapter) {
        ChapterVersion version = new ChapterVersion();
        version.setChapterId(chapter.getId());
        version.setVersionNumber(getNextVersionNumber(chapter.getId()));
        version.setContent(chapter.getContent());
        version.setSource(StoryForgeConstants.SOURCE_USER_EDITED);
        version.setGenerationParams(null);
        chapterVersionMapper.insert(version);
    }

    private Integer getNextVersionNumber(Long chapterId) {
        Integer maxVersionNumber = chapterVersionMapper.selectMaxVersionNumberByChapterId(chapterId);
        return maxVersionNumber == null ? 1 : maxVersionNumber + 1;
    }

    private void apply(Chapter chapter, ChapterCreateRequest request) {
        applyChapterFields(chapter, request.getOutlineId(), request.getChapterNumber(), request.getTitle(), request.getContent(),
                request.getWordCount(), request.getStatus(), request.getAiModelUsed());
    }

    private void apply(Chapter chapter, ChapterUpdateRequest request) {
        applyChapterFields(chapter, request.getOutlineId(), request.getChapterNumber(), request.getTitle(), request.getContent(),
                request.getWordCount(), request.getStatus(), request.getAiModelUsed());
    }

    private void applyChapterFields(Chapter chapter,
            Long outlineId,
            Integer chapterNumber,
            String title,
            String content,
            Integer wordCount,
            String status,
            String aiModelUsed) {
        validateEditableStatus(status);
        chapter.setOutlineId(outlineId);
        chapter.setChapterNumber(chapterNumber);
        chapter.setTitle(title);
        chapter.setContent(content);
        chapter.setWordCount(Objects.requireNonNullElse(wordCount, 0));
        chapter.setStatus(status);
        chapter.setAiModelUsed(aiModelUsed);
    }

    private ChapterVO toVO(Chapter chapter) {
        return ChapterVO.builder()
                .id(chapter.getId())
                .projectId(chapter.getProjectId())
                .outlineId(chapter.getOutlineId())
                .chapterNumber(chapter.getChapterNumber())
                .title(chapter.getTitle())
                .content(chapter.getContent())
                .wordCount(chapter.getWordCount())
                .status(chapter.getStatus())
                .aiModelUsed(chapter.getAiModelUsed())
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt())
                .build();
    }

    private ChapterVersionVO toVersionVO(ChapterVersion version) {
        return ChapterVersionVO.builder()
                .id(version.getId())
                .chapterId(version.getChapterId())
                .versionNumber(version.getVersionNumber())
                .content(version.getContent())
                .source(version.getSource())
                .generationParams(version.getGenerationParams())
                .createdAt(version.getCreatedAt())
                .updatedAt(version.getUpdatedAt())
                .build();
    }
}
