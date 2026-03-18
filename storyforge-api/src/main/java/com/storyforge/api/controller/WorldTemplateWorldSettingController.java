package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.WorldSettingCreateRequest;
import com.storyforge.domain.dto.WorldSettingUpdateRequest;
import com.storyforge.domain.vo.WorldSettingVO;
import com.storyforge.service.IWorldSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 世界模板设定 API
 */
@Tag(name = "模板世界设定", description = "世界模板下的世界观设定管理")
@RestController
@RequestMapping("/api/v1/world-templates/{templateId}/world-settings")
@RequiredArgsConstructor
public class WorldTemplateWorldSettingController {

    private final IWorldSettingService worldSettingService;

    @Operation(summary = "获取模板世界观设定列表")
    @GetMapping
    public R<List<WorldSettingVO>> list(@CurrentUserId Long userId,
            @PathVariable Long templateId) {
        return R.ok(worldSettingService.listTemplateWorldSettings(userId, templateId));
    }

    @Operation(summary = "获取模板世界观设定详情")
    @GetMapping("/{id}")
    public R<WorldSettingVO> getById(@CurrentUserId Long userId,
            @PathVariable Long templateId,
            @PathVariable Long id) {
        return R.ok(worldSettingService.getTemplateWorldSetting(userId, templateId, id));
    }

    @Operation(summary = "创建模板世界观设定")
    @PostMapping
    public R<WorldSettingVO> create(@CurrentUserId Long userId,
            @PathVariable Long templateId,
            @Valid @RequestBody WorldSettingCreateRequest request) {
        return R.ok(worldSettingService.createTemplateWorldSetting(userId, templateId, request));
    }

    @Operation(summary = "更新模板世界观设定")
    @PutMapping("/{id}")
    public R<WorldSettingVO> update(@CurrentUserId Long userId,
            @PathVariable Long templateId,
            @PathVariable Long id,
            @Valid @RequestBody WorldSettingUpdateRequest request) {
        return R.ok(worldSettingService.updateTemplateWorldSetting(userId, templateId, id, request));
    }

    @Operation(summary = "删除模板世界观设定")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId,
            @PathVariable Long templateId,
            @PathVariable Long id) {
        return R.ok(worldSettingService.deleteTemplateWorldSetting(userId, templateId, id));
    }
}
