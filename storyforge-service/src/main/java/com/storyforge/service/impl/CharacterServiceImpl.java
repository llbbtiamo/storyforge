package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.CharacterCreateRequest;
import com.storyforge.domain.dto.CharacterUpdateRequest;
import com.storyforge.domain.entity.Character;
import com.storyforge.domain.vo.CharacterVO;
import com.storyforge.mapper.CharacterMapper;
import com.storyforge.service.ICharacterService;
import com.storyforge.service.IProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CharacterServiceImpl extends ServiceImpl<CharacterMapper, Character> implements ICharacterService {

    private final IProjectService projectService;

    @Override
    public List<CharacterVO> listCharacters(Long userId, Long projectId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        return list(new LambdaQueryWrapper<Character>()
                .eq(Character::getProjectId, projectId)
                .orderByAsc(Character::getSortOrder)
                .orderByAsc(Character::getId)).stream().map(this::toVO).toList();
    }

    @Override
    public CharacterVO getCharacter(Long userId, Long projectId, Long characterId) {
        return toVO(getOwnedCharacterOrThrow(userId, projectId, characterId));
    }

    @Override
    public CharacterVO createCharacter(Long userId, Long projectId, CharacterCreateRequest request) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        Character character = new Character();
        character.setProjectId(projectId);
        apply(character, request);
        save(character);
        return getCharacter(userId, projectId, character.getId());
    }

    @Override
    public CharacterVO updateCharacter(Long userId, Long projectId, Long characterId, CharacterUpdateRequest request) {
        Character character = getOwnedCharacterOrThrow(userId, projectId, characterId);
        apply(character, request);
        updateById(character);
        return getCharacter(userId, projectId, characterId);
    }

    @Override
    public boolean deleteCharacter(Long userId, Long projectId, Long characterId) {
        Character character = getOwnedCharacterOrThrow(userId, projectId, characterId);
        return removeById(character.getId());
    }

    @Override
    public Character getProjectCharacterOrThrow(Long projectId, Long characterId) {
        Character character = getOne(new LambdaQueryWrapper<Character>()
                .eq(Character::getId, characterId)
                .eq(Character::getProjectId, projectId));
        if (character == null) {
            throw new BusinessException(404, "角色不存在");
        }
        return character;
    }

    private Character getOwnedCharacterOrThrow(Long userId, Long projectId, Long characterId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        return getProjectCharacterOrThrow(projectId, characterId);
    }

    private void apply(Character character, CharacterCreateRequest request) {
        character.setName(request.getName());
        character.setRoleType(request.getRoleType());
        character.setBasicInfo(request.getBasicInfo());
        character.setBackstory(request.getBackstory());
        character.setMotivation(request.getMotivation());
        character.setAvatarUrl(request.getAvatarUrl());
        character.setSortOrder(Objects.requireNonNullElse(request.getSortOrder(), 0));
    }

    private void apply(Character character, CharacterUpdateRequest request) {
        character.setName(request.getName());
        character.setRoleType(request.getRoleType());
        character.setBasicInfo(request.getBasicInfo());
        character.setBackstory(request.getBackstory());
        character.setMotivation(request.getMotivation());
        character.setAvatarUrl(request.getAvatarUrl());
        character.setSortOrder(Objects.requireNonNullElse(request.getSortOrder(), 0));
    }

    private CharacterVO toVO(Character character) {
        return CharacterVO.builder()
                .id(character.getId())
                .projectId(character.getProjectId())
                .name(character.getName())
                .roleType(character.getRoleType())
                .basicInfo(character.getBasicInfo())
                .backstory(character.getBackstory())
                .motivation(character.getMotivation())
                .avatarUrl(character.getAvatarUrl())
                .sortOrder(character.getSortOrder())
                .createdAt(character.getCreatedAt())
                .updatedAt(character.getUpdatedAt())
                .build();
    }
}
