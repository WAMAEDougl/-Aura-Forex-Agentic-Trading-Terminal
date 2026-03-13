# WebSocket-Based Notification System Implementation Guide

## Overview
This guide documents the WebSocket-based real-time notification system that has been implemented to replace the REST API polling approach.

## What Has Been Completed

### Backend (project-hub)

1. **Dependencies Installed**
   - `@nestjs/websockets`
   - `@nestjs/platform-socket.io`
   - `socket.io`

2. **Prisma Schema Updated**
   - Added `Notification` model with fields:
     - `id`, `userId`, `title`, `message`, `isRead`, `type`, `relatedEntityId`, `relatedEntityType`
     - Indexes on `[userId, isRead]` and `[createdAt]` for performance
   - Added enums: `NotificationType` (INFO, SUCCESS, WARNING, ERROR)
   - Added enums: `RelatedEntityType` (PROJECT, TASK, USER, COMMENT, OBJECTIVE)

3. **Notifications Module Created**
   - `notifications.module.ts` - Module configuration
   - `notifications.service.ts` - Database operations (create, findAll, markAsRead, markAllAsRead, getUnreadCount)
   - `notifications.gateway.ts` - WebSocket gateway with Socket.IO
     - JWT authentication for WebSocket connections
     - Event handlers: `markAsRead`, `markAllAsRead`
     - Emits: `notification`, `notificationRead`, `allNotificationsRead`
     - User-specific rooms for targeted notifications
   - `notifications.controller.ts` - REST API fallback endpoints

4. **App Module Updated**
   - `NotificationsModule` imported and registered

### Frontend (project-harbor)

1. **Dependencies Installed**
   - `socket.io-client`

2. **Notification Store Updated** (`useNotificationStore.ts`)
   - Added WebSocket connection management
   - `connect(token)` - Establishes WebSocket connection with JWT auth
   - `disconnect()` - Closes WebSocket connection
   - Real-time event listeners for incoming notifications
   - Fallback to REST API when WebSocket is disconnected
   - Optimistic updates for better UX

3. **BackofficeLayout Updated**
   - Added `useEffect` hook to connect WebSocket on mount
   - Automatically disconnects on unmount
   - Uses JWT token from localStorage

## What Needs To Be Done

### 1. Database Setup (REQUIRED FIRST)

You need to create a `.env` file in `project-hub/` directory:

```bash
# Copy the example file
cp project-hub/.env.example project-hub/.env
```

Then edit `project-hub/.env` and configure your database:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_db"
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRATION=1h
FRONTEND_URL=http://localhost:8080
PORT=3000
```

### 2. Run Prisma Migration

After configuring the database, run the migration to create the notifications table:

```bash
cd project-hub
npx prisma migrate dev --name add_notifications
npx prisma generate
```

### 3. Start the Backend Server

```bash
cd project-hub
npm run start:dev
```

The WebSocket server will be available at `ws://localhost:3000/notifications`

### 4. Configure Frontend Environment

Create or update `project-harbor/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

### 5. Start the Frontend

```bash
cd project-harbor
npm run dev
```

## How It Works

### Connection Flow

1. User logs in → JWT token stored in localStorage
2. BackofficeLayout mounts → Reads token from localStorage
3. Calls `connect(token)` → Establishes WebSocket connection
4. Backend verifies JWT → Joins user to their specific room
5. Initial notifications fetched via REST API
6. Real-time updates received via WebSocket

### Notification Flow

1. **Server-side event** (e.g., task assigned, comment added)
2. Service creates notification in database
3. Gateway broadcasts to user's WebSocket room
4. Frontend receives `notification` event
5. Store adds notification to state
6. UI updates automatically (bell icon shows new count)

### Mark as Read Flow

1. User clicks notification
2. Frontend emits `markAsRead` via WebSocket (or REST if disconnected)
3. Backend updates database
4. Backend broadcasts `notificationRead` to all user's connected clients
5. All tabs/devices update simultaneously

## Testing the Implementation

### 1. Test WebSocket Connection

Open browser console and check for:
```
WebSocket connected
```

### 2. Create Test Notification (Backend)

You can inject the NotificationsService into any other service and call:

```typescript
await this.notificationsService.create({
  userId: 'user-id-here',
  title: 'Test Notification',
  message: 'This is a test message',
  type: NotificationType.INFO,
});

// Then broadcast via gateway
await this.notificationsGateway.sendNotificationToUser(userId, notification);
```

### 3. Test from Browser Console

```javascript
// Check connection status
useNotificationStore.getState().isConnected

// Check notifications
useNotificationStore.getState().notifications

// Check unread count
useNotificationStore.getState().unreadCount
```

## Integration Points

To send notifications from other parts of your application:

### Example: Task Assignment Notification

In `tasks.service.ts`:

```typescript
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationType, RelatedEntityType } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async assignTask(taskId: string, userId: string) {
    // Update task
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: { userId },
      include: { project: true },
    });

    // Create notification
    const notification = await this.notificationsService.create({
      userId,
      title: 'New Task Assigned',
      message: `You have been assigned to task: ${task.title}`,
      type: NotificationType.INFO,
      relatedEntityId: taskId,
      relatedEntityType: RelatedEntityType.TASK,
    });

    // Broadcast via WebSocket
    await this.notificationsGateway.sendNotificationToUser(userId, notification);

    return task;
  }
}
```

## Architecture Benefits

1. **Real-time Updates** - Notifications appear instantly without polling
2. **Scalable** - WebSocket connections are efficient for many concurrent users
3. **Multi-device Support** - User rooms ensure all devices receive updates
4. **Fallback Support** - REST API available when WebSocket unavailable
5. **Optimistic Updates** - UI responds immediately, reverts on failure
6. **Type Safety** - Full TypeScript support throughout

## Troubleshooting

### WebSocket Connection Fails

- Check that backend is running on port 3000
- Verify JWT token exists in localStorage
- Check CORS configuration in gateway
- Look for errors in browser console

### Notifications Not Appearing

- Verify database migration ran successfully
- Check that NotificationsModule is imported in AppModule
- Ensure user is authenticated (token valid)
- Check backend logs for errors

### Multiple Tabs Not Syncing

- Verify user rooms are working (check backend logs)
- Ensure `notificationRead` event is being emitted
- Check that all tabs have active WebSocket connections

## Next Steps

1. **Add notification triggers** throughout your application (task assignments, comments, reviews, etc.)
2. **Add notification preferences** (allow users to configure which notifications they want)
3. **Add notification history** (pagination for old notifications)
4. **Add push notifications** (browser notifications API)
5. **Add email notifications** (for important events when user is offline)

## Files Modified/Created

### Backend
- ✅ `project-hub/src/notifications/notifications.module.ts`
- ✅ `project-hub/src/notifications/notifications.service.ts`
- ✅ `project-hub/src/notifications/notifications.gateway.ts`
- ✅ `project-hub/src/notifications/notifications.controller.ts`
- ✅ `project-hub/src/app.module.ts`
- ✅ `project-hub/prisma/schema.prisma`

### Frontend
- ✅ `project-harbor/src/store/useNotificationStore.ts`
- ✅ `project-harbor/src/components/BackofficeLayout.tsx`

### Documentation
- ✅ `WEBSOCKET_IMPLEMENTATION_GUIDE.md`
