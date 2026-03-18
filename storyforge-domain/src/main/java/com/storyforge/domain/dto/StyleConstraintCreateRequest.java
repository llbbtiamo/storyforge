package com.storyforge.domain.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 风格约束创建请求
 */
@Data
public class StyleConstraintCreateRequest {

    @Size(max = 50, message = "叙事视角长度不能超过50个字符")
    private String narrativeVoice;

    @Size(max = 50, message = "文风长度不能超过50个字符")
    private String writingStyle;

    @Size(max = 50, message = "基调长度不能超过50个字符")
    private String tone;

    private List<String> taboos;

    private Map<String, Object> customRules;

    private String referenceText;
}
