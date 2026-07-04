import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../src/lib/prisma";
import {
  addExerciseSet,
  addSetBelow,
  deleteExerciseSet,
  toggleExerciseSetSkipped,
  updateExerciseSet,
  updateExerciseSetType,
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
            orderBy: [
              {
                position: "asc",
              },
              {
                id: "asc",
              },
            ],
          },
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  const completedSets = workout.exercises.reduce(
    (total, workoutExercise) =>
      total + workoutExercise.sets.filter((set) => set.completed).length,
    0,
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/workouts" className="text-sm text-blue-400">
          {"\u2190"} Back to workouts
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
              <p className="text-2xl font-bold">{completedSets}</p>
            </div>
          </div>
        </header>

        <form
          action={addExerciseSet}
          className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <input type="hidden" name="workoutId" value={workout.id} />

          <p className="text-sm font-medium text-zinc-300">Add Exercise</p>

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
            Add Exercise
          </button>
        </form>

        <section className="mt-8 space-y-5">
          {workout.exercises.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-lg font-semibold">No exercises yet</p>

              <p className="mt-2 text-sm text-zinc-400">
                Add your first exercise above to start this workout.
              </p>
            </div>
          )}

          {workout.exercises.map((workoutExercise) => {
            const setCount = workoutExercise.sets.length;
            const completedExerciseSets = workoutExercise.sets.filter(
              (set) => set.completed,
            ).length;

            return (
              <div
                key={workoutExercise.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900"
              >
                <div className="rounded-t-3xl border-b border-zinc-800 p-5">
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

                      <p className="text-xl font-bold">
                        {completedExerciseSets}/{setCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[32px_40px_1fr_1fr_1fr_72px] gap-2 border-b border-zinc-800 px-5 py-3 text-sm text-zinc-500">
                  <p />
                  <p>#</p>
                  <p>Weight</p>
                  <p>Reps</p>
                  <p>RIR</p>
                  <p className="text-center">Log</p>
                </div>

                <div className="divide-y divide-zinc-800">
                  {workoutExercise.sets.map((set, index) => (
                    <form
                      key={set.id}
                      action={updateExerciseSet}
                      className={`grid grid-cols-[32px_40px_1fr_1fr_1fr_72px] items-center gap-2 px-5 py-4 text-sm transition ${
                        set.skipped
                          ? "bg-zinc-950/50 opacity-50"
                          : set.completed
                            ? ""
                            : "bg-zinc-950/30"
                      }`}
                    >
                      <input type="hidden" name="setId" value={set.id} />
                      <input
                        type="hidden"
                        name="workoutId"
                        value={workout.id}
                      />

                      <details className="relative">
                        <summary
                          className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-white [&::-webkit-details-marker]:hidden"
                          aria-label={`Set ${index + 1} actions`}
                        >
                          ⋮
                        </summary>

                        <div className="absolute left-0 top-9 z-20 w-64 rounded-2xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
                          <p className="px-3 py-2 text-lg font-semibold text-zinc-400">
                            Set
                          </p>

                          <button
                            type="submit"
                            formNoValidate
                            formAction={async () => {
                              "use server";
                              await addSetBelow(set.id, workout.id);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
                          >
                            Add set below
                          </button>

                          <button
                            type="submit"
                            formNoValidate
                            formAction={async () => {
                              "use server";
                              await toggleExerciseSetSkipped(
                                set.id,
                                workout.id,
                              );
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
                          >
                            {set.skipped ? "Unskip set" : "Skip set"}
                          </button>

                          <button
                            type="submit"
                            formNoValidate
                            formAction={async () => {
                              "use server";
                              await deleteExerciseSet(set.id, workout.id);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                          >
                            Delete set
                          </button>

                          <div className="my-2 border-t border-zinc-700" />

                          <p className="px-3 py-2 text-lg font-semibold text-zinc-400">
                            Set Type
                          </p>

                          <button
                            type="submit"
                            formNoValidate
                            formAction={async () => {
                              "use server";
                              await updateExerciseSetType(
                                set.id,
                                workout.id,
                                "REGULAR",
                              );
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
                          >
                            <span className="w-4">
                              {set.setType === "REGULAR" ? "✓" : ""}
                            </span>

                            <span>
                              <span className="block">Regular</span>
                              <span className="block text-xs text-zinc-500">
                                Straight, down, ascending
                              </span>
                            </span>
                          </button>

                          <button
                            type="submit"
                            formNoValidate
                            formAction={async () => {
                              "use server";
                              await updateExerciseSetType(
                                set.id,
                                workout.id,
                                "MYOREP",
                              );
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
                          >
                            <span className="w-4">
                              {set.setType === "MYOREP" ? "✓" : ""}
                            </span>

                            <span>
                              <span className="block">M</span>
                              <span className="block text-xs text-zinc-500">
                                Myorep
                              </span>
                            </span>
                          </button>

                          <button
                            type="submit"
                            formNoValidate
                            formAction={async () => {
                              "use server";
                              await updateExerciseSetType(
                                set.id,
                                workout.id,
                                "MYOREP_MATCH",
                              );
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
                          >
                            <span className="w-4">
                              {set.setType === "MYOREP_MATCH" ? "✓" : ""}
                            </span>

                            <span>
                              <span className="block">MM</span>
                              <span className="block text-xs text-zinc-500">
                                Myorep Match
                              </span>
                            </span>
                          </button>
                        </div>
                      </details>

                      <div className="text-zinc-500">
                        <p>{index + 1}</p>

                        {set.setType !== "REGULAR" && (
                          <p className="mt-1 text-[10px] font-semibold text-blue-300">
                            {set.setType === "MYOREP" ? "M" : "MM"}
                          </p>
                        )}
                      </div>

                      <input
                        name="weight"
                        type="number"
                        step="0.5"
                        defaultValue={set.weight}
                        className={`rounded-lg border px-3 py-2 font-medium text-white outline-none transition focus:border-blue-500 ${
                          set.completed
                            ? "border-transparent bg-zinc-950"
                            : "border-dashed border-zinc-700 bg-zinc-800"
                        }`}
                        required
                      />

                      <input
                        name="reps"
                        type="number"
                        defaultValue={set.reps ?? ""}
                        placeholder="Reps"
                        className={`rounded-lg border px-3 py-2 font-medium text-white outline-none transition focus:border-blue-500 ${
                          set.completed
                            ? "border-transparent bg-zinc-950"
                            : "border-dashed border-zinc-700 bg-zinc-800"
                        }`}
                        required
                      />

                      <input
                        name="rir"
                        type="number"
                        step="0.5"
                        defaultValue={set.rir}
                        className={`rounded-lg border px-3 py-2 font-medium text-white outline-none transition focus:border-blue-500 ${
                          set.completed
                            ? "border-transparent bg-zinc-950"
                            : "border-dashed border-zinc-700 bg-zinc-800"
                        }`}
                        required
                      />

                      {set.skipped ? (
                        <p className="text-center text-xs font-medium text-zinc-500">
                          Skipped
                        </p>
                      ) : (
                        <button
                          type="submit"
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                            set.completed
                              ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                              : "border border-zinc-600 text-zinc-500 hover:border-green-500 hover:text-green-400"
                          }`}
                          title={set.completed ? "Update set" : "Complete set"}
                          aria-label={
                            set.completed
                              ? `Update set ${index + 1}`
                              : `Complete set ${index + 1}`
                          }
                        >
                          {set.completed ? "✓" : "○"}
                        </button>
                      )}
                    </form>
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
