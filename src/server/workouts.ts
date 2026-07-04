"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

function revalidateWorkout(workoutId: number) {
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
}

function readOptionalNumber(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();

  if (value === "") {
    return null;
  }

  return Number(value);
}

async function getNextSetPosition(workoutExerciseId: number) {
  const lastSet = await prisma.exerciseSet.findFirst({
    where: {
      workoutExerciseId,
    },
    orderBy: [
      {
        position: "desc",
      },
      {
        id: "desc",
      },
    ],
    select: {
      position: true,
    },
  });

  return lastSet ? lastSet.position + 1 : 0;
}

/*
  Existing sets received position 0 during the migration.

  This fixes their positions the first time an insert or delete action
  is performed for that exercise.
*/
async function normalizeSetPositions(workoutExerciseId: number) {
  const sets = await prisma.exerciseSet.findMany({
    where: {
      workoutExerciseId,
    },
    orderBy: [
      {
        position: "asc",
      },
      {
        id: "asc",
      },
    ],
    select: {
      id: true,
      position: true,
    },
  });

  const updates = sets
    .map((set, index) => {
      if (set.position === index) {
        return null;
      }

      return prisma.exerciseSet.update({
        where: {
          id: set.id,
        },
        data: {
          position: index,
        },
      });
    })
    .filter((update) => update !== null);

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}

export async function createWorkout(formData: FormData) {
  const name = String(formData.get("name")).trim();

  await prisma.workout.create({
    data: {
      name,
    },
  });

  revalidatePath("/workouts");
}

export async function addExerciseSet(formData: FormData) {
  const workoutId = Number(formData.get("workoutId"));
  const exerciseName = String(formData.get("exerciseName"))
    .trim()
    .toLowerCase();
  const muscleGroup = String(formData.get("muscleGroup")).trim();
  const weight = Number(formData.get("weight"));
  const reps = Number(formData.get("reps"));
  const rir = Number(formData.get("rir"));

  const exercise = await prisma.exercise.upsert({
    where: {
      name: exerciseName,
    },
    update: {
      muscleGroup,
    },
    create: {
      name: exerciseName,
      muscleGroup,
    },
  });

  let workoutExercise = await prisma.workoutExercise.findFirst({
    where: {
      workoutId,
      exerciseId: exercise.id,
    },
  });

  if (!workoutExercise) {
    workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId,
        exerciseId: exercise.id,
      },
    });
  }

  const position = await getNextSetPosition(workoutExercise.id);

  await prisma.exerciseSet.create({
    data: {
      workoutExerciseId: workoutExercise.id,
      position,
      completed: true,
      weight,
      reps,
      rir,
    },
  });

  revalidateWorkout(workoutId);
}

export async function addSetToExercise(formData: FormData) {
  const workoutId = Number(formData.get("workoutId"));
  const workoutExerciseId = Number(formData.get("workoutExerciseId"));
  const weight = Number(formData.get("weight"));
  const reps = Number(formData.get("reps"));
  const rir = Number(formData.get("rir"));

  const position = await getNextSetPosition(workoutExerciseId);

  await prisma.exerciseSet.create({
    data: {
      workoutExerciseId,
      position,
      completed: true,
      weight,
      reps,
      rir,
    },
  });

  revalidateWorkout(workoutId);
}

export async function addSetBelow(setId: number, workoutId: number) {
  const originalSet = await prisma.exerciseSet.findUnique({
    where: {
      id: setId,
    },
    select: {
      workoutExerciseId: true,
    },
  });

  if (!originalSet) {
    return;
  }

  await normalizeSetPositions(originalSet.workoutExerciseId);

  const sourceSet = await prisma.exerciseSet.findUnique({
    where: {
      id: setId,
    },
    select: {
      workoutExerciseId: true,
      position: true,
      weight: true,
      rir: true,
    },
  });

  if (!sourceSet) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.exerciseSet.updateMany({
      where: {
        workoutExerciseId: sourceSet.workoutExerciseId,
        position: {
          gt: sourceSet.position,
        },
      },
      data: {
        position: {
          increment: 1,
        },
      },
    });

    await tx.exerciseSet.create({
      data: {
        workoutExerciseId: sourceSet.workoutExerciseId,
        position: sourceSet.position + 1,
        completed: false,
        weight: sourceSet.weight,
        reps: null,
        rir: sourceSet.rir,
      },
    });
  });

  revalidateWorkout(workoutId);
}

type ExerciseSetTypeValue =
  | "REGULAR"
  | "MYOREP"
  | "MYOREP_MATCH";

export async function toggleExerciseSetSkipped(
  setId: number,
  workoutId: number
) {
  const set = await prisma.exerciseSet.findUnique({
    where: {
      id: setId,
    },
    select: {
      skipped: true,
    },
  });

  if (!set) {
    return;
  }

  await prisma.exerciseSet.update({
    where: {
      id: setId,
    },
    data: {
      skipped: !set.skipped,
      completed: false,
    },
  });

  revalidateWorkout(workoutId);
}

export async function updateExerciseSetType(
  setId: number,
  workoutId: number,
  setType: ExerciseSetTypeValue
) {
  await prisma.exerciseSet.update({
    where: {
      id: setId,
    },
    data: {
      setType,
    },
  });

  revalidateWorkout(workoutId);
}

export async function updateExerciseSet(formData: FormData) {
  const id = Number(formData.get("setId"));
  const workoutId = Number(formData.get("workoutId"));
  const weight = Number(formData.get("weight"));
  const reps = readOptionalNumber(formData, "reps");
  const rir = Number(formData.get("rir"));

  await prisma.exerciseSet.update({
    where: {
      id,
    },
    data: {
      weight,
      reps,
      rir,
      skipped: false,
      completed: reps !== null,
    },
  });

  revalidateWorkout(workoutId);
}

export async function deleteExerciseSet(
  setId: number,
  workoutId: number
) {
  const originalSet = await prisma.exerciseSet.findUnique({
    where: {
      id: setId,
    },
    select: {
      workoutExerciseId: true,
    },
  });

  if (!originalSet) {
    return;
  }

  await normalizeSetPositions(originalSet.workoutExerciseId);

  const set = await prisma.exerciseSet.findUnique({
    where: {
      id: setId,
    },
    select: {
      workoutExerciseId: true,
      position: true,
    },
  });

  if (!set) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.exerciseSet.delete({
      where: {
        id: setId,
      },
    });

    await tx.exerciseSet.updateMany({
      where: {
        workoutExerciseId: set.workoutExerciseId,
        position: {
          gt: set.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });
  });

  revalidateWorkout(workoutId);
}