package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.PlotOutlineCreateRequest;
import com.storyforge.domain.dto.PlotOutlineUpdateRequest;
import com.storyforge.domain.entity.PlotOutline;
import com.storyforge.domain.vo.PlotOutlineVO;

import java.util.List;

public interface IPlotOutlineService extends IService<PlotOutline> {

    List<PlotOutlineVO> listPlotOutlines(Long userId, Long projectId);

    PlotOutlineVO getPlotOutline(Long userId, Long projectId, Long plotOutlineId);

    PlotOutline getProjectPlotOutlineOrThrow(Long projectId, Long plotOutlineId);

    PlotOutlineVO createPlotOutline(Long userId, Long projectId, PlotOutlineCreateRequest request);

    PlotOutlineVO updatePlotOutline(Long userId, Long projectId, Long plotOutlineId, PlotOutlineUpdateRequest request);

    boolean deletePlotOutline(Long userId, Long projectId, Long plotOutlineId);
}
