-- AlterTable
ALTER TABLE `plans` ADD COLUMN `max_inspections` INTEGER NULL,
    ADD COLUMN `max_tickets` INTEGER NULL,
    MODIFY `max_users` INTEGER NULL;
