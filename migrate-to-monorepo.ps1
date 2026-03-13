# Travel Planner Backend → Monorepo Migration Script (PowerShell)
# This script automates the migration of travel-planner-backend into trip-planner-monorepo

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Travel Planner Backend Migration to Monorepo..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "travel-planner-backend")) {
    Write-Host "❌ Error: travel-planner-backend directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the parent directory containing travel-planner-backend"
    exit 1
}

# Step 1: Clone monorepo if it doesn't exist
if (-not (Test-Path "trip-planner-monorepo")) {
    Write-Host "📦 Cloning trip-planner-monorepo..." -ForegroundColor Cyan
    git clone https://github.com/Juja-Tech-Hub/trip-planner-monorepo.git
    Set-Location trip-planner-monorepo
    git checkout -b douglas
    git pull origin main
    Set-Location ..
} else {
    Write-Host "✅ trip-planner-monorepo already exists" -ForegroundColor Green
}

# Step 2: Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "trip-planner-monorepo\apps\backend" | Out-Null
New-Item -ItemType Directory -Force -Path "trip-planner-monorepo\packages\shared" | Out-Null

# Step 3: Copy backend files
Write-Host "📋 Copying backend files..." -ForegroundColor Cyan
Copy-Item -Path "travel-planner-backend\src" -Destination "trip-planner-monorepo\apps\backend\" -Recurse -Force
Copy-Item -Path "travel-planner-backend\test" -Destination "trip-planner-monorepo\apps\backend\" -Recurse -Force
Copy-Item -Path "travel-planner-backend\package.json" -Destination "trip-planner-monorepo\apps\backend\" -Force
Copy-Item -Path "travel-planner-backend\tsconfig.json" -Destination "trip-planner-monorepo\apps\backend\" -Force
Copy-Item -Path "travel-planner-backend\nest-cli.json" -Destination "trip-planner-monorepo\apps\backend\" -Force
Copy-Item -Path "travel-planner-backend\.env.example" -Destination "trip-planner-monorepo\apps\backend\" -Force

if (Test-Path "travel-planner-backend\.eslintrc.js") {
    Copy-Item -Path "travel-planner-backend\.eslintrc.js" -Destination "trip-planner-monorepo\apps\backend\" -Force
}
if (Test-Path "travel-planner-backend\.prettierrc") {
    Copy-Item -Path "travel-planner-backend\.prettierrc" -Destination "trip-planner-monorepo\apps\backend\" -Force
}
if (Test-Path "travel-planner-backend\ormconfig.ts") {
    Copy-Item -Path "travel-planner-backend\ormconfig.ts" -Destination "trip-planner-monorepo\apps\backend\" -Force
}
if (Test-Path "travel-planner-backend\.gitignore") {
    Copy-Item -Path "travel-planner-backend\.gitignore" -Destination "trip-planner-monorepo\apps\backend\" -Force
}

# Step 4: Copy shared package
Write-Host "📦 Copying shared package..." -ForegroundColor Cyan
Copy-Item -Path "travel-planner-backend\packages\shared\*" -Destination "trip-planner-monorepo\packages\shared\" -Recurse -Force

# Step 5: Update backend package.json
Write-Host "✏️  Updating backend package.json..." -ForegroundColor Cyan
$packageJson = Get-Content "trip-planner-monorepo\apps\backend\package.json" -Raw | ConvertFrom-Json
$packageJson.name = "@travel-planner/backend"
$packageJson.private = $true
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "trip-planner-monorepo\apps\backend\package.json"

# Step 6: Update backend tsconfig.json
Write-Host "✏️  Updating backend tsconfig.json..." -ForegroundColor Cyan
$tsconfigContent = @'
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
'@
$tsconfigContent | Set-Content "trip-planner-monorepo\apps\backend\tsconfig.json"

# Step 7: Create/Update root package.json
Write-Host "✏️  Updating root package.json..." -ForegroundColor Cyan
$rootPackageJson = @'
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
'@
$rootPackageJson | Set-Content "trip-planner-monorepo\package.json"

# Step 8: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Set-Location trip-planner-monorepo
npm install

# Step 9: Build shared package
Write-Host "🔨 Building shared package..." -ForegroundColor Cyan
npm run build:shared

# Step 10: Build backend
Write-Host "🔨 Building backend..." -ForegroundColor Cyan
npm run build:backend

Write-Host ""
Write-Host "✅ Migration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. cd trip-planner-monorepo"
Write-Host "2. Review the changes: git status"
Write-Host "3. Run tests: npm run test:backend"
Write-Host "4. Start backend: npm run dev:backend"
Write-Host "5. Commit and push: git add . ; git commit -m 'feat: migrate backend to monorepo' ; git push origin douglas"
Write-Host ""
Write-Host "🎉 Your backend is now in the monorepo at apps/backend!" -ForegroundColor Green
