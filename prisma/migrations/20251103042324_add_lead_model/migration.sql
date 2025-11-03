/*
  Warnings:

  - You are about to drop the column `address1` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `doctorHospital1` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `doctorHospital2` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `phone1` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `phone2` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `treatmentDate1` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `treatmentDate2` on the `IntakeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "IntakeInfo" DROP COLUMN "address1",
DROP COLUMN "address2",
DROP COLUMN "doctorHospital1",
DROP COLUMN "doctorHospital2",
DROP COLUMN "phone1",
DROP COLUMN "phone2",
DROP COLUMN "treatmentDate1",
DROP COLUMN "treatmentDate2",
ADD COLUMN     "currentDoctorHospital2" TEXT,
ADD COLUMN     "currentDoctorHospital3" TEXT,
ADD COLUMN     "currentHospitalAddressPhone2" TEXT,
ADD COLUMN     "currentHospitalAddressPhone3" TEXT,
ADD COLUMN     "currentTreatmentDetails2" TEXT,
ADD COLUMN     "currentTreatmentDetails3" TEXT,
ADD COLUMN     "currentTreatmentFrom2" TIMESTAMP(3),
ADD COLUMN     "currentTreatmentFrom3" TIMESTAMP(3),
ADD COLUMN     "currentTreatmentTo2" TIMESTAMP(3),
ADD COLUMN     "currentTreatmentTo3" TIMESTAMP(3),
ADD COLUMN     "defendant3Address" TEXT,
ADD COLUMN     "defendant3Carrier" TEXT,
ADD COLUMN     "defendant3CarrierPhone" TEXT,
ADD COLUMN     "defendant3Damage" TEXT,
ADD COLUMN     "defendant3Make" TEXT,
ADD COLUMN     "defendant3Model" TEXT,
ADD COLUMN     "defendant3Name" TEXT,
ADD COLUMN     "defendant3Year" TEXT,
ADD COLUMN     "hospitalName" TEXT,
ADD COLUMN     "hospitalized" TEXT,
ADD COLUMN     "injuryDescription" TEXT,
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passengerAge" TEXT,
ADD COLUMN     "priorAttorneys2" TEXT,
ADD COLUMN     "priorAttorneys3" TEXT,
ADD COLUMN     "priorDoctorHospital2" TEXT,
ADD COLUMN     "priorDoctorHospital3" TEXT,
ADD COLUMN     "priorHospitalAddressPhone2" TEXT,
ADD COLUMN     "priorHospitalAddressPhone3" TEXT,
ADD COLUMN     "priorInsuranceClaims2" TEXT,
ADD COLUMN     "priorInsuranceClaims3" TEXT,
ADD COLUMN     "priorTreatmentDetails2" TEXT,
ADD COLUMN     "priorTreatmentDetails3" TEXT,
ADD COLUMN     "priorTreatmentFrom2" TIMESTAMP(3),
ADD COLUMN     "priorTreatmentFrom3" TIMESTAMP(3),
ADD COLUMN     "priorTreatmentTo2" TIMESTAMP(3),
ADD COLUMN     "priorTreatmentTo3" TIMESTAMP(3),
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "relationshipToYou" TEXT,
ADD COLUMN     "seatbeltUsed" TEXT,
ADD COLUMN     "treatmentDetails" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "caseType" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "salutation" TEXT,
ADD COLUMN     "uniqueUserId" TEXT;

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "matter" TEXT NOT NULL DEFAULT '-',
    "description" TEXT,
    "referralSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uniqueUserId_key" ON "User"("uniqueUserId");
