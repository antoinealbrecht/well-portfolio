# Well

**Well** is a full-stack fitness dashboard focused on evidence-based hypertrophy training.

This repository contains the public portfolio edition of Well. It demonstrates the product’s core workout-logging experience, health tracking, database architecture, and responsive user interface.

The long-term product vision is to build an evidence-based hypertrophy platform that helps users plan training blocks, log workouts, track recovery, and make informed training decisions.

## Features

### Workout Logging

- Create and view workout sessions
- Add multiple exercises to a workout
- Log weight, reps, and reps in reserve (RIR)
- Edit set data directly inside the workout table
- Mark sets as complete
- Skip and delete sets
- Insert a new set directly below an existing set
- Preserve correct exercise and set ordering
- Support Regular, Myorep, and Myorep Match set types
- Track completed sets by workout and exercise

### Workout Templates

- Create reusable workout templates
- Add template descriptions
- View exercise, set, and session counts
- Store planned exercises and set prescriptions
- Define rep ranges, target RIR, target weight, and set type

### Body Weight

- Log body-weight entries
- View recent weight history
- Calculate a seven-entry average
- Display weight trends with a responsive chart

### Nutrition

- Log calories and macronutrients
- Track protein, carbohydrates, and fat
- Record nutrition adherence
- Add optional notes

### Recovery

- Log sleep duration
- Record subjective sleep quality
- Add recovery notes

### Dashboard

- View training, nutrition, and recovery summaries
- Review weekly training volume
- View muscle-group volume
- Navigate between all major features from desktop or mobile

## Technology

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL**
- **Recharts**
- **Next.js Server Actions**
- **Next.js App Router**

## Engineering Highlights

- Relational PostgreSQL data modeling with Prisma
- Database migrations for evolving product requirements
- Server-rendered and statically generated routes
- Server Actions for database mutations
- Normalized exercise records to prevent duplicate exercises
- Explicit set and exercise positioning
- Responsive desktop and mobile navigation
- Production-safe environment-variable handling
- Clean production builds with TypeScript validation

## Project Structure

```text
app/
├── dashboard/
├── nutrition/
├── recovery/
├── templates/
├── weight/
└── workouts/

prisma/
├── migrations/
└── schema.prisma

src/
├── components/
├── lib/
└── server/

```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create an environment file

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Replace the placeholder with a valid PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 3. Apply database migrations

```bash
npx prisma migrate dev
```

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Portfolio Scope

This repository is intentionally limited to the public portfolio edition of Well.

The production product’s adaptive mesocycle programming, personalized volume adjustment, progression algorithms, AI features, authentication, cloud synchronization, coaching tools, and commercial infrastructure are not included in this repository.

## License

Copyright © 2026 Antoine Albrecht. All rights reserved.

This repository is publicly available for portfolio and educational review. See the [LICENSE](LICENSE) file for usage restrictions.