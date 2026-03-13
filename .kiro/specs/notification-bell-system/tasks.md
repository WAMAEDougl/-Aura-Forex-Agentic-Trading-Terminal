# Implementation Plan: Notification Bell System

## Overview

This plan implements a notification bell system in the ProjectHub application header. The system displays user-specific notifications with an unread count badge, provides a dropdown interface for viewing notifications, and automatically marks notifications as read when viewed. The implementation uses TypeScript, React, Zustand for state management, shadcn-ui components, and follows the existing project architecture patterns.

## Tasks

- [x] 1. Define TypeScript types and interfaces
  - Add Notification interface to src/types/index.ts with all required fields (id, userId, title, message, isRead, createdAt, type, relatedEntityId, relatedEntityType)
  - Ensure type safety for notification data throughout the application
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 2. Create notification API service
  - [x] 2.1 Implement notificationService.ts with API methods
    - Create src/services/notificationService.ts following existing service patterns
    - Implement getAll() method to fetch user notifications
    - Implement markAsRead(notificationId) method for single notification
    - Implement markAllAsRead() method for bulk updates
    - Use existing apiService instance from lib/api.ts
    - Include authentication token in all requests
    - Handle HTTP errors appropriately
    - _Requirements: 3.1, 3.2, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 2.2 Write unit tests for notificationService
    - Test successful API calls and error handling
    - Test authentication token inclusion
    - Mock API responses for different scenarios
    - _Requirements: 3.2, 3.4, 8.6_

- [x] 3. Create Zustand notification store
  - [x] 3.1 Implement useNotificationStore.ts
    - Create src/store/useNotificationStore.ts following useStore.ts patterns
    - Define state shape: notifications array, unreadCount, isLoading, error
    - Implement fetchNotifications action
    - Implement markAsRead action
    - Implement markAllAsRead action with optimistic updates
    - Implement addNotification action
    - Implement setNotifications action
    - Implement updateUnreadCount helper
    - Store fetched notifications and maintain unread count
    - _Requirements: 3.3, 7.1, 7.2, 7.3, 7.4, 7.5, 12.2, 12.3_

  - [x] 3.2 Write property test for store state updates
    - **Property 15: Reactive Component Updates**
    - **Validates: Requirements 7.6**

  - [x] 3.3 Write unit tests for store actions
    - Test fetchNotifications updates state correctly
    - Test markAllAsRead with optimistic updates
    - Test error state handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. Checkpoint - Ensure data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement NotificationItem component
  - [x] 5.1 Create NotificationItem component
    - Create src/components/NotificationItem.tsx
    - Display notification title, message, and formatted timestamp
    - Use date-fns for relative time formatting
    - Apply distinct visual styling for unread notifications (bold text or amber background tint)
    - Apply muted styling for read notifications
    - Add hover states for interactivity
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 5.2 Write property test for notification display
    - **Property 10: Complete Notification Information Display**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [x] 5.3 Write property test for unread visual distinction
    - **Property 11: Unread Visual Distinction**
    - **Validates: Requirements 5.4, 5.5**

  - [x] 5.4 Write unit tests for NotificationItem
    - Test rendering of all notification fields
    - Test visual differences between read/unread states
    - Test timestamp formatting
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Implement NotificationDropdown component
  - [x] 6.1 Create NotificationDropdown component
    - Create src/components/NotificationDropdown.tsx
    - Use shadcn-ui Popover component for dropdown
    - Display loading state with spinner during fetch
    - Display empty state message when no notifications
    - Render NotificationList with NotificationItem components
    - Sort notifications in reverse chronological order by createdAt
    - Implement maximum height with scrollable content
    - Handle click outside to close dropdown
    - Implement focus trap when open
    - Support Escape key to close
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 11.3, 11.4, 11.5, 12.1_

  - [x] 6.2 Write property test for reverse chronological ordering
    - **Property 8: Reverse Chronological Ordering**
    - **Validates: Requirements 4.4**

  - [x] 6.3 Write property test for click outside behavior
    - **Property 9: Click Outside Closes Dropdown**
    - **Validates: Requirements 4.5**

  - [x] 6.4 Write property test for loading state display
    - **Property 18: Loading State Display**
    - **Validates: Requirements 12.1**

  - [x] 6.5 Write unit tests for NotificationDropdown
    - Test loading state rendering
    - Test empty state rendering
    - Test notification list rendering
    - Test sorting logic
    - Test keyboard interactions (Escape key)
    - _Requirements: 4.2, 4.3, 4.4, 11.5, 12.1_

- [x] 7. Implement NotificationBell component
  - [x] 7.1 Create NotificationBell component
    - Create src/components/NotificationBell.tsx
    - Use Bell icon from lucide-react
    - Display badge with unread count when count > 0
    - Display "99+" for counts > 99
    - Hide badge when count is 0
    - Position badge at top-right corner with amber/orange styling
    - Implement hover state with amber color transition
    - Make bell clickable to toggle dropdown
    - Trigger markAllAsRead when dropdown opens
    - Add ARIA label for accessibility
    - Support keyboard interaction (Enter/Space to open)
    - Integrate NotificationDropdown component
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 11.1, 11.2, 11.6_

  - [x] 7.2 Write property test for bell visibility
    - **Property 1: Notification Bell Visibility Across User Types**
    - **Validates: Requirements 1.3**

  - [x] 7.3 Write property test for bell click behavior
    - **Property 2: Bell Click Opens Dropdown**
    - **Validates: Requirements 1.5, 4.1**

  - [x] 7.4 Write property test for badge display with positive counts
    - **Property 3: Badge Display for Positive Unread Counts**
    - **Validates: Requirements 2.1**

  - [x] 7.5 Write property test for badge display with large counts
    - **Property 4: Badge Display for Large Unread Counts**
    - **Validates: Requirements 2.3**

  - [x] 7.6 Write property test for mark as read on dropdown open
    - **Property 12: Mark as Read on Dropdown Open**
    - **Validates: Requirements 6.1**

  - [x] 7.7 Write property test for keyboard accessibility
    - **Property 16: Keyboard Accessibility**
    - **Validates: Requirements 11.2**

  - [x] 7.8 Write unit tests for NotificationBell
    - Test bell icon rendering
    - Test badge visibility logic
    - Test badge text for different counts
    - Test click handler
    - Test keyboard handlers
    - Test ARIA attributes
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.3, 2.4, 11.1, 11.2_

- [x] 8. Checkpoint - Ensure component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Integrate NotificationBell into BackofficeLayout
  - [x] 9.1 Add NotificationBell to header
    - Import NotificationBell component in src/components/BackofficeLayout.tsx
    - Position NotificationBell in header between breadcrumbs and portfolio link
    - Ensure proper spacing and alignment with existing header elements
    - Maintain responsive design for mobile screens
    - _Requirements: 1.1, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 9.2 Initialize notification store on app load
    - Call fetchNotifications when BackofficeLayout mounts
    - Handle authentication state (only fetch for authenticated users)
    - _Requirements: 3.1_

  - [x] 9.3 Write integration tests for BackofficeLayout
    - Test NotificationBell renders in correct position
    - Test notification fetch on mount
    - Test responsive behavior
    - _Requirements: 1.1, 10.1_

- [x] 10. Implement error handling and recovery
  - [x] 10.1 Add error handling to notification service
    - Handle network errors with user-friendly messages
    - Handle authentication errors (401) appropriately
    - Handle server errors (500) with retry capability
    - Implement exponential backoff for retries
    - Log errors to console for debugging
    - _Requirements: 3.4, 6.5, 8.6_

  - [x] 10.2 Add error UI states to components
    - Display error messages in NotificationDropdown
    - Add retry button for failed fetches
    - Show toast notifications for mark-as-read failures
    - Implement automatic retry for failed mark-as-read (max 3 attempts)
    - _Requirements: 3.4, 6.5, 12.4_

  - [x] 10.3 Write property test for graceful error handling
    - **Property 7: Graceful Error Handling**
    - **Validates: Requirements 3.4, 8.6**

  - [x] 10.4 Write property test for failed mark-as-read handling
    - **Property 14: Failed Mark-as-Read Handling**
    - **Validates: Requirements 6.5**

  - [x] 10.5 Write property test for state reversion on failure
    - **Property 21: State Reversion on Failure**
    - **Validates: Requirements 12.4**

  - [x] 10.6 Write unit tests for error scenarios
    - Test network error handling
    - Test server error handling
    - Test retry logic
    - Test error message display
    - _Requirements: 3.4, 6.5, 8.6, 12.4_

- [x] 11. Implement optimistic updates and caching
  - [x] 11.1 Add optimistic update logic to store
    - Update UI immediately when marking as read
    - Revert state if API call fails
    - Display error message on failure
    - _Requirements: 12.3, 12.4_

  - [x] 11.2 Implement API call caching
    - Cache notification data in store
    - Avoid redundant API calls within short time window
    - Implement cache invalidation strategy
    - _Requirements: 12.2_

  - [x] 11.3 Write property test for optimistic UI updates
    - **Property 20: Optimistic UI Updates**
    - **Validates: Requirements 12.3**

  - [x] 11.4 Write property test for API call caching
    - **Property 19: API Call Caching**
    - **Validates: Requirements 12.2**

  - [x] 11.5 Write unit tests for optimistic updates
    - Test immediate UI update
    - Test state reversion on failure
    - Test cache behavior
    - _Requirements: 12.2, 12.3, 12.4_

- [x] 12. Implement remaining property-based tests
  - [x] 12.1 Write property test for authentication token in API requests
    - **Property 5: Authentication Token in API Requests**
    - **Validates: Requirements 3.2, 3.5**

  - [x] 12.2 Write property test for fetched notifications stored in store
    - **Property 6: Fetched Notifications Stored in Store**
    - **Validates: Requirements 3.3**

  - [x] 12.3 Write property test for state updates after marking as read
    - **Property 13: State Updates After Marking as Read**
    - **Validates: Requirements 6.3, 6.4**

  - [x] 12.4 Write property test for focus return on Escape
    - **Property 17: Focus Return on Escape**
    - **Validates: Requirements 11.5**

- [x] 13. Accessibility enhancements
  - [x] 13.1 Add comprehensive ARIA attributes
    - Add aria-label to NotificationBell
    - Add aria-live region for unread count announcements
    - Add proper ARIA attributes to Popover
    - Ensure keyboard navigation works throughout
    - Test focus management
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [x] 13.2 Ensure responsive design for mobile
    - Test touch targets on mobile devices
    - Adjust dropdown positioning for mobile viewport
    - Ensure readable text sizes
    - Test on various screen sizes
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 13.3 Write accessibility tests
    - Test ARIA attributes with axe-core
    - Test keyboard navigation
    - Test focus management
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.7_

- [x] 14. Final integration and polish
  - [x] 14.1 Ensure non-blocking initial render
    - Verify NotificationBell doesn't block page load
    - Implement lazy loading if needed
    - Optimize initial fetch timing
    - _Requirements: 12.5_

  - [x] 14.2 Add performance optimizations
    - Implement virtualization for long notification lists if needed
    - Optimize re-render performance
    - Test with 100+ notifications
    - _Requirements: 12.2_

  - [x] 14.3 Write integration tests for complete user flows
    - Test full flow: load app → see unread count → click bell → view notifications → marked as read
    - Test error recovery flow
    - Test multi-component interaction
    - _Requirements: 1.1, 1.5, 2.1, 4.1, 6.1_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows existing ProjectHub patterns (Zustand stores, API services, shadcn-ui components)
- TypeScript is used throughout for type safety
- All 21 correctness properties from the design document are covered in optional property test tasks
