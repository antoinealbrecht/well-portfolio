import Link from "next/link";

import { PageContainer } from "../../src/components/layout/PageContainer";
import { PageHeader } from "../../src/components/layout/PageHeader";
import { prisma } from "../../src/lib/prisma";

export default async function DashboardPage() {
  const latestWeight = await prisma.bodyWeightEntry.findFirst({
    orderBy: { date: "desc" },
  });

  const recentWeights = await prisma.bodyWeightEntry.findMany({
    orderBy: { date: "desc" },
    take: 7,
  });

  const latestNutrition = await prisma.nutritionEntry.findFirst({
    orderBy: { date: "desc" },
  });

  const latestRecovery = await prisma.recoveryEntry.findFirst({
    orderBy: { date: "desc" },
  });

  const today = new Date();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const workoutsThisWeek = await prisma.workout.findMany({
    where: {
      date: {
        gte: startOfWeek,
      },
    },
    orderBy: {
      date: "desc",
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  const latestWorkout = workoutsThisWeek[0];

  const weeklySetCount = workoutsThisWeek.reduce((sum, workout) => {
    const workoutSets = workout.exercises.reduce(
      (exerciseSum, workoutExercise) =>
        exerciseSum + workoutExercise.sets.length,
      0
    );

    return sum + workoutSets;
  }, 0);

  const muscleGroupSets = workoutsThisWeek.reduce<Record<string, number>>(
    (acc, workout) => {
      workout.exercises.forEach((workoutExercise) => {
        const muscleGroup = workoutExercise.exercise.muscleGroup;
        const setCount = workoutExercise.sets.length;

        acc[muscleGroup] = (acc[muscleGroup] ?? 0) + setCount;
      });

      return acc;
    },
    {}
  );

  const muscleGroupSetEntries = Object.entries(muscleGroupSets);

  const sevenEntryAverage =
    recentWeights.length > 0
      ? recentWeights.reduce((sum, entry) => sum + entry.weightLb, 0) /
        recentWeights.length
      : null;

  const calorieGoal = 2500;
  const proteinGoal = 170;
  const carbsGoal = 300;
  const fatGoal = 80;
  const sleepGoal = 8;
  const stepGoal = 10000;

  const caloriesPercent = latestNutrition
    ? Math.min((latestNutrition.calories / calorieGoal) * 100, 100)
    : 0;

  const proteinPercent = latestNutrition
    ? Math.min((latestNutrition.protein / proteinGoal) * 100, 100)
    : 0;

  const carbsPercent = latestNutrition
    ? Math.min((latestNutrition.carbs / carbsGoal) * 100, 100)
    : 0;

  const fatPercent = latestNutrition
    ? Math.min((latestNutrition.fat / fatGoal) * 100, 100)
    : 0;

  const sleepPercent = latestRecovery
    ? Math.min((latestRecovery.sleepHours / sleepGoal) * 100, 100)
    : 0;

  const stepsToday = 8500;
  const stepsPercent = Math.min((stepsToday / stepGoal) * 100, 100);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your training, nutrition, and recovery overview."
      />

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <Link
          href="/workouts"
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:bg-zinc-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Training</p>
              <h2 className="mt-1 text-2xl font-bold">
                {latestWorkout ? latestWorkout.name : "No workout yet"}
              </h2>
            </div>

            <span className="rounded-full bg-blue-600/20 px-3 py-1 text-sm text-blue-300">
              Hypertrophy
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>Meso Progress</span>
              <span>Week 1 / 6</span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-zinc-800">
              <div className="h-2 w-[16%] rounded-full bg-blue-500" />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-zinc-400">Weekly Volume</p>

            <p className="mt-1 text-3xl font-bold">{weeklySetCount} sets</p>
          </div>

          <div className="mt-6 space-y-3">
            {muscleGroupSetEntries.length > 0 ? (
              muscleGroupSetEntries.map(([muscleGroup, setCount]) => (
                <div key={muscleGroup}>
                  <div className="flex justify-between text-sm">
                    <span>{muscleGroup}</span>
                    <span>{setCount} sets</span>
                  </div>

                  <div className="mt-1 h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-zinc-500"
                      style={{
                        width: `${Math.min((setCount / 12) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                No exercise sets logged this week.
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Steps</span>
              <span>
                {stepsToday.toLocaleString()} / {stepGoal.toLocaleString()}
              </span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-zinc-500"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>
          </div>

        </Link>

        <Link
          href="/nutrition"
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:bg-zinc-800"
        >
          <p className="text-sm text-zinc-400">Nutrition</p>

          <div className="mt-1 flex items-end justify-between">
            <h2 className="text-2xl font-bold">
              {latestNutrition ? `${latestNutrition.calories} kcal` : "--"}
            </h2>
            <p className="text-sm text-zinc-400">Goal {calorieGoal}</p>
          </div>

          <div className="mt-4 h-2 rounded-full bg-zinc-800">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${caloriesPercent}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-zinc-950 p-4 text-center">
              <p className="text-sm text-zinc-400">Protein</p>
              <p className="mt-1 text-xl font-bold">
                {latestNutrition ? `${latestNutrition.protein}g` : "--"}
              </p>
              <p className="text-xs text-zinc-500">
                {proteinPercent.toFixed(0)}%
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950 p-4 text-center">
              <p className="text-sm text-zinc-400">Carbs</p>
              <p className="mt-1 text-xl font-bold">
                {latestNutrition ? `${latestNutrition.carbs}g` : "--"}
              </p>
              <p className="text-xs text-zinc-500">
                {carbsPercent.toFixed(0)}%
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950 p-4 text-center">
              <p className="text-sm text-zinc-400">Fat</p>
              <p className="mt-1 text-xl font-bold">
                {latestNutrition ? `${latestNutrition.fat}g` : "--"}
              </p>
              <p className="text-xs text-zinc-500">
                {fatPercent.toFixed(0)}%
              </p>
            </div>
          </div>

         <p className="mt-6 text-sm text-zinc-400">
          Adherence:{" "}
          {latestNutrition ? `${latestNutrition.adherence}/5` : "No entry yet"}
        </p>

        <div className="mt-6 rounded-2xl bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Body Weight</p>

          <p className="mt-1 text-xl font-bold">
            {latestWeight ? `${latestWeight.weightLb} lb` : "--"}
          </p>

          <p className="text-xs text-zinc-500">
            {sevenEntryAverage
              ? `7-entry avg ${sevenEntryAverage.toFixed(1)} lb`
              : "No average yet"}
          </p>
        </div>

        </Link>

        <Link
          href="/recovery"
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:bg-zinc-800"
        >
          <p className="text-sm text-zinc-400">Recovery</p>

          <h2 className="mt-1 text-2xl font-bold">
            {latestRecovery ? `${latestRecovery.sleepHours}h sleep` : "--"}
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Sleep quality:{" "}
            {latestRecovery ? `${latestRecovery.sleepQuality}/5` : "No entry yet"}
          </p>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Sleep Goal</span>
              <span>{sleepGoal}h</span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${sleepPercent}%` }}
              />
            </div>
          </div>
        </Link>
      </div>
    </PageContainer>
  );
}