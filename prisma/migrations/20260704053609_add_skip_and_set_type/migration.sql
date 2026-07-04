-- CreateEnum
CREATE TYPE "ExerciseSetType" AS ENUM ('REGULAR', 'MYOREP', 'MYOREP_MATCH');

-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN     "setType" "ExerciseSetType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "skipped" BOOLEAN NOT NULL DEFAULT false;
