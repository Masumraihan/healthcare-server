/*
  Warnings:

  - A unique constraint covering the columns `[appointmentId]` on the table `doctor_schedules` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `doctor_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctor_schedules" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_appointmentId_key" ON "doctor_schedules"("appointmentId");

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
