package com.storyforge.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.domain.dto.AuthRequestContext;
import com.storyforge.domain.entity.LoginLog;
import com.storyforge.mapper.LoginLogMapper;
import com.storyforge.service.ILoginLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 登录日志服务实现
 */
@Slf4j
@Service
public class LoginLogServiceImpl extends ServiceImpl<LoginLogMapper, LoginLog> implements ILoginLogService {

    @Override
    public void recordSuccess(Long userId, String loginIdentifier, AuthRequestContext requestContext) {
        saveQuietly(buildLog(userId, loginIdentifier, StoryForgeConstants.LOGIN_LOG_RESULT_SUCCESS, null, requestContext));
    }

    @Override
    public void recordFailure(Long userId, String loginIdentifier, String failureReason, AuthRequestContext requestContext) {
        saveQuietly(buildLog(userId, loginIdentifier, StoryForgeConstants.LOGIN_LOG_RESULT_FAILURE, failureReason, requestContext));
    }

    private LoginLog buildLog(Long userId, String loginIdentifier, String result, String failureReason,
                              AuthRequestContext requestContext) {
        AuthRequestContext safeContext = requestContext != null ? requestContext : AuthRequestContext.empty();
        LoginLog loginLog = new LoginLog();
        loginLog.setUserId(userId);
        loginLog.setLoginIdentifier(truncate(loginIdentifier, 100));
        loginLog.setResult(result);
        loginLog.setFailureReason(truncate(failureReason, 255));
        loginLog.setIpAddress(truncate(safeContext.getIpAddress(), 64));
        loginLog.setUserAgent(truncate(safeContext.getUserAgent(), 1000));
        loginLog.setBrowserName(truncate(safeContext.getBrowserName(), 100));
        loginLog.setOsName(truncate(safeContext.getOsName(), 100));
        loginLog.setClientFingerprintHash(truncate(safeContext.getClientFingerprintHash(), 64));
        return loginLog;
    }

    private void saveQuietly(LoginLog loginLog) {
        try {
            save(loginLog);
        } catch (Exception e) {
            log.error("记录登录日志失败: identifier={}, result={}", loginLog.getLoginIdentifier(), loginLog.getResult(), e);
        }
    }

    private String truncate(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
