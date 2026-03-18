package com.storyforge.common.constant;

/**
 * 系统常量
 */
public final class StoryForgeConstants {

    private StoryForgeConstants() {
    }

    // ====== VIP 等级 ======
    public static final int VIP_FREE = 0;
    public static final int VIP_STANDARD = 1;
    public static final int VIP_PREMIUM = 2;

    // ====== 用户状态 ======
    public static final int USER_STATUS_DISABLED = 0;
    public static final int USER_STATUS_ACTIVE = 1;

    // ====== 项目状态 ======
    public static final String PROJECT_DRAFT = "DRAFT";
    public static final String PROJECT_IN_PROGRESS = "IN_PROGRESS";
    public static final String PROJECT_COMPLETED = "COMPLETED";

    // ====== 章节状态 ======
    public static final String CHAPTER_DRAFT = "DRAFT";
    public static final String CHAPTER_GENERATING = "GENERATING";
    public static final String CHAPTER_REVIEW = "REVIEW";
    public static final String CHAPTER_PUBLISHED = "PUBLISHED";

    // ====== 角色类型 ======
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_PROTAGONIST = "PROTAGONIST";
    public static final String ROLE_SUPPORTING = "SUPPORTING";
    public static final String ROLE_VILLAIN = "VILLAIN";

    // ====== 订阅计划 ======
    public static final String PLAN_FREE = "FREE";
    public static final String PLAN_STANDARD = "STANDARD";
    public static final String PLAN_PREMIUM = "PREMIUM";

    // ====== 章节版本来源 ======
    public static final String SOURCE_AI_GENERATED = "AI_GENERATED";
    public static final String SOURCE_USER_EDITED = "USER_EDITED";

    // ====== Token 类型 ======
    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";

    // ====== 认证验证码用途 ======
    public static final String CAPTCHA_PURPOSE_LOGIN = "LOGIN";
    public static final String CAPTCHA_PURPOSE_REGISTER_EMAIL = "REGISTER_EMAIL";

    // ====== 登录日志结果 ======
    public static final String LOGIN_LOG_RESULT_SUCCESS = "SUCCESS";
    public static final String LOGIN_LOG_RESULT_FAILURE = "FAILURE";

    // ====== AI 模型来源标识 ======
    public static final String MODEL_PLATFORM = "PLATFORM";
    public static final String MODEL_CUSTOM = "CUSTOM";
}
