package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.CharacterRelationCreateRequest;
import com.storyforge.domain.dto.CharacterRelationUpdateRequest;
import com.storyforge.domain.vo.CharacterRelationVO;
import com.storyforge.service.ICharacterRelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色关系 API
 */
@Tag(name = "角色关系", description = "项目角色关系管理")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/character-relations")
@RequiredArgsConstructor
public class CharacterRelationController {

    private final ICharacterRelationService characterRelationService;

    @Operation(summary = "获取角色关系列表")
    @GetMapping
    public R<List<CharacterRelationVO>> list(@CurrentUserId Long userId,
            @PathVariable Long projectId) {
        return R.ok(characterRelationService.listCharacterRelations(userId, projectId));
    }

    @Operation(summary = "获取角色关系详情")
    @GetMapping("/{id}")
    public R<CharacterRelationVO> getById(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(characterRelationService.getCharacterRelation(userId, projectId, id));
    }

    @Operation(summary = "创建角色关系")
    @PostMapping
    public R<CharacterRelationVO> create(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody CharacterRelationCreateRequest request) {
        return R.ok(characterRelationService.createCharacterRelation(userId, projectId, request));
    }

    @Operation(summary = "更新角色关系")
    @PutMapping("/{id}")
    public R<CharacterRelationVO> update(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody CharacterRelationUpdateRequest request) {
        return R.ok(characterRelationService.updateCharacterRelation(userId, projectId, id, request));
    }

    @Operation(summary = "删除角色关系")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(characterRelationService.deleteCharacterRelation(userId, projectId, id));
    }
}
