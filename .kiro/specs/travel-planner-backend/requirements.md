# Requirements Document

## Introduction

This document specifies the functional requirements for a travel planning backend system. The system enables users to create and manage trips, collaborate with fellow travelers, plan itineraries, and track budgets. The backend provides a GraphQL API built with NestJS and follows domain-driven design principles with Trip as the root aggregate.

## Glossary

- **System**: The travel planner backend GraphQL API
- **Trip**: A planned journey with dates, destinations, travelers, and optional itinerary
- **Destination**: A location within a trip with arrival and departure dates
- **Traveller**: A person associated with a trip, either as organizer or friend
- **Organizer**: The traveller who created the trip and has full management permissions
- **Friend**: A traveller who can view trip details but has limited modification permissions
- **Itinerary**: A day-by-day schedule of activities for a trip
- **Activity**: A scheduled event within an itinerary day with time and location
- **Budget_Breakdown**: Financial planning for a trip with categorized expenses
- **Currency_Code**: An ISO 4217 three-letter currency code (e.g., USD, EUR, GBP)
- **ISO_8601_Date**: A date-time string in ISO 8601 format
- **Valid_Email**: An email address conforming to RFC 5322 format

## Requirements

### Requirement 1: Trip Creation

**User Story:** As a user, I want to create a new trip with basic details, so that I can start planning my travel.

#### Acceptance Criteria

1. WHEN a user provides a title, start date, and end date, THE System SHALL create a new trip with status DRAFT
2. WHEN a trip is created, THE System SHALL assign a unique identifier to the trip
3. WHEN a trip is created, THE System SHALL add the creating user as the Organizer
4. WHEN a trip is created, THE System SHALL initialize an empty destinations list
5. WHEN a trip is created, THE System SHALL set createdAt and updatedAt timestamps to the current time
6. IF the end date is before the start date, THEN THE System SHALL reject the trip creation with an error message
7. IF the title is empty or contains only whitespace, THEN THE System SHALL reject the trip creation with an error message
8. WHERE a budget tier is provided, THE System SHALL initialize a Budget_Breakdown with the specified tier

### Requirement 2: Trip Date Validation

**User Story:** As a user, I want the system to validate trip dates, so that I cannot create trips with invalid date ranges.

#### Acceptance Criteria

1. WHEN validating trip dates, THE System SHALL verify both dates are valid ISO_8601_Date strings
2. WHEN validating trip dates, THE System SHALL verify the end date is greater than or equal to the start date
3. IF either date is not a valid ISO_8601_Date, THEN THE System SHALL return false
4. IF the end date is before the start date, THEN THE System SHALL return false
5. THE System SHALL perform date validation without side effects

### Requirement 3: Traveller Management

**User Story:** As an Organizer, I want to add travelers to my trip, so that I can collaborate with friends and family.

#### Acceptance Criteria

1. WHEN an Organizer adds a traveller with name, email, and role, THE System SHALL add the traveller to the trip
2. WHEN a traveller is added, THE System SHALL assign a unique identifier to the traveller
3. WHEN a traveller is added, THE System SHALL set the joinedAt timestamp to the current time
4. WHEN a traveller is added, THE System SHALL update the trip's updatedAt timestamp
5. IF the email is not a Valid_Email format, THEN THE System SHALL reject the addition with an error message
6. IF a traveller with the same email already exists in the trip, THEN THE System SHALL reject the addition with an error message
7. IF the role is Organizer and an Organizer already exists, THEN THE System SHALL reject the addition with an error message
8. THE System SHALL normalize email addresses to lowercase before storage

### Requirement 4: Trip Organizer Invariant

**User Story:** As a system architect, I want to ensure each trip has exactly one organizer, so that ownership and permissions are clear.

#### Acceptance Criteria

1. THE System SHALL ensure every trip has exactly one traveller with role Organizer
2. WHEN a trip is created, THE System SHALL automatically assign the creator as Organizer
3. WHEN adding a traveller, THE System SHALL prevent adding a second Organizer
4. WHEN removing a traveller, THE System SHALL prevent removing the Organizer

### Requirement 5: Traveller Email Uniqueness

**User Story:** As an Organizer, I want each traveller to have a unique email within my trip, so that I can identify participants clearly.

#### Acceptance Criteria

1. THE System SHALL ensure all traveller emails within a trip are unique
2. WHEN checking for duplicate travellers, THE System SHALL perform case-insensitive email comparison
3. IF a duplicate email is detected, THEN THE System SHALL reject the operation with an error message

### Requirement 6: Itinerary Generation

**User Story:** As an Organizer, I want to generate a day-by-day itinerary for my trip, so that I can plan activities systematically.

#### Acceptance Criteria

1. WHEN generating an itinerary for a trip, THE System SHALL create itinerary days for each day in the trip date range
2. WHEN generating an itinerary, THE System SHALL assign sequential day numbers starting from 1
3. WHEN generating an itinerary, THE System SHALL assign the correct date to each itinerary day
4. WHEN generating an itinerary, THE System SHALL create a unique identifier for the itinerary
5. WHEN generating an itinerary, THE System SHALL associate the itinerary with the trip
6. IF the trip has no destinations, THEN THE System SHALL reject itinerary generation with an error message
7. IF the trip does not exist, THEN THE System SHALL reject itinerary generation with an error message
8. WHERE preferences are provided, THE System SHALL use them to guide activity generation

### Requirement 7: Itinerary Day Sequence

**User Story:** As a user, I want itinerary days to be sequential and complete, so that I can follow my trip plan chronologically.

#### Acceptance Criteria

1. THE System SHALL ensure the number of itinerary days equals the number of days between start and end dates (inclusive)
2. THE System SHALL ensure each itinerary day has a unique sequential day number
3. THE System SHALL ensure itinerary day dates are within the trip date range
4. THE System SHALL ensure no gaps exist in the day sequence

### Requirement 8: Activity Time Validation

**User Story:** As a user, I want activities to have valid time ranges, so that my schedule makes logical sense.

#### Acceptance Criteria

1. THE System SHALL ensure activity end time is after activity start time
2. WHEN creating or updating an activity, THE System SHALL validate the time range
3. IF the end time is not after the start time, THEN THE System SHALL reject the operation with an error message

### Requirement 9: Budget Breakdown Management

**User Story:** As an Organizer, I want to create a budget breakdown for my trip, so that I can plan and track expenses.

#### Acceptance Criteria

1. WHEN creating a Budget_Breakdown, THE System SHALL require a total budget amount, Currency_Code, and budget tier
2. WHEN creating a Budget_Breakdown, THE System SHALL initialize an empty categories list
3. THE System SHALL ensure the total budget is a non-negative number
4. THE System SHALL validate the Currency_Code is a valid ISO 4217 code
5. IF the Currency_Code is invalid, THEN THE System SHALL reject the operation with an error message

### Requirement 10: Budget Currency Consistency

**User Story:** As a user, I want all budget categories to use the same currency, so that I can easily sum and compare expenses.

#### Acceptance Criteria

1. THE System SHALL ensure all budget categories within a Budget_Breakdown use the same Currency_Code as the total budget
2. WHEN adding a budget category, THE System SHALL validate the category currency matches the breakdown currency
3. IF the category currency does not match, THEN THE System SHALL reject the operation with an error message

### Requirement 11: Currency Code Validation

**User Story:** As a developer, I want currency codes to be validated, so that the system handles money correctly.

#### Acceptance Criteria

1. THE System SHALL validate all Currency_Code values are three-letter uppercase strings
2. THE System SHALL validate all Currency_Code values conform to ISO 4217 standard
3. IF a Currency_Code is invalid, THEN THE System SHALL reject the operation with an error message

### Requirement 12: Trip Retrieval

**User Story:** As a user, I want to retrieve trip details by ID, so that I can view and manage my trips.

#### Acceptance Criteria

1. WHEN a user queries a trip by ID, THE System SHALL return the complete trip details
2. WHEN returning trip details, THE System SHALL include destinations, travellers, itinerary, and budget breakdown
3. IF the trip ID does not exist, THEN THE System SHALL return an error indicating the trip was not found

### Requirement 13: Trip Update

**User Story:** As an Organizer, I want to update trip details, so that I can modify my plans as they change.

#### Acceptance Criteria

1. WHEN an Organizer updates a trip, THE System SHALL modify the specified fields
2. WHEN a trip is updated, THE System SHALL update the updatedAt timestamp
3. WHEN updating trip dates, THE System SHALL validate the new date range
4. IF the new dates are invalid, THEN THE System SHALL reject the update with an error message

### Requirement 14: Traveller Removal

**User Story:** As an Organizer, I want to remove travelers from my trip, so that I can manage the participant list.

#### Acceptance Criteria

1. WHEN an Organizer removes a traveller by ID, THE System SHALL remove the traveller from the trip
2. WHEN a traveller is removed, THE System SHALL update the trip's updatedAt timestamp
3. IF the traveller is the Organizer, THEN THE System SHALL reject the removal with an error message
4. IF the traveller ID does not exist in the trip, THEN THE System SHALL reject the removal with an error message

### Requirement 15: Destination Suggestions

**User Story:** As a user, I want to search for destination suggestions, so that I can discover places to visit.

#### Acceptance Criteria

1. WHEN a user searches for destinations with a query string, THE System SHALL return matching destinations
2. WHERE a budget is provided, THE System SHALL filter destinations by budget compatibility
3. WHERE a Currency_Code is provided, THE System SHALL use it for budget filtering
4. THE System SHALL return destination results with name, country, and description

### Requirement 16: Trip Email Notification

**User Story:** As an Organizer, I want to send trip details via email, so that I can share plans with participants.

#### Acceptance Criteria

1. WHEN an Organizer sends a trip email to a recipient, THE System SHALL deliver the email with trip details
2. WHEN sending a trip email, THE System SHALL validate the recipient email is a Valid_Email
3. WHEN sending a trip email, THE System SHALL return success status
4. IF the email fails to send, THEN THE System SHALL return an error message
5. IF the recipient email is invalid, THEN THE System SHALL reject the operation with an error message

### Requirement 17: GraphQL API Interface

**User Story:** As a client application developer, I want a GraphQL API, so that I can efficiently query and mutate trip data.

#### Acceptance Criteria

1. THE System SHALL expose a GraphQL API with queries for trip retrieval and destination suggestions
2. THE System SHALL expose GraphQL mutations for trip creation, updates, traveller management, and email sending
3. THE System SHALL provide a GraphQL schema with strongly-typed inputs and outputs
4. THE System SHALL support GraphQL introspection for schema discovery

### Requirement 18: Data Persistence

**User Story:** As a user, I want my trip data to be persisted, so that I can access it across sessions.

#### Acceptance Criteria

1. WHEN a trip is created or updated, THE System SHALL persist the changes to the database
2. WHEN an itinerary is generated, THE System SHALL persist it to the database
3. WHEN travellers are added or removed, THE System SHALL persist the changes to the database
4. THE System SHALL ensure data consistency across all persistence operations

### Requirement 19: Concurrent Operation Safety

**User Story:** As a system architect, I want the system to handle concurrent operations safely, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN multiple users modify the same trip concurrently, THE System SHALL prevent data corruption
2. WHEN concurrent traveller additions occur, THE System SHALL maintain the single Organizer invariant
3. WHEN concurrent traveller additions occur, THE System SHALL maintain email uniqueness

### Requirement 20: Error Response Format

**User Story:** As a client application developer, I want consistent error responses, so that I can handle errors predictably.

#### Acceptance Criteria

1. WHEN an operation fails due to invalid input, THE System SHALL return a BadRequestException with descriptive message
2. WHEN an operation fails due to resource not found, THE System SHALL return a NotFoundException with the resource identifier
3. WHEN an operation fails due to conflict, THE System SHALL return a ConflictException with conflict details
4. THE System SHALL include error codes and messages in GraphQL error responses
