# Quick Setup Instructions for WebSocket Notifications

## Prerequisites
- PostgreSQL database running
- Node.js and npm installed
- Both project-hub and project-harbor repositories cloned

## Step-by-Step Setup

### 1. Backend Setup (project-hub)

```bash
# Navigate to backend directory
cd project-hub

# Create .env file from example
cp .env.example .env

# Edit .env file and configure:
# - DATABASE_URL (your PostgreSQL connection string)
# - JWT_SECRET (a long random string)
# - FRONTEND_URL (http://localhost:8080)
```

Example `.env` configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_db"
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_12345
JWT_EXPIRATION=1h
FRONTEND_URL=http://localhost:8080
PORT=3000
```

```bash
# Install dependencies (if not already done)
npm install

# Run Prisma migration to create notifications table
npx prisma migrate dev --name add_notifications

# Generate Prisma client
npx prisma generate

# Start the backend server
npm run start:dev
```

The backend should now be running on `http://localhost:3000` with WebSocket support at `ws://localhost:3000/notifications`

### 2. Frontend Setup (project-harbor)

```bash
# Navigate to frontend directory
cd project-harbor

# Create or update .env file
echo "VITE_API_BASE_URL=http://localhost:3000" > .env
echo "VITE_API_URL=http://localhost:3000" >> .env

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

The frontend should now be running on `http://localhost:8080`

### 3. Verify Installation

1. Open browser and navigate to `http://localhost:8080`
2. Log in to the application
3. Open browser console (F12)
4. Look for the message: `WebSocket connected`
5. Check the notification bell icon in the header

### 4. Test the Notification System

#### Option A: Using Prisma Studio

```bash
# In project-hub directory
npx prisma studio
```

1. Open the `Notification` model
2. Click "Add record"
3. Fill in:
   - `userId`: Use a valid user ID from your database
   - `title`: "Test Notification"
   - `message`: "This is a test message"
   - `type`: INFO
   - `isRead`: false
4. Save the record
5. The notification should appear in the frontend immediately

#### Option B: Using Backend Code

Add this test endpoint to `project-hub/src/notifications/notifications.controller.ts`:

```typescript
@Post('test')
async createTestNotification(@Request() req) {
  const notification = await this.notificationsService.create({
    userId: req.user.userId,
    title: 'Test Notification',
    message: 'This is a test notification from the API',
    type: NotificationType.INFO,
  });

  // Broadcast via WebSocket
  await this.notificationsGateway.sendNotificationToUser(
    req.user.userId,
    notification,
  );

  return notification;
}
```

Then call it:
```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Common Issues and Solutions

#### Issue: "WebSocket connection failed"
- **Solution**: Ensure backend is running on port 3000
- Check that FRONTEND_URL in backend .env matches your frontend URL
- Verify JWT token exists in localStorage

#### Issue: "Prisma migration failed"
- **Solution**: Ensure PostgreSQL is running
- Check DATABASE_URL in .env is correct
- Verify database exists: `createdb project_db`

#### Issue: "Module not found" errors
- **Solution**: Run `npm install` in both directories
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

#### Issue: Notifications not appearing in real-time
- **Solution**: Check browser console for WebSocket connection status
- Verify NotificationsModule is imported in AppModule
- Check backend logs for errors

### 6. Next Steps

Once the basic system is working:

1. **Add notification triggers** in your existing services (tasks, comments, etc.)
2. **Customize notification types** based on your application needs
3. **Add notification preferences** for users
4. **Implement notification history** with pagination
5. **Add browser push notifications** for better UX

Refer to `WEBSOCKET_IMPLEMENTATION_GUIDE.md` for detailed architecture information and `project-hub/src/notifications/notification-examples.ts` for integration examples.

## Quick Reference

### Backend Files Created
- `src/notifications/notifications.module.ts`
- `src/notifications/notifications.service.ts`
- `src/notifications/notifications.gateway.ts`
- `src/notifications/notifications.controller.ts`
- `src/notifications/notification-examples.ts`

### Frontend Files Modified
- `src/store/useNotificationStore.ts`
- `src/components/BackofficeLayout.tsx`

### Database
- New table: `notifications`
- New enums: `NotificationType`, `RelatedEntityType`

### Dependencies Added
- Backend: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
- Frontend: `socket.io-client`

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check backend logs for errors
3. Verify all environment variables are set correctly
4. Ensure database migrations ran successfully
5. Refer to the troubleshooting section in `WEBSOCKET_IMPLEMENTATION_GUIDE.md`
