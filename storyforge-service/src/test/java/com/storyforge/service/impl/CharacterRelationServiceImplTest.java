package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.CharacterRelationCreateRequest;
import com.storyforge.domain.dto.CharacterRelationUpdateRequest;
import com.storyforge.domain.entity.Character;
import com.storyforge.domain.entity.CharacterRelation;
import com.storyforge.domain.entity.Project;
import com.storyforge.service.ICharacterService;
import com.storyforge.service.IProjectService;
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
class CharacterRelationServiceImplTest {

    private static final Long USER_ID = 1L;
    private static final Long PROJECT_ID = 10L;
    private static final Long RELATION_ID = 100L;
    private static final Long CHARACTER_ID_A = 11L;
    private static final Long CHARACTER_ID_B = 12L;

    @Mock
    private IProjectService projectService;

    @Mock
    private ICharacterService characterService;

    private CharacterRelationServiceImpl service;

    @BeforeEach
    void setUp() {
        service = spy(new CharacterRelationServiceImpl(projectService, characterService));
    }

    @Test
    void shouldRejectCreateWhenRelatedCharacterIsOutsideProject() {
        CharacterRelationCreateRequest request = new CharacterRelationCreateRequest();
        request.setCharacterIdA(CHARACTER_ID_A);
        request.setCharacterIdB(CHARACTER_ID_B);
        request.setRelationType("ally");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        when(characterService.getProjectCharacterOrThrow(PROJECT_ID, CHARACTER_ID_A)).thenReturn(character(CHARACTER_ID_A));
        when(characterService.getProjectCharacterOrThrow(PROJECT_ID, CHARACTER_ID_B))
                .thenThrow(new BusinessException(404, "角色不存在"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.createCharacterRelation(USER_ID, PROJECT_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("关联角色不存在于当前项目", ex.getMessage());
        verify(service, never()).save(any(CharacterRelation.class));
    }

    @Test
    void shouldRejectUpdateWhenRelatedCharacterIsOutsideProject() {
        CharacterRelationUpdateRequest request = new CharacterRelationUpdateRequest();
        request.setCharacterIdA(CHARACTER_ID_A);
        request.setCharacterIdB(CHARACTER_ID_B);
        request.setRelationType("ally");

        when(projectService.getOwnedProjectOrThrow(eq(USER_ID), eq(PROJECT_ID))).thenReturn(project());
        doReturn(relation()).when(service).getOne(any(LambdaQueryWrapper.class));
        when(characterService.getProjectCharacterOrThrow(PROJECT_ID, CHARACTER_ID_A)).thenReturn(character(CHARACTER_ID_A));
        when(characterService.getProjectCharacterOrThrow(PROJECT_ID, CHARACTER_ID_B))
                .thenThrow(new BusinessException(404, "角色不存在"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.updateCharacterRelation(USER_ID, PROJECT_ID, RELATION_ID, request));

        assertEquals(400, ex.getCode());
        assertEquals("关联角色不存在于当前项目", ex.getMessage());
        verify(service, never()).updateById(any(CharacterRelation.class));
    }

    private Project project() {
        Project project = new Project();
        project.setId(PROJECT_ID);
        project.setUserId(USER_ID);
        return project;
    }

    private Character character(Long characterId) {
        Character character = new Character();
        character.setId(characterId);
        character.setProjectId(PROJECT_ID);
        character.setName("character-" + characterId);
        return character;
    }

    private CharacterRelation relation() {
        CharacterRelation relation = new CharacterRelation();
        relation.setId(RELATION_ID);
        relation.setProjectId(PROJECT_ID);
        relation.setCharacterIdA(CHARACTER_ID_A);
        relation.setCharacterIdB(CHARACTER_ID_B);
        relation.setRelationType("ally");
        return relation;
    }
}
