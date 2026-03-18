package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.ChapterCreateRequest;
import com.storyforge.domain.dto.ChapterUpdateRequest;
import com.storyforge.domain.vo.ChapterVO;
import com.storyforge.domain.vo.ChapterVersionVO;
import com.storyforge.service.IChapterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 章节管理 API
 */
@Tag(name = "章节管理", description = "项目章节管理")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final IChapterService chapterService;

    @Operation(summary = "获取章节列表")
    @GetMapping
    public R<List<ChapterVO>> list(@CurrentUserId Long userId,
            @PathVariable Long projectId) {
        return R.ok(chapterService.listChapters(userId, projectId));
    }

    @Operation(summary = "获取章节详情")
    @GetMapping("/{id}")
    public R<ChapterVO> getById(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(chapterService.getChapter(userId, projectId, id));
    }

    @Operation(summary = "创建章节")
    @PostMapping
    public R<ChapterVO> create(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody ChapterCreateRequest request) {
        return R.ok(chapterService.createChapter(userId, projectId, request));
    }

    @Operation(summary = "更新章节")
    @PutMapping("/{id}")
    public R<ChapterVO> update(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody ChapterUpdateRequest request) {
        return R.ok(chapterService.updateChapter(userId, projectId, id, request));
    }

    @Operation(summary = "审核发布章节")
    @PostMapping("/{id}/approve")
    public R<ChapterVO> approve(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(chapterService.approveChapter(userId, projectId, id));
    }

    @Operation(summary = "获取章节版本历史")
    @GetMapping("/{id}/versions")
    public R<List<ChapterVersionVO>> listVersions(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(chapterService.listChapterVersions(userId, projectId, id));
    }

    @Operation(summary = "删除章节")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(chapterService.deleteChapter(userId, projectId, id));
    }
}
