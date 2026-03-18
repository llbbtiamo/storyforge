package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.CharacterCreateRequest;
import com.storyforge.domain.dto.CharacterUpdateRequest;
import com.storyforge.domain.vo.CharacterVO;
import com.storyforge.service.ICharacterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理 API
 */
@Tag(name = "角色管理", description = "项目角色管理")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final ICharacterService characterService;

    @Operation(summary = "获取角色列表")
    @GetMapping
    public R<List<CharacterVO>> list(@CurrentUserId Long userId,
            @PathVariable Long projectId) {
        return R.ok(characterService.listCharacters(userId, projectId));
    }

    @Operation(summary = "获取角色详情")
    @GetMapping("/{id}")
    public R<CharacterVO> getById(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(characterService.getCharacter(userId, projectId, id));
    }

    @Operation(summary = "创建角色")
    @PostMapping
    public R<CharacterVO> create(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody CharacterCreateRequest request) {
        return R.ok(characterService.createCharacter(userId, projectId, request));
    }

    @Operation(summary = "更新角色")
    @PutMapping("/{id}")
    public R<CharacterVO> update(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody CharacterUpdateRequest request) {
        return R.ok(characterService.updateCharacter(userId, projectId, id, request));
    }

    @Operation(summary = "删除角色")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return R.ok(characterService.deleteCharacter(userId, projectId, id));
    }
}
