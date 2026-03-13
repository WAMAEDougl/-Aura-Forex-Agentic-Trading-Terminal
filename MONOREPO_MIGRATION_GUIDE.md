# Travel Planner Backend → Monorepo Migration Guide

## Overview

This guide explains how to move the `travel-planner-backend` we've built into the `trip-planner-monorepo` at the correct location: `apps/backend`.

---

## Current Structure (What We Built)

```
travel-planner-backend/
├── packages/
│   └── shared/          # Shared types
├── src/                 # Backend source code
├── package.json
└── ...
```

## Target Monorepo Structure

```
trip-planner-monorepo/
├── packages/
│   └── shared/          # Move from travel-planner-backend/packages/shared
│       ├── src/
│       │   ├── types.ts
│       │   └── index.ts
│       └── package.json
├── apps/
│   ├── backend/         # Move from travel-planner-backend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── ui/              # Frontend (already exists in monorepo)
│       ├── src/
│       └── package.json
└── package.json         # Root workspace config
```

---

## Migration Steps

### Step 1: Clone the Monorepo

```bash
# Clone the monorepo
git clone https://github.com/Juja-Tech-Hub/trip-planner-monorepo.git
cd trip-planner-monorepo

# Create your branch
git checkout -b douglas

# Pull latest changes
git pull origin main
```

### Step 2: Copy Backend Files

```bash
# From your current working directory, copy the backend
# Assuming you're in the parent directory containing both folders

# Copy backend source and config files
cp -r travel-planner-backend/src trip-planner-monorepo/apps/backend/
cp -r travel-planner-backend/test trip-planner-monorepo/apps/backend/
cp travel-planner-backend/package.json trip-planner-monorepo/apps/backend/
cp travel-planner-backend/tsconfig.json trip-planner-monorepo/apps/backend/
cp travel-planner-backend/nest-cli.json trip-planner-monorepo/apps/backend/
cp travel-planner-backend/.env.example trip-planner-monorepo/apps/backend/
cp travel-planner-backend/.eslintrc.js trip-planner-monorepo/apps/backend/
cp travel-planner-backend/.prettierrc trip-planner-monorepo/apps/backend/
cp travel-planner-backend/ormconfig.ts trip-planner-monorepo/apps/backend/
cp travel-planner-backend/.gitignore trip-planner-monorepo/apps/backend/

# Copy any other config files you need
```

### Step 3: Copy Shared Package

```bash
# Copy the shared package to the monorepo packages directory
cp -r travel-planner-backend/packages/shared trip-planner-monorepo/packages/
```

### Step 4: Update Backend package.json

Edit `trip-planner-monorepo/apps/backend/package.json`:

```json
{
  "name": "@travel-planner/backend",
  "version": "1.0.0",
  "description": "NestJS-based GraphQL backend for travel planning",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@travel-planner/shared": "*",
    "@nestjs/apollo": "^12.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/graphql": "^12.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "apollo-server-express": "^3.12.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "date-fns": "^2.30.0",
    "graphql": "^16.8.0",
    "nodemailer": "^8.0.2",
    "pg": "^8.11.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.17",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/nodemailer": "^7.0.11",
    "@types/supertest": "^2.0.12",
    "@types/uuid": "^9.0.0",
    "fast-check": "^3.13.0",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "testcontainers": "^10.2.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.3"
  }
}
```

### Step 5: Update Backend tsconfig.json

Edit `trip-planner-monorepo/apps/backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@shared/*": ["../../packages/shared/src/*"],
      "@travel-planner/shared": ["../../packages/shared/src"]
    }
  },
  "references": [
    { "path": "../../packages/shared" }
  ]
}
```

### Step 6: Update Root package.json

Edit `trip-planner-monorepo/package.json`:

```json
{
  "name": "trip-planner-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build:shared && npm run build:backend && npm run build:ui",
    "build:shared": "npm run build --workspace=@travel-planner/shared",
    "build:backend": "npm run build --workspace=@travel-planner/backend",
    "build:ui": "npm run build --workspace=@travel-planner/ui",
    "dev:backend": "npm run start:dev --workspace=@travel-planner/backend",
    "dev:ui": "npm run dev --workspace=@travel-planner/ui",
    "test": "npm run test --workspaces",
    "test:backend": "npm run test --workspace=@travel-planner/backend"
  },
  "devDependencies": {
    "typescript": "^5.1.3"
  }
}
```

### Step 7: Install Dependencies

```bash
# From monorepo root
cd trip-planner-monorepo

# Install all dependencies
npm install

# Build shared package first
npm run build:shared

# Build backend
npm run build:backend
```

### Step 8: Update Import Paths (if needed)

Check if any imports in the backend need updating. Most should already use `@travel-planner/shared` or `@shared/*`.

If you find imports like:
```typescript
import { Trip } from '../../../packages/shared/src/types';
```

Replace with:
```typescript
import { Trip } from '@travel-planner/shared';
```

### Step 9: Verify Everything Works

```bash
# Run tests
npm run test:backend

# Start backend in dev mode
npm run dev:backend

# In another terminal, start UI
npm run dev:ui
```

---

## Updated Integration Instructions

### GraphQL Schema Location

The GraphQL schema is now at:
```
trip-planner-monorepo/apps/backend/schema.graphql
```

### Update codegen.yml in UI

Edit `trip-planner-monorepo/apps/ui/codegen.yml`:

```yaml
schema: "../backend/schema.graphql"  # Updated path
documents: "src/graphql/**/*.graphql"
generates:
  src/graphql/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
    config:
      withHooks: true
      withComponent: false
      withHOC: false
```

### Environment Variables

Update `trip-planner-monorepo/apps/ui/.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

Update `trip-planner-monorepo/apps/backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=travel_planner

# Server
PORT=3000
NODE_ENV=development

# Email (for nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

---

## Git Workflow After Migration

```bash
# Check status
git status

# Add all new files
git add .

# Commit the migration
git commit -m "feat: migrate travel-planner-backend to monorepo structure

- Move backend to apps/backend
- Move shared types to packages/shared
- Update workspace configuration
- Update import paths and tsconfig
- All tests passing"

# Push to your branch
git push origin douglas

# Create pull request on GitHub
```

---

## Verification Checklist

- [ ] Backend builds successfully: `npm run build:backend`
- [ ] Shared package builds: `npm run build:shared`
- [ ] All backend tests pass: `npm run test:backend`
- [ ] Backend starts in dev mode: `npm run dev:backend`
- [ ] GraphQL playground accessible at http://localhost:3000/graphql
- [ ] UI can generate types: `cd apps/ui && npm run codegen`
- [ ] UI can import from shared: `import { Trip } from '@travel-planner/shared'`
- [ ] No TypeScript errors in backend or UI

---

## Troubleshooting

### Module Resolution Issues

If you see "Cannot find module '@travel-planner/shared'":

```bash
# Build shared package
cd packages/shared
npm run build

# Reinstall dependencies
cd ../..
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### TypeScript Path Mapping Issues

Ensure all `tsconfig.json` files have correct paths:
- Backend: `../../packages/shared/src`
- UI: `../../packages/shared/src`

### Workspace Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Summary

After migration, your structure will be:

```
trip-planner-monorepo/
├── packages/shared/     ← Shared types (moved)
├── apps/
│   ├── backend/         ← Your NestJS backend (moved)
│   └── ui/              ← React/Next.js UI (existing)
└── package.json         ← Workspace config
```

All three packages can now share types seamlessly, and you can run everything from the monorepo root with workspace commands.
