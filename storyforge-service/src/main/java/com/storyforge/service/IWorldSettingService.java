package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.WorldSettingCreateRequest;
import com.storyforge.domain.dto.WorldSettingUpdateRequest;
import com.storyforge.domain.entity.WorldSetting;
import com.storyforge.domain.vo.WorldSettingVO;

import java.util.List;

public interface IWorldSettingService extends IService<WorldSetting> {

    List<WorldSettingVO> listWorldSettings(Long userId, Long projectId);

    WorldSettingVO getWorldSetting(Long userId, Long projectId, Long worldSettingId);

    WorldSettingVO createWorldSetting(Long userId, Long projectId, WorldSettingCreateRequest request);

    WorldSettingVO updateWorldSetting(Long userId, Long projectId, Long worldSettingId, WorldSettingUpdateRequest request);

    List<WorldSettingVO> listTemplateWorldSettings(Long userId, Long templateId);

    WorldSettingVO getTemplateWorldSetting(Long userId, Long templateId, Long worldSettingId);

    WorldSettingVO createTemplateWorldSetting(Long userId, Long templateId, WorldSettingCreateRequest request);

    WorldSettingVO updateTemplateWorldSetting(Long userId, Long templateId, Long worldSettingId,
            WorldSettingUpdateRequest request);

    void copyTemplateSettingsToProject(Long userId, Long templateId, Long projectId,
            boolean overwriteExistingSettings);

    void copyProjectSettingsToTemplate(Long userId, Long projectId, Long templateId);

    boolean deleteWorldSetting(Long userId, Long projectId, Long worldSettingId);

    boolean deleteTemplateWorldSetting(Long userId, Long templateId, Long worldSettingId);
}
