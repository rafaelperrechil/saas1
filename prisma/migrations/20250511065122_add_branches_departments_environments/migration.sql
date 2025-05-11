/*
  Warnings:

  - You are about to drop the column `organization_id` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `environments` table. All the data in the column will be lost.
  - Added the required column `branch_id` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_id` to the `environments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `departments` DROP FOREIGN KEY `departments_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `environments` DROP FOREIGN KEY `environments_organization_id_fkey`;

-- AlterTable
ALTER TABLE `departments` DROP COLUMN `organization_id`,
    ADD COLUMN `branch_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `environments` DROP COLUMN `organization_id`,
    ADD COLUMN `branch_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `branches` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `branches` ADD CONSTRAINT `branches_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `environments` ADD CONSTRAINT `environments_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
