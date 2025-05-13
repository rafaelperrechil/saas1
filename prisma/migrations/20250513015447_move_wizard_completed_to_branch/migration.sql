/*
  Warnings:

  - You are about to drop the column `wizard_completed` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `branches` ADD COLUMN `wizard_completed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `wizard_completed`;
