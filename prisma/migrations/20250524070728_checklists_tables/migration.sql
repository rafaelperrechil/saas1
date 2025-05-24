-- CreateTable
CREATE TABLE `checklists` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `branch_id` VARCHAR(191) NOT NULL,
    `environment_id` VARCHAR(191) NOT NULL,
    `actived` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklist_sections` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `checklist_id` VARCHAR(191) NOT NULL,
    `position` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklist_items` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `checklist_section_id` VARCHAR(191) NOT NULL,
    `position` INTEGER NULL,
    `department_id` VARCHAR(191) NULL,
    `checklist_response_type_id` VARCHAR(191) NOT NULL,
    `allowNotApplicable` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklist_response_types` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `positiveLabel` VARCHAR(191) NOT NULL,
    `negativeLabel` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklist_executions` (
    `id` VARCHAR(191) NOT NULL,
    `checklist_id` VARCHAR(191) NOT NULL,
    `performed_by_id` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'IN_PROGRESS',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklist_execution_items` (
    `id` VARCHAR(191) NOT NULL,
    `checklist_execution_id` VARCHAR(191) NOT NULL,
    `checklist_item_id` VARCHAR(191) NOT NULL,
    `isPositive` BOOLEAN NOT NULL,
    `note` TEXT NULL,
    `photo_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `environments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_sections` ADD CONSTRAINT `checklist_sections_checklist_id_fkey` FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_items` ADD CONSTRAINT `checklist_items_checklist_section_id_fkey` FOREIGN KEY (`checklist_section_id`) REFERENCES `checklist_sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_items` ADD CONSTRAINT `checklist_items_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_items` ADD CONSTRAINT `checklist_items_checklist_response_type_id_fkey` FOREIGN KEY (`checklist_response_type_id`) REFERENCES `checklist_response_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_executions` ADD CONSTRAINT `checklist_executions_checklist_id_fkey` FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_executions` ADD CONSTRAINT `checklist_executions_performed_by_id_fkey` FOREIGN KEY (`performed_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_execution_items` ADD CONSTRAINT `checklist_execution_items_checklist_execution_id_fkey` FOREIGN KEY (`checklist_execution_id`) REFERENCES `checklist_executions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_execution_items` ADD CONSTRAINT `checklist_execution_items_checklist_item_id_fkey` FOREIGN KEY (`checklist_item_id`) REFERENCES `checklist_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
