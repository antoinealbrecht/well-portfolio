import Link from "next/link";
import { StatCard } from "./StatCard";
import { prisma } from "../../lib/prisma";

export default async function DashboardPage() {
  const latestWeight = await prisma.bodyWeightEntry.findFirst({
    orderBy: {
      date: "desc",
    },
  });

  const recentWeights = await prisma.bodyWeightEntry.findMany({
    orderBy: {
      date: "desc",
    },
    take: 7,
  });

  const latestNutrition = await prisma.nutritionEntry.findFirst({
    orderBy: {
      date: "desc",
    },
  });

  const latestRecovery = await prisma.recoveryEntry.findFirst({
    orderBy: {
      date: "desc",
    },
  });

  const latestWorkout = await prisma.workout.findFirst({
    orderBy: {
      date: "desc",
    },
  });

  const sevenEntryAverage =
    recentWeights.length > 0
      ? recentWeights.reduce((sum, entry) => sum + entry.weightLb, 0) /
        recentWeights.length
      : null;

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-400">
          Your current hypertrophy training overview.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard
            title="Current Weight"
            value={latestWeight ? `${latestWeight.weightLb} lb` : "--"}
            subtitle={
              sevenEntryAverage
                ? `7-entry avg: ${sevenEntryAverage.toFixed(1)} lb`
                : "No average yet"
            }
          />

          <StatCard
            title="Nutrition"
            value={
              latestNutrition ? `${latestNutrition.calories} kcal` : "--"
            }
            subtitle={
              latestNutrition
                ? `${latestNutrition.protein}g protein`
                : "No entry yet"
            }
          />

          <StatCard
            title="Recovery"
            value={
              latestRecovery ? `${latestRecovery.sleepHours}h sleep` : "--"
            }
            subtitle={
              latestRecovery
                ? `Sleep quality: ${latestRecovery.sleepQuality}/5`
                : "No entry yet"
            }
          />

          <StatCard
            title="Latest Workout"
            value={latestWorkout ? latestWorkout.name : "--"}
            subtitle={
              latestWorkout
                ? latestWorkout.date.toLocaleDateString()
                : "No workout yet"
            }
          />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/workouts"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold">Workouts</h2>
            <p className="mt-2 text-zinc-400">
              Log exercises, sets, reps, RIR, muscle groups, and volume.
            </p>
          </Link>

          <Link
            href="/weight"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold">Weight</h2>
            <p className="mt-2 text-zinc-400">
              Track bodyweight, trends, goals, and long-term progress.
            </p>
          </Link>

          <Link
            href="/nutrition"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold">Nutrition</h2>
            <p className="mt-2 text-zinc-400">
              Log calories and macros that support your training.
            </p>
          </Link>

          <Link
            href="/recovery"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold">Recovery</h2>
            <p className="mt-2 text-zinc-400">
              Track simple sleep signals that affect performance.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}