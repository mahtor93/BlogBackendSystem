/*
  Warnings:

  - You are about to drop the column `roleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,name]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `TenantUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenantId_fkey";

-- DropIndex
DROP INDEX "users_tenantId_idx";

-- AlterTable
ALTER TABLE "TenantUser" ADD COLUMN     "roleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roleId",
DROP COLUMN "tenantId";

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_tenantId_name_key" ON "UserRole"("tenantId", "name");

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
