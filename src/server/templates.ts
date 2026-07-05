"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

function readInteger(
  formData: FormData,
  name: string,
  fallback: number
) {
  const value = Number(formData.get(name));

  return Number.isInteger(value) ? value : fallback;
}

function readNumber(
  formData: FormData,
  name: string,
  fallback: number
) {
  const value = Number(formData.get(name));

  return Number.isFinite(value) ? value : fallback;
}

function readOptionalNumber(formData: FormData, name: string) {
  const rawValue = String(formData.get(name) ?? "").trim();

  if (rawValue === "") {
    return null;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? value : null;
}

export async function createWorkoutTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();

  if (!name) {
    return;
  }

  await prisma.workoutTemplate.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/templates");
}

export async function addExerciseToTemplate(formData: FormData) {
  const templateId = Number(formData.get("templateId"));
  const exerciseName = String(
    formData.get("exerciseName") ?? ""
  )
    .trim()
    .toLowerCase();

  const muscleGroup = String(
    formData.get("muscleGroup") ?? ""
  ).trim();

  if (
    !Number.isInteger(templateId) ||
    !exerciseName ||
    !muscleGroup
  ) {
    return;
  }

  const requestedSetCount = readInteger(formData, "setCount", 3);
  const setCount = Math.min(Math.max(requestedSetCount, 1), 10);

  const requestedMinReps = readInteger(formData, "minReps", 8);
  const requestedMaxReps = readInteger(formData, "maxReps", 12);

  const minReps = Math.max(requestedMinReps, 1);
  const maxReps = Math.max(requestedMaxReps, minReps);

  const targetRir = Math.max(
    readNumber(formData, "targetRir", 2),
    0
  );

  const targetWeight = readOptionalNumber(
    formData,
    "targetWeight"
  );

  const template = await prisma.workoutTemplate.findUnique({
    where: {
      id: templateId,
    },
    select: {
      id: true,
    },
  });

  if (!template) {
    return;
  }

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

  const existingTemplateExercise =
    await prisma.templateExercise.findFirst({
      where: {
        templateId,
        exerciseId: exercise.id,
      },
      select: {
        id: true,
      },
    });

  if (existingTemplateExercise) {
    return;
  }

  const lastTemplateExercise =
    await prisma.templateExercise.findFirst({
      where: {
        templateId,
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

  const position = lastTemplateExercise
    ? lastTemplateExercise.position + 1
    : 0;

  await prisma.templateExercise.create({
    data: {
      templateId,
      exerciseId: exercise.id,
      position,
      sets: {
        create: Array.from({ length: setCount }, (_, index) => ({
          position: index,
          setType: "REGULAR",
          targetWeight,
          minReps,
          maxReps,
          targetRir,
        })),
      },
    },
  });

  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}`);
}