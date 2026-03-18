package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户自定义模型配置表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_model_config")
public class ModelConfig extends BaseEntity {

    private Long userId;
    private String provider;
    private String modelName;
    private String apiKeyEncrypted;
    private String baseUrl;
    private Boolean isDefault;
    private Integer status;
}
