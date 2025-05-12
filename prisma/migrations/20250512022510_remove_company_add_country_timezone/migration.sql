/*
  Warnings:

  - You are about to drop the column `company` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `company`,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `timezone` VARCHAR(191) NULL;
