package com.storyforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 剧情大纲更新请求
 */
@Data
public class PlotOutlineUpdateRequest {

    private Long parentId;

    @NotBlank(message = "节点标题不能为空")
    @Size(max = 200, message = "节点标题长度不能超过200个字符")
    private String title;

    private String summary;

    private List<String> keyEvents;

    @PositiveOrZero(message = "层级不能为负数")
    private Integer level;

    @PositiveOrZero(message = "排序不能为负数")
    private Integer sortOrder;
}
