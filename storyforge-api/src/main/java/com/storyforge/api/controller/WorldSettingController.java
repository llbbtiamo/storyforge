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
 * 世界观设定 API
 */
@Tag(name = "世界观设定", description = "项目世界观设定管理")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/world-settings")
@RequiredArgsConstructor
public class WorldSettingController {

    private final IWorldSettingService worldSettingService;

    @Operation(summary = "获取世界观设定列表")
    @GetMapping
    public R<List<WorldSettingVO>> list(@CurrentUserId Long userId,
            @PathVariable Long projectId) {
        return R.ok(worldSettingService.listWorldSettings(userId, projectId));
    }

    @Operation(summary = "获取世界观设定详情")
    @GetMapping("/{id}")
    public R<WorldSettingVO> getById(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(worldSettingService.getWorldSetting(userId, projectId, id));
    }

    @Operation(summary = "创建世界观设定")
    @PostMapping
    public R<WorldSettingVO> create(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody WorldSettingCreateRequest request) {
        return R.ok(worldSettingService.createWorldSetting(userId, projectId, request));
    }

    @Operation(summary = "更新世界观设定")
    @PutMapping("/{id}")
    public R<WorldSettingVO> update(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody WorldSettingUpdateRequest request) {
        return R.ok(worldSettingService.updateWorldSetting(userId, projectId, id, request));
    }

    @Operation(summary = "删除世界观设定")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(worldSettingService.deleteWorldSetting(userId, projectId, id));
    }
}
