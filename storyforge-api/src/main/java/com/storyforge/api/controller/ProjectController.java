package com.storyforge.api.controller;

import com.storyforge.api.annotation.CurrentUserId;
import com.storyforge.common.result.R;
import com.storyforge.domain.dto.ApplyWorldTemplateRequest;
import com.storyforge.domain.dto.CreateWorldTemplateFromProjectRequest;
import com.storyforge.domain.dto.ProjectCreateRequest;
import com.storyforge.domain.dto.ProjectUpdateRequest;
import com.storyforge.domain.vo.ProjectVO;
import com.storyforge.domain.vo.WorldTemplateVO;
import com.storyforge.service.IProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 项目管理 API
 */
@Tag(name = "项目管理", description = "小说项目管理")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final IProjectService projectService;

    @Operation(summary = "获取当前用户项目列表")
    @GetMapping
    public R<List<ProjectVO>> list(@CurrentUserId Long userId) {
        return R.ok(projectService.listProjectsByUser(userId));
    }

    @Operation(summary = "获取项目详情")
    @GetMapping("/{id}")
    public R<ProjectVO> getById(@CurrentUserId Long userId, @PathVariable Long id) {
        return R.ok(projectService.getProject(userId, id));
    }

    @Operation(summary = "创建项目")
    @PostMapping
    public R<ProjectVO> create(@CurrentUserId Long userId,
            @Valid @RequestBody ProjectCreateRequest request) {
        return R.ok(projectService.createProject(userId, request));
    }

    @Operation(summary = "更新项目")
    @PutMapping("/{id}")
    public R<ProjectVO> update(@CurrentUserId Long userId,
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequest request) {
        return R.ok(projectService.updateProject(userId, id, request));
    }

    @Operation(summary = "应用世界模板到项目")
    @PostMapping("/{projectId}/world-template/apply")
    public R<ProjectVO> applyWorldTemplate(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody ApplyWorldTemplateRequest request) {
        return R.ok(projectService.applyWorldTemplate(userId, projectId, request));
    }

    @Operation(summary = "从项目创建世界模板")
    @PostMapping("/{projectId}/world-template")
    public R<WorldTemplateVO> createWorldTemplateFromProject(@CurrentUserId Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody CreateWorldTemplateFromProjectRequest request) {
        return R.ok(projectService.createWorldTemplateFromProject(userId, projectId, request));
    }

    @Operation(summary = "删除项目")
    @DeleteMapping("/{id}")
    public R<Boolean> delete(@CurrentUserId Long userId, @PathVariable Long id) {
        return R.ok(projectService.deleteProject(userId, id));
    }
}
