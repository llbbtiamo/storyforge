package com.storyforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.exception.BusinessException;
import com.storyforge.domain.dto.CharacterRelationCreateRequest;
import com.storyforge.domain.dto.CharacterRelationUpdateRequest;
import com.storyforge.domain.entity.CharacterRelation;
import com.storyforge.domain.vo.CharacterRelationVO;
import com.storyforge.mapper.CharacterRelationMapper;
import com.storyforge.service.ICharacterRelationService;
import com.storyforge.service.ICharacterService;
import com.storyforge.service.IProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CharacterRelationServiceImpl extends ServiceImpl<CharacterRelationMapper, CharacterRelation>
        implements ICharacterRelationService {

    private final IProjectService projectService;
    private final ICharacterService characterService;

    @Override
    public List<CharacterRelationVO> listCharacterRelations(Long userId, Long projectId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        return list(new LambdaQueryWrapper<CharacterRelation>()
                .eq(CharacterRelation::getProjectId, projectId)
                .orderByAsc(CharacterRelation::getId)).stream().map(this::toVO).toList();
    }

    @Override
    public CharacterRelationVO getCharacterRelation(Long userId, Long projectId, Long relationId) {
        return toVO(getOwnedCharacterRelationOrThrow(userId, projectId, relationId));
    }

    @Override
    public CharacterRelationVO createCharacterRelation(Long userId, Long projectId,
            CharacterRelationCreateRequest request) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        Long[] normalizedIds = normalizeCharacterIds(projectId, request.getCharacterIdA(), request.getCharacterIdB());
        validateDuplicateRelation(projectId, normalizedIds[0], normalizedIds[1], null);

        CharacterRelation relation = new CharacterRelation();
        relation.setProjectId(projectId);
        apply(relation, request, normalizedIds);
        save(relation);
        return getCharacterRelation(userId, projectId, relation.getId());
    }

    @Override
    public CharacterRelationVO updateCharacterRelation(Long userId, Long projectId, Long relationId,
            CharacterRelationUpdateRequest request) {
        CharacterRelation relation = getOwnedCharacterRelationOrThrow(userId, projectId, relationId);
        Long[] normalizedIds = normalizeCharacterIds(projectId, request.getCharacterIdA(), request.getCharacterIdB());
        validateDuplicateRelation(projectId, normalizedIds[0], normalizedIds[1], relationId);

        apply(relation, request, normalizedIds);
        updateById(relation);
        return getCharacterRelation(userId, projectId, relationId);
    }

    @Override
    public boolean deleteCharacterRelation(Long userId, Long projectId, Long relationId) {
        CharacterRelation relation = getOwnedCharacterRelationOrThrow(userId, projectId, relationId);
        return removeById(relation.getId());
    }

    private CharacterRelation getOwnedCharacterRelationOrThrow(Long userId, Long projectId, Long relationId) {
        projectService.getOwnedProjectOrThrow(userId, projectId);
        CharacterRelation relation = getOne(new LambdaQueryWrapper<CharacterRelation>()
                .eq(CharacterRelation::getId, relationId)
                .eq(CharacterRelation::getProjectId, projectId));
        if (relation == null) {
            throw new BusinessException(404, "角色关系不存在");
        }
        return relation;
    }

    private Long[] normalizeCharacterIds(Long projectId, Long characterIdA, Long characterIdB) {
        if (characterIdA.equals(characterIdB)) {
            throw new BusinessException(400, "不能和自己建立关系");
        }
        validateCharacterInProject(projectId, characterIdA);
        validateCharacterInProject(projectId, characterIdB);
        if (characterIdA <= characterIdB) {
            return new Long[]{characterIdA, characterIdB};
        }
        return new Long[]{characterIdB, characterIdA};
    }

    private void validateCharacterInProject(Long projectId, Long characterId) {
        try {
            characterService.getProjectCharacterOrThrow(projectId, characterId);
        } catch (BusinessException ex) {
            if (ex.getCode() != 404) {
                throw ex;
            }
            throw new BusinessException(400, "关联角色不存在于当前项目");
        }
    }

    private void validateDuplicateRelation(Long projectId, Long characterIdA, Long characterIdB, Long excludeRelationId) {
        long count = count(new LambdaQueryWrapper<CharacterRelation>()
                .eq(CharacterRelation::getProjectId, projectId)
                .eq(CharacterRelation::getCharacterIdA, characterIdA)
                .eq(CharacterRelation::getCharacterIdB, characterIdB)
                .ne(excludeRelationId != null, CharacterRelation::getId, excludeRelationId));
        if (count > 0) {
            throw new BusinessException(400, "角色关系已存在");
        }
    }

    private void apply(CharacterRelation relation, CharacterRelationCreateRequest request, Long[] normalizedIds) {
        relation.setCharacterIdA(normalizedIds[0]);
        relation.setCharacterIdB(normalizedIds[1]);
        relation.setRelationType(request.getRelationType());
        relation.setDescription(request.getDescription());
    }

    private void apply(CharacterRelation relation, CharacterRelationUpdateRequest request, Long[] normalizedIds) {
        relation.setCharacterIdA(normalizedIds[0]);
        relation.setCharacterIdB(normalizedIds[1]);
        relation.setRelationType(request.getRelationType());
        relation.setDescription(request.getDescription());
    }

    private CharacterRelationVO toVO(CharacterRelation relation) {
        return CharacterRelationVO.builder()
                .id(relation.getId())
                .projectId(relation.getProjectId())
                .characterIdA(relation.getCharacterIdA())
                .characterIdB(relation.getCharacterIdB())
                .relationType(relation.getRelationType())
                .description(relation.getDescription())
                .createdAt(relation.getCreatedAt())
                .updatedAt(relation.getUpdatedAt())
                .build();
    }
}
