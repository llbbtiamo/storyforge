package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.PlotOutlineCreateRequest;
import com.storyforge.domain.dto.PlotOutlineUpdateRequest;
import com.storyforge.domain.entity.PlotOutline;
import com.storyforge.domain.vo.PlotOutlineVO;
import com.storyforge.mapper.PlotOutlineMapper;
import com.storyforge.service.IPlotOutlineService;
import com.storyforge.service.IProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PlotOutlineServiceImpl extends ServiceImpl<PlotOutlineMapper, PlotOutline> implements IPlotOutlineService {

    private final IProjectService projectService;

    @Override
    public List<PlotOutlineVO> listPlotOutlines(Long userId, Long projectId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        return list(new LambdaQueryWrapper<PlotOutline>()
                .eq(PlotOutline::getProjectId, projectId)
                .orderByAsc(PlotOutline::getLevel)
                .orderByAsc(PlotOutline::getSortOrder)
                .orderByAsc(PlotOutline::getId)).stream().map(this::toVO).toList();
    }

    @Override
    public PlotOutlineVO getPlotOutline(Long userId, Long projectId, Long plotOutlineId) {
        return toVO(getOwnedPlotOutlineOrThrow(userId, projectId, plotOutlineId));
    }

    @Override
    public PlotOutlineVO createPlotOutline(Long userId, Long projectId, PlotOutlineCreateRequest request) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        PlotOutline plotOutline = new PlotOutline();
        plotOutline.setProjectId(projectId);
        apply(plotOutline, request);
        validateParentIdInProject(projectId, plotOutline.getParentId());
        save(plotOutline);
        return getPlotOutline(userId, projectId, plotOutline.getId());
    }

    @Override
    public PlotOutlineVO updatePlotOutline(Long userId, Long projectId, Long plotOutlineId,
            PlotOutlineUpdateRequest request) {
        PlotOutline plotOutline = getOwnedPlotOutlineOrThrow(userId, projectId, plotOutlineId);
        apply(plotOutline, request);
        validateParentIdInProject(projectId, plotOutline.getParentId());
        updateById(plotOutline);
        return getPlotOutline(userId, projectId, plotOutlineId);
    }

    @Override
    public boolean deletePlotOutline(Long userId, Long projectId, Long plotOutlineId) {
        PlotOutline plotOutline = getOwnedPlotOutlineOrThrow(userId, projectId, plotOutlineId);
        return removeById(plotOutline.getId());
    }

    @Override
    public PlotOutline getProjectPlotOutlineOrThrow(Long projectId, Long plotOutlineId) {
        PlotOutline plotOutline = getOne(new LambdaQueryWrapper<PlotOutline>()
                .eq(PlotOutline::getId, plotOutlineId)
                .eq(PlotOutline::getProjectId, projectId));
        if (plotOutline == null) {
            throw new BusinessException(404, "剧情大纲不存在");
        }
        return plotOutline;
    }

    private PlotOutline getOwnedPlotOutlineOrThrow(Long userId, Long projectId, Long plotOutlineId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        return getProjectPlotOutlineOrThrow(projectId, plotOutlineId);
    }

    private void validateParentIdInProject(Long projectId, Long parentId) {
        if (parentId != null) {
            getProjectPlotOutlineOrThrow(projectId, parentId);
        }
    }

    private void apply(PlotOutline plotOutline, PlotOutlineCreateRequest request) {
        plotOutline.setParentId(request.getParentId());
        plotOutline.setTitle(request.getTitle());
        plotOutline.setSummary(request.getSummary());
        plotOutline.setKeyEvents(request.getKeyEvents());
        plotOutline.setLevel(Objects.requireNonNullElse(request.getLevel(), 1));
        plotOutline.setSortOrder(Objects.requireNonNullElse(request.getSortOrder(), 0));
    }

    private void apply(PlotOutline plotOutline, PlotOutlineUpdateRequest request) {
        plotOutline.setParentId(request.getParentId());
        plotOutline.setTitle(request.getTitle());
        plotOutline.setSummary(request.getSummary());
        plotOutline.setKeyEvents(request.getKeyEvents());
        plotOutline.setLevel(Objects.requireNonNullElse(request.getLevel(), 1));
        plotOutline.setSortOrder(Objects.requireNonNullElse(request.getSortOrder(), 0));
    }

    private PlotOutlineVO toVO(PlotOutline plotOutline) {
        return PlotOutlineVO.builder()
                .id(plotOutline.getId())
                .projectId(plotOutline.getProjectId())
                .parentId(plotOutline.getParentId())
                .title(plotOutline.getTitle())
                .summary(plotOutline.getSummary())
                .keyEvents(plotOutline.getKeyEvents())
                .level(plotOutline.getLevel())
                .sortOrder(plotOutline.getSortOrder())
                .createdAt(plotOutline.getCreatedAt())
                .updatedAt(plotOutline.getUpdatedAt())
                .build();
    }
}
