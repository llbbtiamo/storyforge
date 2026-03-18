-- --------------------------------------------------------
-- StoryForge Database Initialization Script
-- Engine: MySQL 8.0+ / InnoDB
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS storyforge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE storyforge;

-- ==================== 1. 用户与计费模块 ====================

-- 用户表
CREATE TABLE IF NOT EXISTS `sf_user` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `username`        VARCHAR(50) NOT NULL COMMENT '登录用户名',
    `email`           VARCHAR(100) NOT NULL COMMENT '邮箱',
    `password_hash`   VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `nickname`        VARCHAR(50) COMMENT '昵称',
    `avatar_url`      VARCHAR(500) COMMENT '头像URL',
    `vip_level`       TINYINT DEFAULT 0 COMMENT 'VIP等级：0-免费 1-标准VIP 2-高级VIP',
    `status`          TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 订阅信息表
CREATE TABLE IF NOT EXISTS `sf_subscription` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT NOT NULL COMMENT '用户ID',
    `plan_type`       VARCHAR(20) NOT NULL COMMENT '计划类型: FREE/STANDARD/PREMIUM',
    `start_date`      DATE NOT NULL COMMENT '订阅开始日期',
    `end_date`        DATE NOT NULL COMMENT '订阅结束日期',
    `auto_renew`      TINYINT(1) DEFAULT 1 COMMENT '是否自动续期',
    `status`          VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE/EXPIRED/CANCELED',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅信息表';

-- 额度账户表
CREATE TABLE IF NOT EXISTS `sf_quota_account` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT NOT NULL COMMENT '用户ID',
    `total_quota`     INT DEFAULT 0 COMMENT '总额度（Token/字数估算）',
    `used_quota`      INT DEFAULT 0 COMMENT '已使用额度',
    `monthly_quota`   INT DEFAULT 0 COMMENT '月度订阅赠送额度',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='额度账户表';


-- ==================== 2. 项目与全局设定模块 ====================

-- 世界观模板表（通用设定，跨项目复用）
CREATE TABLE IF NOT EXISTS `sf_world_template` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT NOT NULL COMMENT '创建者用户ID',
    `name`            VARCHAR(100) NOT NULL COMMENT '模板名称',
    `description`     TEXT COMMENT '模板描述',
    `is_public`       TINYINT(1) DEFAULT 0 COMMENT '是否公开分享',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='世界观模板表';

-- 项目表（小说）
CREATE TABLE IF NOT EXISTS `sf_project` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT NOT NULL COMMENT '所属用户ID',
    `title`           VARCHAR(200) NOT NULL COMMENT '小说标题',
    `description`     TEXT COMMENT '小说简介',
    `genre`           VARCHAR(50) COMMENT '题材类型: 玄幻/都市/科幻等',
    `status`          VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态: DRAFT/IN_PROGRESS/COMPLETED',
    `world_template_id` BIGINT COMMENT '关联的世界观模板ID(可选)',
    `cover_url`       VARCHAR(500) COMMENT '封面URL',
    `word_count`      INT DEFAULT 0 COMMENT '已生成字数',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小说项目表';

-- 世界观设定条目表
CREATE TABLE IF NOT EXISTS `sf_world_setting` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `project_id`      BIGINT COMMENT '关联项目ID (与模板互斥)',
    `template_id`     BIGINT COMMENT '关联模板ID (与项目互斥)',
    `category`        VARCHAR(50) NOT NULL COMMENT '设定分类: 地理/势力/境界/物品等',
    `name`            VARCHAR(100) NOT NULL COMMENT '设定名称',
    `content`         JSON NOT NULL COMMENT '设定详情 (灵活结构)',
    `sort_order`      INT DEFAULT 0 COMMENT '排序',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='世界观设定条目表';


-- ==================== 3. 角色与大纲模块 ====================

-- 角色档案表
CREATE TABLE IF NOT EXISTS `sf_character` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `project_id`      BIGINT NOT NULL COMMENT '所属项目ID',
    `name`            VARCHAR(100) NOT NULL COMMENT '角色名',
    `role_type`       VARCHAR(20) COMMENT '角色定位: PROTAGONIST/SUPPORTING/VILLAIN',
    `basic_info`      JSON COMMENT '基础信息 (年龄、外貌、性格等)',
    `backstory`       TEXT COMMENT '背景故事',
    `motivation`      TEXT COMMENT '核心动机',
    `avatar_url`      VARCHAR(500) COMMENT '头像URL',
    `sort_order`      INT DEFAULT 0 COMMENT '排序',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色档案表';

-- 角色关系表
CREATE TABLE IF NOT EXISTS `sf_character_relation` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `project_id`      BIGINT NOT NULL COMMENT '所属项目ID',
    `character_id_a`  BIGINT NOT NULL COMMENT '角色A ID',
    `character_id_b`  BIGINT NOT NULL COMMENT '角色B ID',
    `relation_type`   VARCHAR(50) NOT NULL COMMENT '关系类型 (宿敌/挚友/恋人/亲属)',
    `description`     TEXT COMMENT '关系具体描述',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_characters` (`project_id`, `character_id_a`, `character_id_b`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色关系表';

-- 剧情大纲表
CREATE TABLE IF NOT EXISTS `sf_plot_outline` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `project_id`      BIGINT NOT NULL COMMENT '所属项目ID',
    `parent_id`       BIGINT COMMENT '父节点ID (构建卷-章-节树)',
    `title`           VARCHAR(200) NOT NULL COMMENT '节点标题',
    `summary`         TEXT COMMENT '局部大纲/事件梗概',
    `key_events`      JSON COMMENT '关键事件列表 (用于AI指导)',
    `level`           TINYINT DEFAULT 1 COMMENT '层级: 1-卷 2-章 3-节',
    `sort_order`      INT DEFAULT 0 COMMENT '排序',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧情大纲表';

-- 风格约束表
CREATE TABLE IF NOT EXISTS `sf_style_constraint` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `project_id`      BIGINT NOT NULL COMMENT '所属项目ID',
    `narrative_voice` VARCHAR(50) COMMENT '叙事视角 (第一人称/第三人称有限/上帝视角)',
    `writing_style`   VARCHAR(50) COMMENT '文风 (悬疑/网文白话/古风/翻译腔)',
    `tone`            VARCHAR(50) COMMENT '基调 (轻松/黑暗/史诗)',
    `taboos`          JSON COMMENT '禁忌事项 (绝不要写什么)',
    `custom_rules`    JSON COMMENT '自定义写作Prompt指令',
    `reference_text`  TEXT COMMENT '文风参考片段',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='风格约束表';


-- ==================== 4. 章节内容模块 ====================

-- 章节草稿与发布表
CREATE TABLE IF NOT EXISTS `sf_chapter` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `project_id`      BIGINT NOT NULL COMMENT '所属项目ID',
    `outline_id`      BIGINT COMMENT '关联的剧情大纲节点ID',
    `chapter_number`  INT NOT NULL COMMENT '序号 (第X章)',
    `title`           VARCHAR(200) COMMENT '章节标题',
    `content`         LONGTEXT COMMENT '最新章节正文',
    `word_count`      INT DEFAULT 0 COMMENT '字数',
    `status`          VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态: DRAFT/GENERATING/REVIEW/PUBLISHED',
    `ai_model_used`   VARCHAR(50) COMMENT '最近一次生成使用的模型标识',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_project_chapter_number` (`project_id`, `chapter_number`),
    KEY `idx_outline_id` (`outline_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='章节表';

-- 章节历史版本表
CREATE TABLE IF NOT EXISTS `sf_chapter_version` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `chapter_id`      BIGINT NOT NULL COMMENT '章节ID',
    `version_number`  INT NOT NULL COMMENT '版本号',
    `content`         LONGTEXT NOT NULL COMMENT '该版本正文',
    `source`          VARCHAR(20) COMMENT '来源: AI_GENERATED/USER_EDITED',
    `generation_params` JSON COMMENT '如果为AI生成，保存当时的Prompt快照',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_chapter_version_number` (`chapter_id`, `version_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='章节历史版本表';

-- 知识库条目表 (RAG使用)
CREATE TABLE IF NOT EXISTS `sf_knowledge_entry` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `project_id`      BIGINT NOT NULL COMMENT '所属项目ID',
    `title`           VARCHAR(200) NOT NULL COMMENT '条目标题',
    `content`         TEXT NOT NULL COMMENT '条目内容',
    `category`        VARCHAR(50) COMMENT '分类 (灵感/备忘/素材等)',
    `embedding`       JSON COMMENT '向量化数据缓存 (供检索使用)',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目私有知识库';


-- ==================== 5. 系统与配置模块 ====================

-- 用户自定义模型配置表
CREATE TABLE IF NOT EXISTS `sf_model_config` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT NOT NULL COMMENT '用户ID',
    `provider`        VARCHAR(50) NOT NULL COMMENT '模型提供商 (openai/deepseek/anthropic等)',
    `model_name`      VARCHAR(100) NOT NULL COMMENT '模型版本标识 (如 gpt-4o)',
    `api_key_encrypted` VARCHAR(500) NOT NULL COMMENT '加密存储的API Key',
    `base_url`        VARCHAR(500) COMMENT '自定义代理/API网关地址',
    `is_default`      TINYINT(1) DEFAULT 0 COMMENT '是否为当前默认使用的模型',
    `status`          TINYINT DEFAULT 1 COMMENT '1-有效 0-无效',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户自定义模型配置表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS `sf_login_log` (
    `id`                      BIGINT NOT NULL AUTO_INCREMENT,
    `user_id`                 BIGINT COMMENT '用户ID，失败时可为空',
    `login_identifier`        VARCHAR(100) NOT NULL COMMENT '登录标识，本期为用户名',
    `result`                  VARCHAR(20) NOT NULL COMMENT '结果: SUCCESS/FAILURE',
    `failure_reason`          VARCHAR(255) COMMENT '失败原因',
    `ip_address`              VARCHAR(64) COMMENT 'IP地址',
    `user_agent`              VARCHAR(1000) COMMENT 'User-Agent',
    `browser_name`            VARCHAR(100) COMMENT '浏览器名称',
    `os_name`                 VARCHAR(100) COMMENT '操作系统名称',
    `client_fingerprint_hash` VARCHAR(64) COMMENT '客户端指纹哈希',
    `created_at`              DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`                 TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_result_created_at` (`result`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- 初始管理员账号
INSERT INTO `sf_user` (`username`, `email`, `password_hash`, `nickname`, `vip_level`)
VALUES ('admin', 'admin@storyforge.local', '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Admin', 2);
