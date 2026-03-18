package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.ApplyWorldTemplateRequest;
import com.storyforge.domain.dto.CreateWorldTemplateFromProjectRequest;
import com.storyforge.domain.dto.ProjectCreateRequest;
import com.storyforge.domain.dto.ProjectUpdateRequest;
import com.storyforge.domain.entity.Project;
import com.storyforge.domain.vo.ProjectVO;
import com.storyforge.domain.vo.WorldTemplateVO;

import java.util.List;

public interface IProjectService extends IService<Project> {

    List<ProjectVO> listProjectsByUser(Long userId);

    ProjectVO getProject(Long userId, Long projectId);

    ProjectVO createProject(Long userId, ProjectCreateRequest request);

    ProjectVO updateProject(Long userId, Long projectId, ProjectUpdateRequest request);

    ProjectVO applyWorldTemplate(Long userId, Long projectId, ApplyWorldTemplateRequest request);

    WorldTemplateVO createWorldTemplateFromProject(Long userId, Long projectId,
            CreateWorldTemplateFromProjectRequest request);

    boolean deleteProject(Long userId, Long projectId);

    Project getOwnedProjectOrThrow(Long userId, Long projectId);
}
