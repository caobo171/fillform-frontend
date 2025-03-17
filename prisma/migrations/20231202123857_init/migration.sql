-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `fullname` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NOT NULL,
    `role` INTEGER NOT NULL,
    `cover_avatar` VARCHAR(255) NOT NULL,
    `status` INTEGER NOT NULL,
    `address` TEXT NOT NULL,
    `user_type` TEXT NOT NULL,
    `phone` VARCHAR(128) NOT NULL,
    `sex` VARCHAR(32) NOT NULL,
    `description` TEXT NOT NULL,
    `last_login` INTEGER NOT NULL,
    `since` INTEGER NOT NULL,
    `contact` VARCHAR(255) NOT NULL,
    `last_update` INTEGER NOT NULL,
    `data` TEXT NOT NULL,
    `facebook` TEXT NOT NULL,
    `seen_notification_ids` TEXT NOT NULL,

    INDEX `Users_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBillboards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `fullname` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `avatar` VARCHAR(255) NOT NULL,
    `total_score` DOUBLE NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `records` TEXT NOT NULL,

    INDEX `UserBillboards_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CycleBillboards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `podcast_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `results` TEXT NOT NULL,

    INDEX `CycleBillboards_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonalRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `following_users` TEXT NOT NULL,
    `vocabs` TEXT NOT NULL,
    `time_listen` TEXT NOT NULL,
    `points` TEXT NOT NULL,
    `words` TEXT NOT NULL,
    `cache_submits` TEXT NOT NULL,
    `cache_vocabs` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserActionLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `podcast_id` VARCHAR(128) NOT NULL,
    `status` INTEGER NOT NULL,
    `data` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `metatype` VARCHAR(128) NOT NULL,
    `action` VARCHAR(128) NOT NULL,
    `start_time` INTEGER NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `like_logs` TEXT NOT NULL,
    `comments` TEXT NOT NULL,
    `comment_count` INTEGER NOT NULL DEFAULT 0,
    `allow_comment` TINYINT NOT NULL DEFAULT 1,
    `is_public` TINYINT NOT NULL DEFAULT 1,
    `end_time` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `podcast_image` TEXT NOT NULL,
    `podcast_name` VARCHAR(255) NOT NULL,
    `podcast_sub_name` VARCHAR(255) NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `user_avatar` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PodcastCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `data` TEXT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `views` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Podcast` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `download_link` TEXT NOT NULL,
    `data` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `duration` INTEGER NOT NULL,
    `image_url` TEXT NOT NULL,
    `hint` TEXT NOT NULL,
    `narrator` TEXT NOT NULL,
    `source_key` TINYINT NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `file_size` INTEGER NOT NULL,
    `file_path` TEXT NOT NULL,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `sub_name` VARCHAR(255) NOT NULL,
    `result` TEXT NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `views` INTEGER NOT NULL,
    `members` TEXT NOT NULL,
    `member_count` INTEGER NOT NULL DEFAULT 0,
    `collections` VARCHAR(255) NOT NULL,
    `class_id` INTEGER NOT NULL DEFAULT 0,
    `private` INTEGER NOT NULL DEFAULT 0,

    INDEX `Podcast_class_id_idx`(`class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PodcastTranscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `podcast_id` INTEGER NOT NULL DEFAULT 0,
    `transcriptions` LONGTEXT NOT NULL,
    `origin_transcription_sentences` LONGTEXT NOT NULL,
    `origin_transcriptions` LONGTEXT NOT NULL,
    `transcription_sentences` LONGTEXT NOT NULL,
    `transcription_words` LONGTEXT NOT NULL,

    INDEX `PodcastTranscription_podcast_id_idx`(`podcast_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PodcastSubmit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `data` TEXT NOT NULL,
    `status` INTEGER NOT NULL,
    `draft_array` TEXT NOT NULL,
    `podcast_id` INTEGER NOT NULL,
    `submit_time` INTEGER NOT NULL DEFAULT 0,
    `podcast_name` VARCHAR(255) NOT NULL,
    `podcast_subname` VARCHAR(255) NOT NULL,
    `podcast_result` TEXT NOT NULL,
    `podcast_hints` TEXT NOT NULL,
    `compare_result` TEXT NOT NULL,
    `results` TEXT NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `user_avatar` TEXT NOT NULL,
    `current_time_listen` INTEGER NOT NULL,
    `listen_time` INTEGER NOT NULL,
    `point` DOUBLE NOT NULL,

    INDEX `PodcastSubmit_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Challenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `data` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `background_image` TEXT NOT NULL,
    `start_time` INTEGER NOT NULL,
    `end_time` INTEGER NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `status` VARCHAR(15) NOT NULL,
    `podcast_ids` TEXT NOT NULL,
    `challenge_type` TEXT NOT NULL,
    `type_keys` VARCHAR(15) NOT NULL,

    INDEX `Challenge_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `object_id` INTEGER NOT NULL,
    `object_export` TEXT NOT NULL,
    `object_type` VARCHAR(128) NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `data` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `user_avatar` TEXT NOT NULL,

    INDEX `Comments_user_id_object_id_idx`(`user_id`, `object_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `object_id` INTEGER NOT NULL,
    `object_export` TEXT NOT NULL,
    `object_type` VARCHAR(128) NOT NULL,
    `since` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `object_status` INTEGER NOT NULL DEFAULT 0,
    `content` TEXT NOT NULL,
    `data` TEXT NOT NULL,
    `link` TEXT NOT NULL,
    `action` VARCHAR(128) NOT NULL,
    `image` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `user_avatar` TEXT NOT NULL,
    `from_id` INTEGER NOT NULL,
    `from_name` VARCHAR(255) NOT NULL,
    `from_avatar` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notification_ids` TEXT NOT NULL,
    `metatype` VARCHAR(128) NOT NULL,
    `is_private` INTEGER NOT NULL DEFAULT 0,
    `receivers` TEXT NOT NULL,
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `image` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `data` TEXT NOT NULL,
    `link` TEXT NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `publish_time` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL DEFAULT 0,

    INDEX `SystemNotification_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `since` INTEGER NOT NULL DEFAULT 0,
    `last_update` INTEGER NOT NULL,
    `image` TEXT NOT NULL,
    `for_user_id` INTEGER NOT NULL DEFAULT 0,
    `for_user_name` VARCHAR(255) NOT NULL,
    `for_user_avatar` VARCHAR(255) NOT NULL,
    `certification_type` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL DEFAULT 0,
    `user_name` VARCHAR(255) NOT NULL,
    `user_avatar` VARCHAR(255) NOT NULL,
    `user_action_log_id` INTEGER NOT NULL,
    `data` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBadges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` VARCHAR(128) NOT NULL,
    `since` INTEGER NOT NULL DEFAULT 0,
    `last_update` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL DEFAULT 0,
    `obj` TEXT NOT NULL,
    `badge_name` VARCHAR(127) NOT NULL,
    `seen` INTEGER NOT NULL DEFAULT 0,
    `data` TEXT NOT NULL,
    `value` VARCHAR(127) NOT NULL,

    INDEX `UserBadges_user_id_badge_name_value_idx`(`user_id`, `badge_name`, `value`),
    INDEX `UserBadges_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecordChallengeUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metatype` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `challenge_id` INTEGER NOT NULL,
    `data` TEXT NOT NULL,
    `since` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `point` INTEGER NOT NULL,
    `hash_key` VARCHAR(50) NOT NULL,
    `time_listen` INTEGER NOT NULL DEFAULT 0,
    `total_time_listen` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL DEFAULT 0,
    `rank_record` TEXT NOT NULL,
    `username` VARCHAR(127) NOT NULL,

    INDEX `RecordChallengeUser_username_idx`(`username`),
    INDEX `RecordChallengeUser_hash_key_idx`(`hash_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeleClass` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(255) NOT NULL,
    `owner_id` INTEGER NOT NULL DEFAULT 0,
    `image_url` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `members` MEDIUMTEXT NOT NULL,
    `metatype` VARCHAR(32) NOT NULL,
    `since` INTEGER NOT NULL DEFAULT 0,
    `last_update` INTEGER NOT NULL,

    INDEX `WeleClass_owner_id_idx`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeleClassFollowing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL DEFAULT 0,
    `image_url` TEXT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `owner_id` INTEGER NOT NULL DEFAULT 0,
    `ownering` INTEGER NOT NULL DEFAULT 0,
    `membering` INTEGER NOT NULL DEFAULT 0,
    `object_id` INTEGER NOT NULL DEFAULT 0,
    `metatype` VARCHAR(32) NOT NULL,
    `members` TEXT NOT NULL,
    `since` INTEGER NOT NULL DEFAULT 0,
    `last_update` INTEGER NOT NULL,

    INDEX `WeleClassFollowing_user_id_idx`(`user_id`),
    INDEX `WeleClassFollowing_ownering_idx`(`ownering`),
    INDEX `WeleClassFollowing_membering_idx`(`membering`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PodcastChallenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `podcast_id` INTEGER NOT NULL,
    `challenge_id` INTEGER NOT NULL,
    `record_challenge_user_id` INTEGER NOT NULL,
    `metatype` TEXT NOT NULL,
    `data` TEXT NOT NULL,
    `point` INTEGER NOT NULL,
    `time_listen` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `results` TEXT NOT NULL,
    `submit_time` INTEGER NOT NULL,
    `hash_key` VARCHAR(50) NOT NULL,
    `rank_record` TEXT NOT NULL,

    INDEX `PodcastChallenge_hash_key_idx`(`hash_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamChallenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `avatar` TEXT NOT NULL,
    `metatype` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `challenge_id` INTEGER NOT NULL,
    `data` TEXT NOT NULL,
    `create_at` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `user_ids` TEXT NOT NULL,
    `hash_key` VARCHAR(30) NOT NULL,
    `point` INTEGER NOT NULL,
    `user_invited_ids` TEXT NOT NULL,
    `user_banned_ids` TEXT NOT NULL,
    `user_requested_ids` TEXT NOT NULL,
    `admin_ids` TEXT NOT NULL,
    `time_listen` INTEGER NOT NULL,
    `rank_record` TEXT NOT NULL,

    INDEX `TeamChallenge_hash_key_idx`(`hash_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPlaylists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `podcasts` TEXT NOT NULL,
    `last_update` INTEGER NOT NULL,
    `since` INTEGER NOT NULL,

    INDEX `UserPlaylists_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` INTEGER NOT NULL,
    `plan` VARCHAR(32) NOT NULL,
    `period` VARCHAR(32) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `since` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `paid` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,

    INDEX `OrderSubscription_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` INTEGER NOT NULL,
    `plan` VARCHAR(32) NOT NULL,
    `start_date` INTEGER NOT NULL,
    `end_date` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `creator_id` INTEGER NOT NULL,
    `order_id` INTEGER NOT NULL,
    `free_trial` INTEGER NOT NULL,
    `paid` INTEGER NOT NULL,
    `since` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `last_update` INTEGER NOT NULL,

    INDEX `Subscriptions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
