package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 章节更新请求
 */
@Data
public class ChapterUpdateRequest {

    private Long outlineId;

    @NotNull(message = "章节序号不能为空")
    @Positive(message = "章节序号必须大于0")
    private Integer chapterNumber;

    @Size(max = 200, message = "章节标题长度不能超过200个字符")
    private String title;

    private String content;

    @PositiveOrZero(message = "字数不能为负数")
    private Integer wordCount;

    @NotBlank(message = "章节状态不能为空")
    @Size(max = 20, message = "章节状态长度不能超过20个字符")
    private String status;

    @Size(max = 50, message = "模型标识长度不能超过50个字符")
    private String aiModelUsed;
}
