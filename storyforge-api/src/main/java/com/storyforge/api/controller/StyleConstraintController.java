package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.StyleConstraintCreateRequest;
import com.storyforge.domain.dto.StyleConstraintUpdateRequest;
import com.storyforge.domain.vo.StyleConstraintVO;
import com.storyforge.service.IStyleConstraintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 风格约束 API
 */
@Tag(name = "风格约束", description = "项目风格约束管理")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/style-constraint")
@RequiredArgsConstructor
public class StyleConstraintController {

    private final IStyleConstraintService styleConstraintService;

    @Operation(summary = "获取风格约束")
    @GetMapping
    public R<StyleConstraintVO> get(@CurrentUserId Long userId,
            @PathVariable Long projectId) {
        return R.ok(styleConstraintService.getStyleConstraint(userId, projectId));
    }

    @Operation(summary = "创建风格约束")
    @PostMapping
    public R<StyleConstraintVO> create(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody StyleConstraintCreateRequest request) {
        return R.ok(styleConstraintService.createStyleConstraint(userId, projectId, request));
    }

    @Operation(summary = "更新风格约束")
    @PutMapping
    public R<StyleConstraintVO> update(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody StyleConstraintUpdateRequest request) {
        return R.ok(styleConstraintService.updateStyleConstraint(userId, projectId, request));
    }

    @Operation(summary = "删除风格约束")
    @DeleteMapping
    public R<Boolean> delete(@CurrentUserId Long userId,
            @PathVariable Long projectId) {
        return R.ok(styleConstraintService.deleteStyleConstraint(userId, projectId));
    }
}
