package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.WorldTemplateCreateRequest;
import com.storyforge.domain.dto.WorldTemplateUpdateRequest;
import com.storyforge.domain.vo.WorldTemplateVO;
import com.storyforge.service.IWorldTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 世界模板管理 API
 */
@Tag(name = "世界模板", description = "用户私有世界模板管理")
@RestController
@RequestMapping("/api/v1/world-templates")
@RequiredArgsConstructor
public class WorldTemplateController {

    private final IWorldTemplateService worldTemplateService;

    @Operation(summary = "获取世界模板列表")
    @GetMapping
    public R<List<WorldTemplateVO>> list(@CurrentUserId Long userId) {
        return R.ok(worldTemplateService.listWorldTemplates(userId));
    }

    @Operation(summary = "获取世界模板详情")
    @GetMapping("/{id}")
    public R<WorldTemplateVO> getById(@CurrentUserId Long userId, @PathVariable Long id) {
        return R.ok(worldTemplateService.getWorldTemplate(userId, id));
    }

    @Operation(summary = "创建世界模板")
    @PostMapping
    public R<WorldTemplateVO> create(@CurrentUserId Long userId,
            @Valid @RequestBody WorldTemplateCreateRequest request) {
        return R.ok(worldTemplateService.createWorldTemplate(userId, request));
    }

    @Operation(summary = "更新世界模板")
    @PutMapping("/{id}")
    public R<WorldTemplateVO> update(@CurrentUserId Long userId,
            @PathVariable Long id,
            @Valid @RequestBody WorldTemplateUpdateRequest request) {
        return R.ok(worldTemplateService.updateWorldTemplate(userId, id, request));
    }

    @Operation(summary = "删除世界模板")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId, @PathVariable Long id) {
        return R.ok(worldTemplateService.deleteWorldTemplate(userId, id));
    }
}
