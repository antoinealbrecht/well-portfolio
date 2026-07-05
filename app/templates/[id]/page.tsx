import Link from "next/link";
import { addExerciseToTemplate } from "../../../src/server/templates";
import { notFound } from "next/navigation";
import { prisma } from "../../../src/lib/prisma";

type TemplateDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatSetType(setType: string) {
  if (setType === "MYOREP") {
    return "M";
  }

  if (setType === "MYOREP_MATCH") {
    return "MM";
  }

  return "Regular";
}

export default async function TemplateDetailsPage({
  params,
}: TemplateDetailsPageProps) {
  const { id } = await params;
  const templateId = Number(id);

  if (!Number.isInteger(templateId)) {
    notFound();
  }

  const template = await prisma.workoutTemplate.findUnique({
    where: {
      id: templateId,
    },
    include: {
      exercises: {
        orderBy: {
          position: "asc",
        },
        include: {
          exercise: true,
          sets: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
      _count: {
        select: {
          workouts: true,
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  const totalSets = template.exercises.reduce(
    (total, templateExercise) =>
      total + templateExercise.sets.length,
    0
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/templates" className="text-sm text-blue-400">
          {"\u2190"} Back to templates
        </Link>

        <header className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm font-medium text-blue-300">
            Workout Template
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {template.name}
              </h1>

              {template.description && (
                <p className="mt-2 max-w-2xl text-zinc-400">
                  {template.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <div className="rounded-2xl bg-zinc-950 px-4 py-3 text-center">
                <p className="text-xs text-zinc-500">Exercises</p>
                <p className="mt-1 text-xl font-bold">
                  {template.exercises.length}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-950 px-4 py-3 text-center">
                <p className="text-xs text-zinc-500">Sets</p>
                <p className="mt-1 text-xl font-bold">{totalSets}</p>
              </div>

              <div className="rounded-2xl bg-zinc-950 px-4 py-3 text-center">
                <p className="text-xs text-zinc-500">Sessions</p>
                <p className="mt-1 text-xl font-bold">
                  {template._count.workouts}
                </p>
              </div>
            </div>
          </div>
        </header>
        
        <form
            action={addExerciseToTemplate}
            className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
        >
        <input
            type="hidden"
            name="templateId"
            value={template.id}
        />

        <div>
            <p className="text-sm font-medium text-blue-300">
            Template Builder
            </p>

            <h2 className="mt-1 text-xl font-semibold">
            Add exercise
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
            Create the exercise and its planned working sets.
            </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
            <span className="text-sm text-zinc-400">
                Exercise
            </span>

            <input
                name="exerciseName"
                placeholder="Bench Press"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                required
            />
            </label>

            <label className="space-y-2">
            <span className="text-sm text-zinc-400">
                Muscle group
            </span>

            <input
                name="muscleGroup"
                placeholder="Chest"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                required
            />
            </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="space-y-2">
            <span className="text-sm text-zinc-400">
                Sets
            </span>

            <input
                name="setCount"
                type="number"
                min="1"
                max="10"
                defaultValue="3"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                required
            />
            </label>

            <label className="space-y-2">
            <span className="text-sm text-zinc-400">
                Min reps
            </span>

            <input
                name="minReps"
                type="number"
                min="1"
                defaultValue="8"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                required
            />
            </label>

            <label className="space-y-2">
            <span className="text-sm text-zinc-400">
                Max reps
            </span>

            <input
                name="maxReps"
                type="number"
                min="1"
                defaultValue="12"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                required
            />
            </label>

            <label className="space-y-2">
            <span className="text-sm text-zinc-400">
                Target RIR
            </span>

            <input
                name="targetRir"
                type="number"
                min="0"
                step="0.5"
                defaultValue="2"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                required
            />
            </label>

            <label className="space-y-2">
            <span className="text-sm text-zinc-400">
                Weight
            </span>

            <input
                name="targetWeight"
                type="number"
                min="0"
                step="0.5"
                placeholder="Auto"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
            />
            </label>
        </div>

        <button
            type="submit"
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
        >
            Add Exercise
        </button>
        </form>

        <section className="mt-8 space-y-5">
          {template.exercises.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center">
              <p className="text-lg font-semibold">
                No exercises in this template
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                The next step is adding exercises and planned sets.
              </p>
            </div>
          ) : (
            template.exercises.map((templateExercise) => (
              <article
                key={templateExercise.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
              >
                <header className="border-b border-zinc-800 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
                    {templateExercise.exercise.muscleGroup}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">
                      {templateExercise.exercise.name}
                    </h2>

                    <div className="rounded-xl bg-zinc-950 px-3 py-2 text-center">
                      <p className="text-xs text-zinc-500">Sets</p>
                      <p className="font-semibold">
                        {templateExercise.sets.length}
                      </p>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-[48px_1fr_1fr_1fr_80px] gap-3 border-b border-zinc-800 px-5 py-3 text-sm text-zinc-500">
                  <p>#</p>
                  <p>Weight</p>
                  <p>Reps</p>
                  <p>RIR</p>
                  <p>Type</p>
                </div>

                <div className="divide-y divide-zinc-800">
                  {templateExercise.sets.map((set, index) => (
                    <div
                      key={set.id}
                      className="grid grid-cols-[48px_1fr_1fr_1fr_80px] items-center gap-3 px-5 py-4 text-sm"
                    >
                      <p className="text-zinc-500">{index + 1}</p>

                      <p className="font-medium">
                        {set.targetWeight === null
                          ? "Auto"
                          : `${set.targetWeight} lb`}
                      </p>

                      <p className="font-medium">
                        {set.minReps === set.maxReps
                          ? set.minReps
                          : `${set.minReps}–${set.maxReps}`}
                      </p>

                      <p className="font-medium">{set.targetRir}</p>

                      <p className="text-xs font-semibold text-blue-300">
                        {formatSetType(set.setType)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}