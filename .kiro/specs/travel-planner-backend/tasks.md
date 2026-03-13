# Implementation Plan: Travel Planner Backend

## Overview

This plan implements a NestJS-based GraphQL backend for travel planning with TypeScript, TypeORM for database persistence, and fast-check for property-based testing. The implementation follows domain-driven design with Trip as the root aggregate.

## Tasks

- [x] 1. Set up project structure and shared types
  - Create NestJS monorepo structure with packages/shared
  - Set up TypeScript configuration for both backend and shared package
  - Install core dependencies: NestJS, GraphQL, TypeORM, PostgreSQL
  - Install testing dependencies: Jest, fast-check, @nestjs/testing
  - _Requirements: 17.1, 17.2, 17.3, 18.1_

- [ ] 2. Implement shared TypeScript interfaces
  - [x] 2.1 Create enums and core interfaces in packages/shared/src/types.ts
    - Define TripStatus, BudgetTier, TravellerRole enums
    - Define Trip, Destination, Traveller, Itinerary, ItineraryDay, Activity interfaces
    - Define BudgetBreakdown, BudgetCategory interfaces
    - Define input types: CreateTripInput, AddTravellerInput, PlanItineraryInput
    - _Requirements: 1.1, 3.1, 6.1, 9.1_
  
  - [x] 2.2 Create index.ts barrel export for shared package
    - Export all types and enums from types.ts
    - _Requirements: 17.3_

- [ ] 3. Set up NestJS application foundation
  - [x] 3.1 Create main.ts and app.module.ts
    - Configure NestJS application bootstrap
    - Set up GraphQL module with Apollo Server
    - Configure TypeORM with PostgreSQL connection
    - _Requirements: 17.1, 18.1_
  
  - [x] 3.2 Create GraphQL schema configuration
    - Configure code-first GraphQL schema generation
    - Set up GraphQL playground for development
    - _Requirements: 17.3, 17.4_
  
  - [x] 3.3 Create database configuration
    - Set up TypeORM configuration with environment variables
    - Configure connection pooling and logging
    - _Requirements: 18.1_

- [ ] 4. Implement Trip domain module
  - [x] 4.1 Create Trip entity and DTOs
    - Create trip.entity.ts with TypeORM decorators
    - Create create-trip.input.ts and update-trip.input.ts DTOs
    - Add class-validator decorators for input validation
    - _Requirements: 1.1, 1.2, 1.7, 13.1_
  
  - [x] 4.2 Implement date validation utility
    - Create validateTripDates function with ISO 8601 validation
    - Ensure end date >= start date validation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.3 Write property test for date validation
    - **Property 2: Date Validity**
    - **Validates: Requirements 1.6, 2.2**
    - Use fast-check to generate random date pairs
    - Verify endDate >= startDate for all valid trips
  
  - [x] 4.4 Create Trip repository
    - Implement trips.repository.ts with TypeORM repository pattern
    - Add methods: save, findById, findByIds, update, delete
    - _Requirements: 18.1, 18.2_
  
  - [x] 4.5 Implement Trip service with createTrip
    - Create trips.service.ts with createTrip method
    - Implement precondition checks (title, dates)
    - Auto-add creator as ORGANIZER traveller
    - Initialize empty destinations and timestamps
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [x] 4.6 Write unit tests for createTrip
    - Test valid trip creation (happy path)
    - Test invalid dates rejection
    - Test empty title rejection
    - Test organizer auto-assignment
    - _Requirements: 1.1, 1.6, 1.7_
  
  - [x] 4.7 Implement Trip GraphQL resolver
    - Create trips.resolver.ts with @Resolver decorator
    - Implement createTrip mutation
    - Implement getTrip query
    - _Requirements: 17.1, 17.2, 12.1, 12.2, 12.3_
  
  - [x] 4.8 Create Trips module and wire dependencies
    - Create trips.module.ts
    - Register Trip entity, service, resolver, repository
    - Import into app.module.ts
    - _Requirements: 17.1_

- [x] 5. Checkpoint - Verify Trip creation works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Traveller management
  - [x] 6.1 Create Traveller entity
    - Create traveller.entity.ts with TypeORM decorators
    - Add relationship to Trip entity
    - _Requirements: 3.1, 3.2_
  
  - [x] 6.2 Implement addTraveller in Trip service
    - Validate email format with class-validator
    - Check for duplicate email (case-insensitive)
    - Enforce single ORGANIZER rule
    - Normalize email to lowercase
    - Set joinedAt timestamp
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [x] 6.3 Write property test for single organizer invariant
    - **Property 1: Trip Aggregate Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - Generate random traveller additions
    - Verify exactly one ORGANIZER exists after all operations
  
  - [x] 6.4 Write property test for unique traveller emails
    - **Property 4: Unique Traveller Emails**
    - **Validates: Requirements 5.1, 5.2**
    - Generate random traveller lists
    - Verify no duplicate emails (case-insensitive)
  
  - [x] 6.5 Implement removeTraveller in Trip service
    - Prevent removing ORGANIZER
    - Validate traveller exists in trip
    - Update trip updatedAt timestamp
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 6.6 Write unit tests for traveller management
    - Test adding valid traveller
    - Test duplicate email rejection
    - Test multiple organizer rejection
    - Test removing non-organizer traveller
    - Test preventing organizer removal
    - _Requirements: 3.5, 3.6, 3.7, 4.3, 14.3_
  
  - [x] 6.7 Add traveller mutations to Trip resolver
    - Implement addTraveller mutation
    - Implement removeTraveller mutation
    - _Requirements: 17.2, 3.1, 14.1_
  
  - [x] 6.8 Create Travellers module
    - Create travellers.module.ts
    - Register Traveller entity
    - Import into app.module.ts
    - _Requirements: 17.1_

- [ ] 7. Implement Destination management
  - [x] 7.1 Create Destination entity
    - Create destination.entity.ts with TypeORM decorators
    - Add relationship to Trip entity
    - Add date validation for arrival/departure
    - _Requirements: 15.4_
  
  - [x] 7.2 Implement destination suggestion service
    - Create destinations.service.ts
    - Implement suggestDestinations with query filtering
    - Add budget and currency filtering logic
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [x] 7.3 Create Destinations resolver
    - Create destinations.resolver.ts
    - Implement suggestDestinations query
    - _Requirements: 17.1, 15.1_
  
  - [x] 7.4 Create Destinations module
    - Create destinations.module.ts
    - Register Destination entity, service, resolver
    - Import into app.module.ts
    - _Requirements: 17.1_

- [x] 8. Checkpoint - Verify traveller and destination features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Itinerary generation
  - [x] 9.1 Create Itinerary, ItineraryDay, and Activity entities
    - Create itinerary.entity.ts with TypeORM decorators
    - Create itinerary-day.entity.ts with TypeORM decorators
    - Create activity.entity.ts with TypeORM decorators
    - Add relationships between entities
    - _Requirements: 6.1, 6.4, 6.5_
  
  - [x] 9.2 Implement activity time validation
    - Create validateActivityTimes utility function
    - Ensure endTime > startTime
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 9.3 Write property test for activity time validity
    - **Property 6: Activity Time Validity**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - Generate random activities with times
    - Verify endTime > startTime for all activities
  
  - [x] 9.4 Implement itinerary generation algorithm
    - Create itineraries.service.ts
    - Implement generateItinerary method
    - Calculate day count from trip date range
    - Generate sequential ItineraryDay objects
    - Generate activities for each day based on preferences
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [x] 9.5 Write property test for itinerary day sequence
    - **Property 3: Itinerary Day Sequence**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
    - Generate random trip date ranges
    - Verify day count matches date range
    - Verify sequential day numbers starting from 1
    - Verify all dates within trip range
  
  - [x] 9.6 Write unit tests for itinerary generation
    - Test itinerary generation with valid trip
    - Test rejection when trip has no destinations
    - Test rejection when trip doesn't exist
    - Test day count calculation
    - Test sequential day numbering
    - _Requirements: 6.6, 6.7, 7.1, 7.2_
  
  - [x] 9.7 Create Itineraries resolver
    - Create itineraries.resolver.ts
    - Implement generateItinerary query
    - _Requirements: 17.1, 6.1_
  
  - [x] 9.8 Create Itineraries module
    - Create itineraries.module.ts
    - Register Itinerary, ItineraryDay, Activity entities
    - Register service and resolver
    - Import into app.module.ts
    - _Requirements: 17.1_

- [ ] 10. Implement Budget management
  - [x] 10.1 Create BudgetBreakdown and BudgetCategory entities
    - Create budget-breakdown.entity.ts with TypeORM decorators
    - Create budget-category.entity.ts with TypeORM decorators
    - Add currency validation with CHECK constraint
    - Add relationship to Trip entity
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 10.2 Implement currency code validation
    - Create validateCurrencyCode utility function
    - Validate ISO 4217 format (3 uppercase letters)
    - Add list of valid currency codes
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 10.3 Implement budget service
    - Create budget.service.ts
    - Implement createBudgetBreakdown method
    - Implement addBudgetCategory method
    - Enforce currency consistency across categories
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3_
  
  - [x] 10.4 Write property test for budget currency consistency
    - **Property 5: Budget Currency Consistency**
    - **Validates: Requirements 10.1, 10.2, 10.3**
    - Generate random budget breakdowns with categories
    - Verify all category currencies match breakdown currency
  
  - [x] 10.5 Write unit tests for budget management
    - Test budget creation with valid currency
    - Test invalid currency rejection
    - Test category currency mismatch rejection
    - Test non-negative budget validation
    - _Requirements: 9.3, 9.5, 10.3, 11.3_
  
  - [x] 10.6 Create Budget module
    - Create budget.module.ts
    - Register BudgetBreakdown and BudgetCategory entities
    - Register budget service
    - Import into app.module.ts
    - _Requirements: 17.1_

- [x] 11. Checkpoint - Verify itinerary and budget features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement Trip update functionality
  - [x] 12.1 Implement updateTrip in Trip service
    - Add updateTrip method to trips.service.ts
    - Validate new date range if dates are updated
    - Update updatedAt timestamp
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 12.2 Write unit tests for updateTrip
    - Test updating trip title and description
    - Test updating trip dates with validation
    - Test invalid date rejection
    - Test updatedAt timestamp update
    - _Requirements: 13.1, 13.2, 13.4_
  
  - [x] 12.3 Add updateTrip mutation to resolver
    - Implement updateTrip mutation in trips.resolver.ts
    - _Requirements: 17.2, 13.1_

- [ ] 13. Implement Email notification service
  - [x] 13.1 Create email service
    - Create email.service.ts
    - Implement sendTripEmail method with nodemailer
    - Validate recipient email format
    - Format trip details for email body
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [x] 13.2 Write unit tests for email service
    - Test email sending with valid recipient
    - Test invalid email rejection
    - Test email failure handling
    - Mock nodemailer for testing
    - _Requirements: 16.2, 16.4, 16.5_
  
  - [x] 13.3 Add sendTripEmail mutation to resolver
    - Implement sendTripEmail mutation in trips.resolver.ts
    - _Requirements: 17.2, 16.1_
  
  - [x] 13.4 Create Email module
    - Create email.module.ts
    - Register email service
    - Import into app.module.ts
    - _Requirements: 17.1_

- [ ] 14. Implement error handling and validation
  - [x] 14.1 Create custom exception filters
    - Create BadRequestException filter for invalid input
    - Create NotFoundException filter for missing resources
    - Create ConflictException filter for conflicts
    - Format GraphQL error responses
    - _Requirements: 20.1, 20.2, 20.3, 20.4_
  
  - [x] 14.2 Add validation pipes
    - Configure global ValidationPipe with class-validator
    - Add transform and whitelist options
    - _Requirements: 17.3_
  
  - [x] 14.3 Create common guards and decorators
    - Create authentication guard (placeholder for future auth)
    - Create authorization decorators
    - _Requirements: 17.1_

- [ ] 15. Add data persistence and transaction support
  - [ ] 15.1 Configure TypeORM transactions
    - Add transaction support to service methods
    - Ensure atomic operations for complex workflows
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 19.1_
  
  - [x] 15.2 Add database migrations
    - Create initial migration for all entities
    - Configure migration scripts in package.json
    - _Requirements: 18.1_
  
  - [x] 15.3 Write integration tests for data persistence
    - Test trip creation and retrieval from database
    - Test traveller management persistence
    - Test itinerary generation persistence
    - Use testcontainers for PostgreSQL
    - _Requirements: 18.1, 18.2, 18.3_

- [ ] 16. Implement concurrent operation safety
  - [x] 16.1 Add optimistic locking to entities
    - Add @Version decorator to Trip entity
    - Handle version conflicts in service layer
    - _Requirements: 19.1, 19.2, 19.3_
  
  - [x] 16.2 Write concurrency tests
    - Test concurrent traveller additions
    - Test concurrent trip updates
    - Verify single organizer invariant under concurrency
    - Verify email uniqueness under concurrency
    - _Requirements: 19.1, 19.2, 19.3_

- [ ] 17. Final integration and wiring
  - [x] 17.1 Wire all modules together in app.module.ts
    - Import all feature modules
    - Configure GraphQL with all resolvers
    - Configure TypeORM with all entities
    - _Requirements: 17.1, 17.2_
  
  - [x] 17.2 Create GraphQL schema file
    - Generate schema.graphql from code-first definitions
    - Verify schema matches design document
    - _Requirements: 17.3, 17.4_
  
  - [x] 17.3 Add environment configuration
    - Create .env.example with all required variables
    - Configure database connection strings
    - Configure email service credentials
    - _Requirements: 18.1_
  
  - [x] 17.4 Write end-to-end integration tests
    - Test complete trip creation workflow
    - Test trip with travellers, destinations, and itinerary
    - Test budget breakdown creation and management
    - Test email notification flow
    - _Requirements: 1.1, 3.1, 6.1, 9.1, 16.1_

- [ ] 18. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end workflows with real database
- The implementation uses TypeScript throughout as specified in the design document
- All date handling uses ISO 8601 format
- All currency codes follow ISO 4217 standard
- The system follows NestJS best practices with modular architecture
,