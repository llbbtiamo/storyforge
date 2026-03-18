-- --------------------------------------------------------
-- Chapter workflow alignment
-- --------------------------------------------------------

SET @has_chapter_version_updated_at = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sf_chapter_version'
      AND COLUMN_NAME = 'updated_at'
);
SET @sql = IF(@has_chapter_version_updated_at = 0,
    'ALTER TABLE `sf_chapter_version` ADD COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''更新时间'' AFTER `created_at`',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_project_chapter_number_index = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sf_chapter'
      AND INDEX_NAME = 'uk_project_chapter_number'
);
SET @sql = IF(@has_project_chapter_number_index = 0,
    'ALTER TABLE `sf_chapter` ADD CONSTRAINT `uk_project_chapter_number` UNIQUE (`project_id`, `chapter_number`)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_chapter_version_number_index = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sf_chapter_version'
      AND INDEX_NAME = 'uk_chapter_version_number'
);
SET @sql = IF(@has_chapter_version_number_index = 0,
    'ALTER TABLE `sf_chapter_version` ADD CONSTRAINT `uk_chapter_version_number` UNIQUE (`chapter_id`, `version_number`)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
