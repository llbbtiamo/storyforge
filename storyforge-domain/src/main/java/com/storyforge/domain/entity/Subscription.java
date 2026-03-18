package com.storyforge.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 订阅信息表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sf_subscription")
public class Subscription extends BaseEntity {

    private Long userId;
    private String planType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean autoRenew;
    private String status;
}
