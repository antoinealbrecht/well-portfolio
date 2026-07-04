import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../src/lib/prisma";
import {
  addExerciseSet,
  deleteExerciseSet,
} from "../../../src/server/workouts";

type WorkoutDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WorkoutDetailsPage({
  params,
}: WorkoutDetailsPageProps) {
  const { id } = await params;
  const workoutId = Number(id);

  const workout = await prisma.workout.findUnique({
    where: {
      id: workoutId,
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: {
            orderBy: {
              id: "asc",
            },
          },
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  const totalSets = workout.exercises.reduce(
    (sum, workoutExercise) => sum + workoutExercise.sets.length,
    0
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/workouts" className="text-sm text-blue-400">
          ← Back to workouts
        </Link>

        <header className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Workout</p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{workout.name}</h1>
              <p className="mt-1 text-zinc-400">
                {workout.date.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950 px-4 py-3 text-right">
              <p className="text-sm text-zinc-400">Logged Sets</p>
              <p className="text-2xl font-bold">{totalSets}</p>
            </div>
          </div>
        </header>

        <form
          action={addExerciseSet}
          className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <input type="hidden" name="workoutId" value={workout.id} />

          <p className="text-sm font-medium text-zinc-300">Add Set</p>

          <div className="mt-4 grid gap-3 md:grid-cols-6">
            <input
              name="exerciseName"
              placeholder="Exercise"
              className="rounded-xl bg-zinc-800 px-3 py-3 text-white outline-none md:col-span-2"
              required
            />

            <input
              name="muscleGroup"
              placeholder="Muscle"
              className="rounded-xl bg-zinc-800 px-3 py-3 text-white outline-none"
              required
            />

            <input
              name="weight"
              type="number"
              step="0.5"
              placeholder="Weight"
              className="rounded-xl bg-zinc-800 px-3 py-3 text-white outline-none"
              required
            />

            <input
              name="reps"
              type="number"
              placeholder="Reps"
              className="rounded-xl bg-zinc-800 px-3 py-3 text-white outline-none"
              required
            />

            <input
              name="rir"
              type="number"
              step="0.5"
              placeholder="RIR"
              className="rounded-xl bg-zinc-800 px-3 py-3 text-white outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500"
          >
            Add Set
          </button>
        </form>

        <section className="mt-8 space-y-5">
          {workout.exercises.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-lg font-semibold">No exercises yet</p>
              <p className="mt-2 text-sm text-zinc-400">
                Add your first exercise set above to start this workout.
              </p>
            </div>
          )}

          {workout.exercises.map((workoutExercise) => {
            const setCount = workoutExercise.sets.length;

            return (
              <div
                key={workoutExercise.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
              >
                <div className="border-b border-zinc-800 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
                        {workoutExercise.exercise.muscleGroup}
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        {workoutExercise.exercise.name}
                      </h2>
                    </div>

                    <div className="rounded-2xl bg-zinc-950 px-4 py-2 text-right">
                      <p className="text-xs text-zinc-500">Sets</p>
                      <p className="text-xl font-bold">{setCount}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[48px_1fr_1fr_1fr_72px] gap-2 border-b border-zinc-800 px-5 py-3 text-sm text-zinc-500">
                  <p>#</p>
                  <p>Weight</p>
                  <p>Reps</p>
                  <p>RIR</p>
                  <p className="text-right">Action</p>
                </div>

                <div className="divide-y divide-zinc-800">
                  {workoutExercise.sets.map((set, index) => (
                    <div
                      key={set.id}
                      className="grid grid-cols-[48px_1fr_1fr_1fr_72px] items-center gap-2 px-5 py-4 text-sm"
                    >
                      <p className="text-zinc-500">{index + 1}</p>

                      <p className="font-medium">{set.weight} lb</p>

                      <p className="font-medium">{set.reps}</p>

                      <p className="font-medium">{set.rir}</p>

                      <form
                        className="text-right"
                        action={async () => {
                          "use server";
                          await deleteExerciseSet(set.id, workout.id);
                        }}
                      >
                        <button type="submit" className="text-red-400">
                          Delete
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </section>
    </main>
  );
}