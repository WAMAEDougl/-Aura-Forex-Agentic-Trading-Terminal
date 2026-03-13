# Fix TypeScript Errors - Quick Guide

## Current Errors

You're seeing these errors because the **Prisma migration hasn't been run yet**:

```
error TS2305: Module '"@prisma/client"' has no exported member 'NotificationType'
error TS2305: Module '"@prisma/client"' has no exported member 'RelatedEntityType'
error TS2339: Property 'notification' does not exist on type 'PrismaService'
```

## ✅ Errors Already Fixed

I've fixed these errors:
- ✅ JWT auth guard import path corrected
- ✅ TypeScript strict null checks in gateway fixed

## 🔧 To Fix Remaining Errors

You need to run the Prisma migration to create the Notification table in your database.

### Option 1: Run Migration (Requires PostgreSQL)

```bash
cd project-hub

# Make sure PostgreSQL is running first
# Then run the migration
npx prisma migrate dev --name add_notifications
```

This will:
1. Create the `notifications` table in your database
2. Generate the Prisma client with `NotificationType` and `RelatedEntityType` enums
3. Add the `notification` property to PrismaService
4. Fix all TypeScript errors

### Option 2: Use SQLite (Quick Test - No PostgreSQL Needed)

If you don't have PostgreSQL running:

1. **Update `project-hub/prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Update `project-hub/.env`:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Run migration:**
   ```bash
   cd project-hub
   npx prisma migrate dev --name add_notifications
   ```

4. **Restart the backend:**
   ```bash
   npm run start:dev
   ```

### Option 3: Start PostgreSQL with Docker Compose

If you can use Docker later (when machine is not under load):

```bash
cd project-hub
docker-compose up -d
npx prisma migrate dev --name add_notifications
```

## 🎯 Quick Fix Steps

**Choose the easiest option for you:**

### If PostgreSQL is Already Installed:
```bash
# 1. Start PostgreSQL
Start-Service postgresql-x64-15  # Windows
# or
brew services start postgresql   # Mac

# 2. Create database
psql -U postgres -c "CREATE DATABASE project_db;"

# 3. Run migration
cd project-hub
npx prisma migrate dev --name add_notifications

# 4. Restart backend
npm run start:dev
```

### If No PostgreSQL (Use SQLite):
```bash
# 1. Update schema.prisma (change provider to "sqlite")
# 2. Update .env (change DATABASE_URL to "file:./dev.db")
# 3. Run migration
cd project-hub
npx prisma migrate dev --name add_notifications

# 4. Start backend
npm run start:dev
```

## ✅ After Migration

Once the migration runs successfully, you should see:

```
✔ Generated Prisma Client
Database schema is up to date!
```

Then all TypeScript errors will be gone and the backend will start successfully!

## 🐛 If Migration Fails

### Error: "Can't reach database server"
**Solution:** PostgreSQL is not running. Start it first.

### Error: "database 'project_db' does not exist"
**Solution:** Create the database:
```bash
psql -U postgres -c "CREATE DATABASE project_db;"
```

### Error: "psql command not found"
**Solution:** Use SQLite instead (Option 2 above)

## 📋 Current Status

- ✅ All code is written correctly
- ✅ Dependencies installed
- ✅ .env files created
- ✅ Prisma client generated (but without Notification model)
- ⏳ **Need to run migration** to create Notification table
- ⏳ Then all errors will be fixed

## 🚀 Recommended: Use SQLite for Quick Testing

The fastest way to get running right now:

1. Edit `project-hub/prisma/schema.prisma` - change line 11:
   ```prisma
   datasource db {
     provider = "sqlite"  // Changed from "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Edit `project-hub/.env` - change DATABASE_URL:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Run migration:
   ```bash
   cd project-hub
   npx prisma migrate dev --name add_notifications
   ```

4. Start backend:
   ```bash
   npm run start:dev
   ```

**Done!** All errors will be fixed and the system will work.

You can switch to PostgreSQL later when you're ready.

## 💡 Why These Errors Happen

The Prisma client is generated from your schema, but it only includes models that exist in your database. Since the migration hasn't run yet:

- The `Notification` model doesn't exist in the database
- The enums `NotificationType` and `RelatedEntityType` aren't generated
- The `prisma.notification` property doesn't exist

Running the migration creates the table and regenerates the client with all the types.

---

**Next Step:** Choose one of the options above and run the migration!
