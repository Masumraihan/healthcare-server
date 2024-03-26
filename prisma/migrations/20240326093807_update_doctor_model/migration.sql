/*
  Warnings:

  - You are about to drop the column `designatination` on the `doctors` table. All the data in the column will be lost.
  - Added the required column `designation` to the `doctors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "designatination",
ADD COLUMN     "designation" TEXT NOT NULL;
