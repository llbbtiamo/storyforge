package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.AuthRequestContext;
import com.storyforge.domain.entity.LoginLog;

public interface ILoginLogService extends IService<LoginLog> {

    void recordSuccess(Long userId, String loginIdentifier, AuthRequestContext requestContext);

    void recordFailure(Long userId, String loginIdentifier, String failureReason, AuthRequestContext requestContext);
}
