package com.storyforge.api.controller;

import com.storyforge.api.config.GlobalExceptionHandler;
import com.storyforge.api.config.JwtAuthenticationFilter;
import com.storyforge.api.config.RestAccessDeniedHandler;
import com.storyforge.api.config.RestAuthenticationEntryPoint;
import com.storyforge.api.config.SecurityConfig;
import org.springframework.context.annotation.Import;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
@interface ControllerSecurityTest {
}
