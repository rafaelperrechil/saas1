/*
  Warnings:

  - Added the required column `time` to the `checklists` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checklists` ADD COLUMN `daysOfWeek` JSON NULL,
    ADD COLUMN `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTRAL', 'ANNUAL') NOT NULL DEFAULT 'DAILY',
    ADD COLUMN `time` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `checklist_users` (
    `checklist_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `checklist_users_user_id_idx`(`user_id`),
    PRIMARY KEY (`checklist_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checklist_users` ADD CONSTRAINT `checklist_users_checklist_id_fkey` FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_users` ADD CONSTRAINT `checklist_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
