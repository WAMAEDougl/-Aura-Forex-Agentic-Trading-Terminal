# Travel Planner Monorepo Integration Guide

## Task 1: Git Operations

### Clone and Setup Branch

Run these commands in your terminal:

```bash
# Clone the repository
git clone https://github.com/Juja-Tech-Hub/trip-planner-monorepo.git

# Navigate into the repository
cd trip-planner-monorepo

# Create and switch to the douglas branch
git checkout -b douglas

# Pull the latest changes from main
git pull origin main

# Install dependencies
npm install
```

### If Already in Repo

```bash
# Fetch latest changes
git fetch origin

# Pull latest from main into your douglas branch
git pull origin main

# Install/update dependencies
npm install
```

---

## Task 2: Compatibility Check

### ✅ Type Compatibility Analysis

Your existing types from `packages/shared` are **100% compatible** with React/Next.js:

#### Enums (TripStatus, BudgetTier, TravellerRole)
- ✅ Standard TypeScript enums work perfectly in React
- ✅ Can be used directly in dropdowns: `Object.values(TripStatus)`
- ✅ Type-safe for props and state
- ✅ No serialization issues

#### Interfaces (Trip, Destination, Activity, etc.)
- ✅ Pure TypeScript interfaces with no backend dependencies
- ✅ All use standard types (string, number) that serialize well
- ✅ Perfect for React component props and state
- ✅ ISO 8601 date strings work seamlessly with JavaScript Date objects

### Verification Checklist

Check these files to verify monorepo linking:

#### 1. Root `package.json`
**Location:** `trip-planner-monorepo/package.json`

**Expected:**
```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

#### 2. UI Package `package.json`
**Location:** `apps/ui/package.json` or `packages/ui/package.json`

**Expected:**
```json
{
  "name": "@travel-planner/ui",
  "dependencies": {
    "@travel-planner/shared": "*",
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0"
  }
}
```

#### 3. UI `tsconfig.json`
**Location:** `apps/ui/tsconfig.json`

**Expected:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
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

#### 4. Shared Package Exports
**Location:** `packages/shared/package.json`

**Expected:**
```json
{
  "name": "@travel-planner/shared",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

#### 5. Shared Package Build
**Verify:** Run `npm run build` in `packages/shared` and check:
- ✅ `dist/index.js` exists
- ✅ `dist/index.d.ts` exists
- ✅ `dist/types.js` exists
- ✅ `dist/types.d.ts` exists

---

## Task 3: Integration Logic

### Recommended: Apollo Client with GraphQL Codegen

This approach provides:
- ✅ Type-safe GraphQL hooks
- ✅ Automatic type generation from schema
- ✅ Full TypeScript IntelliSense
- ✅ Seamless integration with shared types

### Directory Structure

```
trip-planner-monorepo/
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types.ts
│       │   └── index.ts
│       └── package.json
├── apps/
│   └── ui/
│       ├── src/
│       │   ├── graphql/
│       │   │   ├── queries/
│       │   │   │   ├── trips.graphql
│       │   │   │   ├── destinations.graphql
│       │   │   │   └── itineraries.graphql
│       │   │   ├── mutations/
│       │   │   │   ├── createTrip.graphql
│       │   │   │   ├── addTraveller.graphql
│       │   │   │   └── updateTrip.graphql
│       │   │   └── generated/
│       │   │       └── graphql.ts  # Auto-generated hooks
│       │   ├── lib/
│       │   │   └── apollo-client.ts
│       │   ├── components/
│       │   │   ├── TripCard.tsx
│       │   │   ├── TripList.tsx
│       │   │   └── CreateTripForm.tsx
│       │   └── pages/
│       │       ├── trips/
│       │       │   ├── index.tsx
│       │       │   └── [id].tsx
│       │       └── index.tsx
│       ├── codegen.yml
│       └── package.json
└── travel-planner-backend/
    ├── schema.graphql
    └── src/
```

### Installation Commands

```bash
# Navigate to UI package
cd apps/ui

# Install Apollo Client
npm install @apollo/client graphql

# Install GraphQL Codegen (dev dependencies)
npm install -D @graphql-codegen/cli \
  @graphql-codegen/typescript \
  @graphql-codegen/typescript-operations \
  @graphql-codegen/typescript-react-apollo

# Install React (if not already installed)
npm install react react-dom
npm install -D @types/react @types/react-dom
```

### Configuration Files

See the implementation files created in this workspace for:
- `codegen.yml` - GraphQL Code Generator configuration
- `apollo-client.ts` - Apollo Client setup
- GraphQL query/mutation files
- Example React components

---

## Usage Examples

### Using Enums in Dropdowns

```typescript
import { TripStatus, BudgetTier } from '@travel-planner/shared';

// Get all enum values for dropdown
const statusOptions = Object.values(TripStatus);
// ['DRAFT', 'PLANNED', 'SHARED']

const budgetOptions = Object.values(BudgetTier);
// ['BUDGET', 'MID_RANGE', 'LUXURY']

// In a React component
<select value={status} onChange={(e) => setStatus(e.target.value as TripStatus)}>
  {statusOptions.map(status => (
    <option key={status} value={status}>{status}</option>
  ))}
</select>
```

### Using Generated Hooks

```typescript
import { useGetTripQuery, useCreateTripMutation } from '../graphql/generated/graphql';
import { Trip, TripStatus } from '@travel-planner/shared';

function TripDetail({ tripId }: { tripId: string }) {
  const { data, loading, error } = useGetTripQuery({
    variables: { id: tripId }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // data.trip is fully typed as Trip from shared package
  return (
    <div>
      <h1>{data?.trip.title}</h1>
      <p>{data?.trip.description}</p>
      <StatusBadge status={data?.trip.status} />
    </div>
  );
}
```

---

## Next Steps

1. ✅ Run Git operations to clone and create branch
2. ✅ Verify monorepo structure using checklist
3. ✅ Install dependencies in UI package
4. ✅ Copy integration files to UI package
5. ✅ Run `npm run codegen` to generate types
6. ✅ Start building React components
7. ✅ Test GraphQL queries against backend

---

## Troubleshooting

### Module Resolution Issues

If you see "Cannot find module '@travel-planner/shared'":

```bash
# Build the shared package first
cd packages/shared
npm run build

# Then install in UI
cd ../../apps/ui
npm install
```

### GraphQL Codegen Issues

If codegen fails:

```bash
# Ensure backend schema.graphql exists
ls ../../travel-planner-backend/schema.graphql

# Run codegen with verbose output
npm run codegen -- --verbose
```

### Type Mismatches

If you see type errors between generated types and shared types:
- Ensure shared package is built: `cd packages/shared && npm run build`
- Ensure codegen is using latest schema: `npm run codegen`
- Check that both use same type definitions

---

## Summary

✅ **Git Operations:** Commands provided for clone, branch, and sync  
✅ **Compatibility:** All types are React-compatible  
✅ **Integration:** Apollo Client + GraphQL Codegen recommended  
✅ **Structure:** Clear directory organization  
✅ **Examples:** Working code samples provided  
✅ **Verification:** Comprehensive checklist included
