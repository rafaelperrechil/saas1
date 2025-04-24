/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `resetToken` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `loginlog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `loginlog` DROP FOREIGN KEY `LoginLog_userId_fkey`;

-- DropIndex
DROP INDEX `User_resetToken_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `resetToken`,
    DROP COLUMN `resetTokenExpiry`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `loginlog`;
