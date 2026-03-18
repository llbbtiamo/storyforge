package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 额度账户表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_quota_account")
public class QuotaAccount extends BaseEntity {

    private Long userId;
    private Integer totalQuota;
    private Integer usedQuota;
    private Integer monthlyQuota;
}
