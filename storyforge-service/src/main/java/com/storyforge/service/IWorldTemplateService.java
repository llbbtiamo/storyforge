package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.WorldTemplateCreateRequest;
import com.storyforge.domain.dto.WorldTemplateUpdateRequest;
import com.storyforge.domain.entity.WorldTemplate;
import com.storyforge.domain.vo.WorldTemplateVO;

import java.util.List;

public interface IWorldTemplateService extends IService<WorldTemplate> {

    List<WorldTemplateVO> listWorldTemplates(Long userId);

    WorldTemplateVO getWorldTemplate(Long userId, Long templateId);

    WorldTemplateVO createWorldTemplate(Long userId, WorldTemplateCreateRequest request);

    WorldTemplateVO updateWorldTemplate(Long userId, Long templateId, WorldTemplateUpdateRequest request);

    boolean deleteWorldTemplate(Long userId, Long templateId);

    WorldTemplate getOwnedWorldTemplateOrThrow(Long userId, Long templateId);

    WorldTemplate getAccessibleWorldTemplateOrThrow(Long userId, Long templateId);
}
