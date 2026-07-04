"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

export async function createWorkout(formData: FormData) {
  const name = String(formData.get("name"));

  await prisma.workout.create({
    data: {
      name,
    },
  });

  revalidatePath("/workouts");
}

export async function addExerciseSet(formData: FormData) {
  const workoutId = Number(formData.get("workoutId"));
  const exerciseName = String(formData.get("exerciseName")).trim().toLowerCase();
  const muscleGroup = String(formData.get("muscleGroup"));
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

  await prisma.exerciseSet.create({
    data: {
      workoutExerciseId: workoutExercise.id,
      weight,
      reps,
      rir,
    },
  });

  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
}

export async function addSetToExercise(formData: FormData) {
  const workoutId = Number(formData.get("workoutId"));
  const workoutExerciseId = Number(formData.get("workoutExerciseId"));
  const weight = Number(formData.get("weight"));
  const reps = Number(formData.get("reps"));
  const rir = Number(formData.get("rir"));

  await prisma.exerciseSet.create({
    data: {
      workoutExerciseId,
      weight,
      reps,
      rir,
    },
  });

  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
}

export async function updateExerciseSet(formData: FormData) {
  const id = Number(formData.get("setId"));
  const workoutId = Number(formData.get("workoutId"));
  const weight = Number(formData.get("weight"));
  const reps = Number(formData.get("reps"));
  const rir = Number(formData.get("rir"));

  await prisma.exerciseSet.update({
    where: {
      id,
    },
    data: {
      weight,
      reps,
      rir,
    },
  });

  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
}

export async function deleteExerciseSet(id: number, workoutId: number) {
  await prisma.exerciseSet.delete({
    where: {
      id,
    },
  });

  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
}