package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.CharacterCreateRequest;
import com.storyforge.domain.dto.CharacterUpdateRequest;
import com.storyforge.domain.entity.Character;
import com.storyforge.domain.vo.CharacterVO;

import java.util.List;

public interface ICharacterService extends IService<Character> {

    List<CharacterVO> listCharacters(Long userId, Long projectId);

    CharacterVO getCharacter(Long userId, Long projectId, Long characterId);

    Character getProjectCharacterOrThrow(Long projectId, Long characterId);

    CharacterVO createCharacter(Long userId, Long projectId, CharacterCreateRequest request);

    CharacterVO updateCharacter(Long userId, Long projectId, Long characterId, CharacterUpdateRequest request);

    boolean deleteCharacter(Long userId, Long projectId, Long characterId);
}
