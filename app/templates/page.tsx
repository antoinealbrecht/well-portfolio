import Link from "next/link";
import { prisma } from "../../src/lib/prisma";
import { createWorkoutTemplate } from "../../src/server/templates";

export default async function TemplatesPage() {
  const templates = await prisma.workoutTemplate.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          exercises: true,
          workouts: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/workouts" className="text-sm text-blue-400">
          {"\u2190"} Back to workouts
        </Link>

        <header className="mt-6">
          <p className="text-sm font-medium text-blue-300">Well</p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Workout Templates
          </h1>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Build reusable workouts that can later be copied into active
            training sessions.
          </p>
        </header>

        <form
          action={createWorkoutTemplate}
          className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <h2 className="text-xl font-semibold">Create template</h2>

          <div className="mt-5 space-y-3">
            <input
              name="name"
              placeholder="Template name"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              required
            />

            <textarea
              name="description"
              placeholder="Description (optional)"
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
          >
            Create Template
          </button>
        </form>

        <section className="mt-8 space-y-4">
          {templates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center">
              <p className="text-lg font-semibold">No templates yet</p>

              <p className="mt-2 text-sm text-zinc-400">
                Create your first reusable workout template above.
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{template.name}</h2>

                    {template.description && (
                      <p className="mt-2 text-sm text-zinc-400">
                        {template.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="rounded-xl bg-zinc-950 px-3 py-2 text-center">
                      <p className="text-xs text-zinc-500">Exercises</p>
                      <p className="mt-1 font-semibold">
                        {template._count.exercises}
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-950 px-3 py-2 text-center">
                      <p className="text-xs text-zinc-500">Sessions</p>
                      <p className="mt-1 font-semibold">
                        {template._count.workouts}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </section>
    </main>
  );
}