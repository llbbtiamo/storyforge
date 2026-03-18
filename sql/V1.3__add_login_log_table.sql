-- --------------------------------------------------------
-- 登录日志表
-- --------------------------------------------------------

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
