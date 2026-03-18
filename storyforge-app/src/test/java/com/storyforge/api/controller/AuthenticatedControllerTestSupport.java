package com.storyforge.api.controller;

import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.domain.entity.User;
import com.storyforge.service.security.JwtTokenProvider;
import com.storyforge.service.security.SecurityUserDetails;
import com.storyforge.service.security.SecurityUserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

abstract class AuthenticatedControllerTestSupport {

    protected static final long USER_ID = 7L;

    @MockitoBean
    protected JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    protected SecurityUserDetailsService securityUserDetailsService;

    protected RequestPostProcessor auth() {
        User currentUser = new User();
        currentUser.setId(USER_ID);
        currentUser.setUsername("tester");
        currentUser.setPasswordHash("encoded-password");
        currentUser.setStatus(StoryForgeConstants.USER_STATUS_ACTIVE);
        return user(new SecurityUserDetails(currentUser));
    }
}
