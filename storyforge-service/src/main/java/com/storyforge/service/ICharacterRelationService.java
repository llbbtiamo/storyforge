package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.CharacterRelationCreateRequest;
import com.storyforge.domain.dto.CharacterRelationUpdateRequest;
import com.storyforge.domain.entity.CharacterRelation;
import com.storyforge.domain.vo.CharacterRelationVO;

import java.util.List;

public interface ICharacterRelationService extends IService<CharacterRelation> {

    List<CharacterRelationVO> listCharacterRelations(Long userId, Long projectId);

    CharacterRelationVO getCharacterRelation(Long userId, Long projectId, Long relationId);

    CharacterRelationVO createCharacterRelation(Long userId, Long projectId, CharacterRelationCreateRequest request);

    CharacterRelationVO updateCharacterRelation(Long userId, Long projectId, Long relationId,
            CharacterRelationUpdateRequest request);

    boolean deleteCharacterRelation(Long userId, Long projectId, Long relationId);
}
