package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.WorldTemplateCreateRequest;
import com.storyforge.domain.dto.WorldTemplateUpdateRequest;
import com.storyforge.domain.entity.Project;
import com.storyforge.domain.entity.WorldTemplate;
import com.storyforge.mapper.ProjectMapper;
import com.storyforge.mapper.WorldSettingMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorldTemplateServiceImplTest {

    private static final Long USER_ID = 1L;
    private static final Long TEMPLATE_ID = 10L;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private WorldSettingMapper worldSettingMapper;

    private WorldTemplateServiceImpl service;

    @BeforeEach
    void setUp() {
        service = spy(new WorldTemplateServiceImpl(projectMapper, worldSettingMapper));
    }

    @Test
    void shouldRejectAccessToOthersTemplate() {
        doReturn(null).when(service).getOne(any(LambdaQueryWrapper.class));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.getWorldTemplate(USER_ID, TEMPLATE_ID));

        assertEquals(404, ex.getCode());
        assertEquals("世界模板不存在", ex.getMessage());
    }

    @Test
    void shouldCreatePrivateTemplate() {
        WorldTemplateCreateRequest request = new WorldTemplateCreateRequest();
        request.setName("玄幻模板");
        request.setDescription("desc");

        doReturn(true).when(service).save(any(WorldTemplate.class));
        doReturn(template()).when(service).getOne(any(LambdaQueryWrapper.class));

        var result = service.createWorldTemplate(USER_ID, request);

        assertEquals(TEMPLATE_ID, result.getId());
        assertEquals(Boolean.FALSE, result.getIsPublic());
        verify(service).save(any(WorldTemplate.class));
    }

    @Test
    void shouldRejectDeleteWhenTemplateUsedByProject() {
        doReturn(template()).when(service).getOne(any(LambdaQueryWrapper.class));
        when(projectMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.deleteWorldTemplate(USER_ID, TEMPLATE_ID));

        assertEquals(400, ex.getCode());
        assertEquals("世界模板已被项目使用，无法删除", ex.getMessage());
        verify(worldSettingMapper, never()).delete(any(LambdaQueryWrapper.class));
    }

    @Test
    void shouldDeleteTemplateSettingsBeforeDeletingTemplate() {
        doReturn(template()).when(service).getOne(any(LambdaQueryWrapper.class));
        when(projectMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(worldSettingMapper.delete(any(LambdaQueryWrapper.class))).thenReturn(2);
        doReturn(true).when(service).removeById(TEMPLATE_ID);

        var result = service.deleteWorldTemplate(USER_ID, TEMPLATE_ID);

        assertEquals(true, result);
        verify(worldSettingMapper).delete(any(LambdaQueryWrapper.class));
        verify(service).removeById(TEMPLATE_ID);
    }

    private WorldTemplate template() {
        WorldTemplate template = new WorldTemplate();
        template.setId(TEMPLATE_ID);
        template.setUserId(USER_ID);
        template.setName("玄幻模板");
        template.setDescription("desc");
        template.setIsPublic(false);
        return template;
    }
}
