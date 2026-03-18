package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.PlotOutlineCreateRequest;
import com.storyforge.domain.dto.PlotOutlineUpdateRequest;
import com.storyforge.domain.vo.PlotOutlineVO;
import com.storyforge.service.IPlotOutlineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 剧情大纲 API
 */
@Tag(name = "剧情大纲", description = "项目剧情大纲管理")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/outlines")
@RequiredArgsConstructor
public class PlotOutlineController {

    private final IPlotOutlineService plotOutlineService;

    @Operation(summary = "获取剧情大纲列表")
    @GetMapping
    public R<List<PlotOutlineVO>> list(@CurrentUserId Long userId,
            @PathVariable Long projectId) {
        return R.ok(plotOutlineService.listPlotOutlines(userId, projectId));
    }

    @Operation(summary = "获取剧情大纲详情")
    @GetMapping("/{id}")
    public R<PlotOutlineVO> getById(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(plotOutlineService.getPlotOutline(userId, projectId, id));
    }

    @Operation(summary = "创建剧情大纲")
    @PostMapping
    public R<PlotOutlineVO> create(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody PlotOutlineCreateRequest request) {
        return R.ok(plotOutlineService.createPlotOutline(userId, projectId, request));
    }

    @Operation(summary = "更新剧情大纲")
    @PutMapping("/{id}")
    public R<PlotOutlineVO> update(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody PlotOutlineUpdateRequest request) {
        return R.ok(plotOutlineService.updatePlotOutline(userId, projectId, id, request));
    }

    @Operation(summary = "删除剧情大纲")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(plotOutlineService.deletePlotOutline(userId, projectId, id));
    }
}
