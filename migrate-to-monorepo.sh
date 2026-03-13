#!/bin/bash

# Travel Planner Backend → Monorepo Migration Script
# This script automates the migration of travel-planner-backend into trip-planner-monorepo

set -e  # Exit on error

echo "🚀 Starting Travel Planner Backend Migration to Monorepo..."
echo ""

# Check if we're in the right directory
if [ ! -d "travel-planner-backend" ]; then
    echo "❌ Error: travel-planner-backend directory not found"
    echo "Please run this script from the parent directory containing travel-planner-backend"
    exit 1
fi

# Step 1: Clone monorepo if it doesn't exist
if [ ! -d "trip-planner-monorepo" ]; then
    echo "📦 Cloning trip-planner-monorepo..."
    git clone https://github.com/Juja-Tech-Hub/trip-planner-monorepo.git
    cd trip-planner-monorepo
    git checkout -b douglas
    git pull origin main
    cd ..
else
    echo "✅ trip-planner-monorepo already exists"
fi

# Step 2: Create directory structure
echo "📁 Creating directory structure..."
mkdir -p trip-planner-monorepo/apps/backend
mkdir -p trip-planner-monorepo/packages/shared

# Step 3: Copy backend files
echo "📋 Copying backend files..."
cp -r travel-planner-backend/src trip-planner-monorepo/apps/backend/
cp -r travel-planner-backend/test trip-planner-monorepo/apps/backend/
cp travel-planner-backend/package.json trip-planner-monorepo/apps/backend/
cp travel-planner-backend/tsconfig.json trip-planner-monorepo/apps/backend/
cp travel-planner-backend/nest-cli.json trip-planner-monorepo/apps/backend/
cp travel-planner-backend/.env.example trip-planner-monorepo/apps/backend/
cp travel-planner-backend/.eslintrc.js trip-planner-monorepo/apps/backend/ 2>/dev/null || true
cp travel-planner-backend/.prettierrc trip-planner-monorepo/apps/backend/ 2>/dev/null || true
cp travel-planner-backend/ormconfig.ts trip-planner-monorepo/apps/backend/ 2>/dev/null || true
cp travel-planner-backend/.gitignore trip-planner-monorepo/apps/backend/ 2>/dev/null || true

# Step 4: Copy shared package
echo "📦 Copying shared package..."
cp -r travel-planner-backend/packages/shared/* trip-planner-monorepo/packages/shared/

# Step 5: Update backend package.json name
echo "✏️  Updating backend package.json..."
cd trip-planner-monorepo/apps/backend
sed -i.bak 's/"name": "travel-planner-backend"/"name": "@travel-planner\/backend"/' package.json
sed -i.bak 's/"private": true/"private": true/' package.json
rm package.json.bak 2>/dev/null || true
cd ../../..

# Step 6: Update backend tsconfig.json paths
echo "✏️  Updating backend tsconfig.json..."
cat > trip-planner-monorepo/apps/backend/tsconfig.json << 'EOF'
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
EOF

# Step 7: Create/Update root package.json
echo "✏️  Updating root package.json..."
cat > trip-planner-monorepo/package.json << 'EOF'
{
  "name": "trip-planner-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build:shared && npm run build:backend",
    "build:shared": "npm run build --workspace=@travel-planner/shared",
    "build:backend": "npm run build --workspace=@travel-planner/backend",
    "build:ui": "npm run build --workspace=@travel-planner/ui",
    "dev:backend": "npm run start:dev --workspace=@travel-planner/backend",
    "dev:ui": "npm run dev --workspace=@travel-planner/ui",
    "test": "npm run test --workspaces",
    "test:backend": "npm run test --workspace=@travel-planner/backend",
    "install:all": "npm install"
  },
  "devDependencies": {
    "typescript": "^5.1.3"
  }
}
EOF

# Step 8: Install dependencies
echo "📦 Installing dependencies..."
cd trip-planner-monorepo
npm install

# Step 9: Build shared package
echo "🔨 Building shared package..."
npm run build:shared

# Step 10: Build backend
echo "🔨 Building backend..."
npm run build:backend

echo ""
echo "✅ Migration complete!"
echo ""
echo "📋 Next steps:"
echo "1. cd trip-planner-monorepo"
echo "2. Review the changes: git status"
echo "3. Run tests: npm run test:backend"
echo "4. Start backend: npm run dev:backend"
echo "5. Commit and push: git add . && git commit -m 'feat: migrate backend to monorepo' && git push origin douglas"
echo ""
echo "🎉 Your backend is now in the monorepo at apps/backend!"
