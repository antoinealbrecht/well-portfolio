-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ExerciseSet_workoutExerciseId_position_idx" ON "ExerciseSet"("workoutExerciseId", "position");
