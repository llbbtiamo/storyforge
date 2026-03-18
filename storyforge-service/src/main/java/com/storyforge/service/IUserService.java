package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.AuthRequestContext;
import com.storyforge.domain.dto.LoginRequest;
import com.storyforge.domain.dto.LoginResponse;
import com.storyforge.domain.dto.RegisterRequest;
import com.storyforge.domain.entity.User;
import com.storyforge.domain.vo.UserVO;

public interface IUserService extends IService<User> {

    /**
     * 用户注册
     */
    LoginResponse register(RegisterRequest request);

    /**
     * 用户登录
     */
    LoginResponse login(LoginRequest request, AuthRequestContext requestContext);

    /**
     * 获取当前用户信息
     */
    UserVO getCurrentUser(Long userId);

    /**
     * 刷新 Token
     */
    LoginResponse refreshToken(String refreshToken);
}
