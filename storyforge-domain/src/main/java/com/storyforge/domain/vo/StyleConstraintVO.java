package com.storyforge.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 风格约束视图对象
 */
@Data
@Builder
public class StyleConstraintVO {

    private Long id;
    private Long projectId;
    private String narrativeVoice;
    private String writingStyle;
    private String tone;
    private List<String> taboos;
    private Map<String, Object> customRules;
    private String referenceText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
