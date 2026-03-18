-- --------------------------------------------------------
-- 为所有表添加逻辑删除字段 deleted
-- --------------------------------------------------------

ALTER TABLE `sf_user`               ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_subscription`       ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_quota_account`      ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_world_template`     ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_project`            ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_world_setting`      ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_character`          ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_character_relation` ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_plot_outline`       ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_style_constraint`   ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_chapter`            ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_chapter_version`    ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_knowledge_entry`    ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
ALTER TABLE `sf_model_config`       ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删';
