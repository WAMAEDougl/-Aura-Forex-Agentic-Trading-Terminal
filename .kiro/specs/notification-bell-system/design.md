# Design Document: Notification Bell System

## Overview

The Notification Bell System is a real-time notification delivery and management feature for the ProjectHub application. It provides users with a visual indicator of unread notifications through a bell icon in the application header, along with a dropdown interface for viewing and managing notifications.

The system integrates with the existing ProjectHub architecture, utilizing:
- **Zustand** for state management (following existing store patterns)
- **Axios-based API service** for backend communication
- **shadcn-ui components** (Popover) for UI consistency
- **lucide-react icons** for visual elements
- **TypeScript** for type safety

The notification bell will be positioned in the BackofficeLayout header between the breadcrumbs and the portfolio link, providing authenticated users with immediate access to their notifications.

## Architecture

### Component Hierarchy

```
BackofficeLayout
└── Header
    ├── Breadcrumbs
    ├── NotificationBell (new)
    │   ├── Bell Icon + Badge
    │   └── NotificationDropdown (Popover)
    │       ├── Loading State
    │       ├── Empty State
    │       └── NotificationList
    │           └── NotificationItem[]
    └── Portfolio Link
```

### Data Flow

1. **Initial Load**: When the application loads, the notification store fetches notifications for the authenticated user
2. **State Management**: Notifications are stored in Zustand store, accessible throughout the application
3. **User Interaction**: Clicking the bell icon opens the dropdown and marks all unread notifications as read
4. **Optimistic Updates**: UI updates immediately when marking as read, with API call in background
5. **Error Handling**: Failed API calls revert state and display error messages

### State Management Architecture

The notification system uses a dedicated Zustand store that follows the existing pattern established in `useStore.ts`:

- **Store Location**: `src/store/useNotificationStore.ts`
- **Persistence**: No persistence (notifications are fetched fresh on each session)
- **State Shape**: Array of notifications + unread count + loading/error states
- **Actions**: fetch, markAsRead, markAllAsRead, addNotification

## Components and Interfaces

### NotificationBell Component

**Location**: `src/components/NotificationBell.tsx`

**Responsibilities**:
- Render bell icon with conditional badge
- Manage popover open/close state
- Trigger mark-as-read action when opened
- Display unread count badge (with "99+" for counts > 99)

**Props**: None (uses store directly)

**Key Features**:
- Hover state with amber color transition
- Keyboard accessible (Enter/Space to open)
- ARIA label for accessibility
- Responsive positioning

### NotificationDropdown Component

**Location**: `src/components/NotificationDropdown.tsx`

**Responsibilities**:
- Display list of notifications in reverse chronological order
- Show loading state during fetch
- Show empty state when no notifications
- Render individual notification items
- Handle scrolling for long lists

**Props**:
```typescript
interface NotificationDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Key Features**:
- Maximum height with scrollable content
- Focus trap when open
- Escape key to close
- Click outside to close

### NotificationItem Component

**Location**: `src/components/NotificationItem.tsx` (or inline in NotificationDropdown)

**Responsibilities**:
- Display notification title, message, and timestamp
- Visual distinction between read/unread
- Format timestamp (relative time using date-fns)

**Props**:
```typescript
interface NotificationItemProps {
  notification: Notification;
}
```

**Styling**:
- Unread: Bold text or distinct background color (amber/orange tint)
- Read: Normal text with muted colors
- Hover state for interactivity

## Data Models

### Notification Interface

**Location**: `src/types/index.ts`

```typescript
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO 8601 timestamp
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  relatedEntityId?: string;
  relatedEntityType?: 'PROJECT' | 'TASK' | 'USER' | 'COMMENT';
}
```

### Notification Store State

```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  updateUnreadCount: () => void;
}
```

### API Service Interface

**Location**: `src/services/notificationService.ts`

```typescript
class NotificationService {
  private readonly basePath = '/notifications';
  
  // Fetch all notifications for the authenticated user
  async getAll(): Promise<Notification[]>;
  
  // Mark a specific notification as read
  async markAsRead(notificationId: string): Promise<void>;
  
  // Mark all notifications as read for the authenticated user
  async markAllAsRead(): Promise<void>;
  
  // Create a new notification (admin/system use)
  async create(data: CreateNotificationPayload): Promise<Notification>;
}
```

### API Endpoints

- `GET /notifications` - Fetch user-specific notifications (filtered by auth token)
- `PATCH /notifications/:id/read` - Mark single notification as read
- `PATCH /notifications/read-all` - Mark all user notifications as read
- `POST /notifications` - Create new notification (optional, for future use)

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, I need to analyze each acceptance criterion for testability.


### Property Reflection

After analyzing all acceptance criteria, I've identified several areas where properties can be consolidated:

**Consolidation Opportunities:**
1. Properties 5.1, 5.2, 5.3 (display title, message, timestamp) can be combined into a single property about displaying all required notification fields
2. Properties 5.4 and 5.5 (visual distinction for read/unread) are redundant - 5.5 is more specific and subsumes 5.4
3. Properties 6.3 and 6.4 (unread count update and visual indicator update) both test state updates after marking as read - can be combined
4. Properties 7.1-7.5 (store structure and actions) are all examples testing the store API - these are implementation verification, not properties
5. Properties 8.1-8.4 (service functions) are all examples testing the service API - these are implementation verification, not properties
6. Properties 9.1-9.8 (TypeScript interface fields) are all examples testing type structure - these are implementation verification, not properties

**Properties to Keep:**
- User visibility across user types (1.3)
- Bell click opens dropdown (1.5)
- Badge display for positive counts (2.1)
- Badge displays "99+" for counts > 99 (2.3)
- Auth token included in API requests (3.2)
- Fetched notifications stored in store (3.3)
- Error handling without crashes (3.4)
- Dropdown displays notifications on click (4.1)
- Notifications sorted in reverse chronological order (4.4)
- Click outside closes dropdown (4.5)
- All required notification fields displayed (5.1, 5.2, 5.3 combined)
- Unread notifications have distinct visual style (5.5)
- Opening dropdown marks notifications as read (6.1)
- Marking as read updates unread count and visuals (6.3, 6.4 combined)
- Failed mark-as-read handled gracefully (6.5)
- Components re-render on store changes (7.6)
- HTTP errors handled appropriately (8.6)
- Keyboard accessibility (Enter/Space) (11.2)
- Escape key returns focus to bell (11.5)
- Loading indicator during fetch (12.1)
- Caching prevents redundant API calls (12.2)
- Optimistic UI updates (12.3)
- Failed requests revert state (12.4)

### Property 1: Notification Bell Visibility Across User Types

*For any* authenticated user regardless of user type (ADMIN, MEMBER, CLIENT), the notification bell should be visible and accessible in the application header.

**Validates: Requirements 1.3**

### Property 2: Bell Click Opens Dropdown

*For any* state of the notification system, clicking the notification bell should open the notification dropdown.

**Validates: Requirements 1.5, 4.1**

### Property 3: Badge Display for Positive Unread Counts

*For any* positive integer unread count (1 to 99), the notification bell should display a badge showing that exact count.

**Validates: Requirements 2.1**

### Property 4: Badge Display for Large Unread Counts

*For any* unread count greater than 99, the notification bell badge should display "99+" instead of the exact number.

**Validates: Requirements 2.3**

### Property 5: Authentication Token in API Requests

*For any* API request made by the notification service, the request should include the authentication token in the Authorization header.

**Validates: Requirements 3.2, 3.5**

### Property 6: Fetched Notifications Stored in Store

*For any* successful notification fetch operation, the returned notifications should be stored in the notification store and accessible to components.

**Validates: Requirements 3.3**

### Property 7: Graceful Error Handling

*For any* API error response (4xx, 5xx), the notification service should handle the error without crashing the application and should set an appropriate error state.

**Validates: Requirements 3.4, 8.6**

### Property 8: Reverse Chronological Ordering

*For any* list of notifications with different creation timestamps, the notification dropdown should display them in reverse chronological order with the most recent notification first.

**Validates: Requirements 4.4**

### Property 9: Click Outside Closes Dropdown

*For any* open notification dropdown, clicking outside the dropdown area should close it.

**Validates: Requirements 4.5**

### Property 10: Complete Notification Information Display

*For any* notification in the dropdown, the UI should display all required fields: title, message, and formatted timestamp.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 11: Unread Visual Distinction

*For any* unread notification, the notification item should have a visually distinct style (such as bold text or background color) that differentiates it from read notifications.

**Validates: Requirements 5.4, 5.5**

### Property 12: Mark as Read on Dropdown Open

*For any* set of unread notifications, opening the notification dropdown should trigger the mark-all-as-read action.

**Validates: Requirements 6.1**

### Property 13: State Updates After Marking as Read

*For any* notification marked as read, both the unread count and the visual indicators should update to reflect the new read status.

**Validates: Requirements 6.3, 6.4**

### Property 14: Failed Mark-as-Read Handling

*For any* failed mark-as-read API request, the system should either retry the operation or log the error without leaving the UI in an inconsistent state.

**Validates: Requirements 6.5**

### Property 15: Reactive Component Updates

*For any* change to notification data in the store, all components consuming that data (NotificationBell and NotificationDropdown) should re-render with the updated information.

**Validates: Requirements 7.6**

### Property 16: Keyboard Accessibility

*For any* keyboard interaction with the notification bell (Enter or Space key), the dropdown should open just as it would with a mouse click.

**Validates: Requirements 11.2**

### Property 17: Focus Return on Escape

*For any* open notification dropdown, pressing the Escape key should close the dropdown and return focus to the notification bell.

**Validates: Requirements 11.5**

### Property 18: Loading State Display

*For any* in-progress notification fetch operation, the notification dropdown should display a loading indicator until the operation completes.

**Validates: Requirements 12.1**

### Property 19: API Call Caching

*For any* sequence of notification fetch requests within a short time window, the service should use cached data and avoid making redundant API calls.

**Validates: Requirements 12.2**

### Property 20: Optimistic UI Updates

*For any* mark-as-read operation, the UI should update immediately (optimistically) before waiting for the API response.

**Validates: Requirements 12.3**

### Property 21: State Reversion on Failure

*For any* failed optimistic update operation, the UI should revert to the previous state and display an appropriate error message.

**Validates: Requirements 12.4**

## Error Handling

### API Error Scenarios

1. **Network Errors**: When the API is unreachable
   - Display error message in dropdown: "Unable to load notifications. Please check your connection."
   - Retry button to attempt fetch again
   - Maintain previous notification state if available

2. **Authentication Errors (401)**: When the auth token is invalid or expired
   - Handled by existing API interceptor (redirects to login)
   - Clear notification store on logout

3. **Server Errors (500)**: When the backend encounters an error
   - Display error message: "Something went wrong. Please try again later."
   - Log error to console for debugging
   - Allow user to retry

4. **Mark-as-Read Failures**: When marking notifications as read fails
   - Revert optimistic update
   - Display toast notification: "Failed to mark notifications as read"
   - Retry automatically after 2 seconds (max 3 attempts)

### Client-Side Error Scenarios

1. **Empty State**: When user has no notifications
   - Display friendly empty state message: "No notifications yet"
   - Optional illustration or icon

2. **Loading State**: During initial fetch
   - Display skeleton loaders or spinner
   - Prevent interaction during loading

3. **Stale Data**: When notifications haven't been refreshed
   - Implement pull-to-refresh or auto-refresh mechanism
   - Show "last updated" timestamp

### Error Recovery Strategies

- **Exponential Backoff**: For retry attempts on failed API calls
- **Graceful Degradation**: Show cached data if available when fetch fails
- **User Feedback**: Clear error messages with actionable next steps
- **Logging**: Console errors for debugging, with error tracking service integration

## Testing Strategy

### Dual Testing Approach

The notification bell system will use both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** will focus on:
- Specific examples (e.g., badge displays "99+" for count of 150)
- Edge cases (e.g., zero unread count, empty notification list)
- Component rendering (e.g., correct icon used, proper ARIA labels)
- Integration points (e.g., store actions called correctly)
- Error conditions (e.g., specific error messages displayed)

**Property-Based Tests** will focus on:
- Universal properties across all inputs (e.g., any positive count displays badge)
- State transitions (e.g., marking as read always updates count)
- Data transformations (e.g., notifications always sorted correctly)
- Error handling (e.g., any API error handled gracefully)

### Property-Based Testing Configuration

**Library**: `fast-check` (JavaScript/TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with reference to design document property
- Tag format: `Feature: notification-bell-system, Property {number}: {property_text}`

**Example Property Test Structure**:
```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Feature: notification-bell-system', () => {
  it('Property 3: Badge Display for Positive Unread Counts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        (unreadCount) => {
          // Test that badge displays exact count for 1-99
          const badge = renderBadge(unreadCount);
          expect(badge.textContent).toBe(unreadCount.toString());
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Test Files**:
- `src/components/NotificationBell.test.tsx` - Component rendering and interaction
- `src/components/NotificationDropdown.test.tsx` - Dropdown display and behavior
- `src/services/notificationService.test.ts` - API service methods
- `src/store/useNotificationStore.test.ts` - Store actions and state updates

**Key Test Scenarios**:
1. Bell icon renders with correct ARIA label
2. Badge displays for unread count > 0
3. Badge hidden for unread count = 0
4. Badge shows "99+" for count > 99
5. Clicking bell opens dropdown
6. Dropdown shows loading state during fetch
7. Dropdown shows empty state when no notifications
8. Notifications sorted by createdAt descending
9. Unread notifications have distinct styling
10. Opening dropdown triggers mark-as-read
11. Failed API calls display error messages
12. Keyboard navigation works (Enter, Space, Escape)
13. Focus management for accessibility
14. Optimistic updates work correctly
15. State reverts on failed optimistic updates

### Integration Testing

**Scenarios**:
1. Full user flow: Load app → See unread count → Click bell → View notifications → Notifications marked as read
2. Error recovery: API fails → Error displayed → Retry succeeds → Notifications loaded
3. Real-time updates: New notification arrives → Unread count updates → Badge appears
4. Multi-tab sync: Mark as read in one tab → Updates reflected in other tabs (if implemented)

### Accessibility Testing

**Manual Testing Required**:
- Screen reader announcement of unread count
- Keyboard-only navigation through all features
- Focus visible indicators
- Color contrast for badge and notification items
- Touch target sizes on mobile devices

**Automated Accessibility Tests**:
- Use `@testing-library/jest-dom` and `axe-core` for automated a11y checks
- Test ARIA attributes presence and correctness
- Test keyboard event handlers

### Performance Testing

**Metrics to Monitor**:
- Initial render time of NotificationBell component
- Time to fetch and display notifications
- Re-render performance when notification count changes
- Memory usage with large notification lists (100+ items)

**Performance Targets**:
- Bell component renders in < 50ms
- Notification fetch completes in < 500ms (network dependent)
- Dropdown opens in < 100ms
- Smooth scrolling for lists with 100+ notifications

### Test Coverage Goals

- **Line Coverage**: > 80%
- **Branch Coverage**: > 75%
- **Function Coverage**: > 85%
- **Property Test Coverage**: All 21 properties implemented

### Continuous Integration

- Run all tests on every pull request
- Block merge if tests fail
- Generate coverage reports
- Run property tests with increased iterations (500+) in CI for thorough validation
