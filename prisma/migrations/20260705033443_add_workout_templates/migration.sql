-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "templateId" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WorkoutTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateExercise" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TemplateExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateSet" (
    "id" SERIAL NOT NULL,
    "templateExerciseId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "setType" "ExerciseSetType" NOT NULL DEFAULT 'REGULAR',
    "targetWeight" DOUBLE PRECISION,
    "minReps" INTEGER NOT NULL DEFAULT 8,
    "maxReps" INTEGER NOT NULL DEFAULT 12,
    "targetRir" DOUBLE PRECISION NOT NULL DEFAULT 2,

    CONSTRAINT "TemplateSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateExercise_templateId_position_idx" ON "TemplateExercise"("templateId", "position");

-- CreateIndex
CREATE INDEX "TemplateExercise_exerciseId_idx" ON "TemplateExercise"("exerciseId");

-- CreateIndex
CREATE INDEX "TemplateSet_templateExerciseId_position_idx" ON "TemplateSet"("templateExerciseId", "position");

-- CreateIndex
CREATE INDEX "Workout_templateId_idx" ON "Workout"("templateId");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutId_position_idx" ON "WorkoutExercise"("workoutId", "position");

-- CreateIndex
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "WorkoutExercise"("exerciseId");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateExercise" ADD CONSTRAINT "TemplateExercise_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateExercise" ADD CONSTRAINT "TemplateExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSet" ADD CONSTRAINT "TemplateSet_templateExerciseId_fkey" FOREIGN KEY ("templateExerciseId") REFERENCES "TemplateExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
