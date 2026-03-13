# Implementation Plan: Proxy Backend Implementation

## Overview

This implementation plan covers the complete development of a NestJS-based proxy backend system with multi-provider payment processing (Stripe and M-Pesa), tax compliance (ETIMS), file management (AWS S3), user authentication (JWT), and comprehensive proxy service management. The implementation follows a modular architecture with clear separation of concerns across authentication, users, proxies, payments, tax, and file management modules.

## Tasks

- [x] 1. Set up database schema and Prisma configuration
  - [x] 1.1 Define Prisma schema with User, Proxy, and Transaction models
    - Create User model with id, email, password, balance, and timestamps
    - Create Proxy model with id, userId, type (RESIDENTIAL/DATACENTER), ip, port, username, password, expiresAt, isActive
    - Create Transaction model with id, userId, amount, provider (STRIPE/MPESA), status (PENDING/COMPLETED/FAILED), externalPaymentId, taxInvoiceId, timestamps
    - Set up foreign key relationships and indexes
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [x] 1.2 Generate Prisma client and run initial migration
    - Run `prisma generate` to create TypeScript client
    - Create and apply database migration
    - _Requirements: 7.3_
  
  - [ ]* 1.3 Write unit tests for Prisma schema validation
    - Test model relationships and constraints
    - _Requirements: 7.2_

- [x] 2. Implement configuration management module
  - [x] 2.1 Create ConfigModule with environment variable validation
    - Define configuration schema using Joi for JWT_SECRET, DATABASE_URL, AWS_S3_BUCKET, STRIPE_SECRET_KEY, MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, ETIMS_API_URL, ETIMS_API_KEY
    - Implement validation that fails on startup if required config is missing
    - Support different configurations for development, staging, and production
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 2.2 Write unit tests for configuration validation
    - Test missing required variables
    - Test invalid configuration formats
    - _Requirements: 9.3_

- [x] 3. Implement authentication module
  - [x] 3.1 Create JWT strategy and guards
    - Implement JwtStrategy using passport-jwt
    - Create JwtAuthGuard for protecting endpoints
    - Configure JWT token generation with expiration
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [x] 3.2 Implement AuthService with login and token validation
    - Create login method that validates credentials and generates JWT
    - Implement token validation logic
    - Handle authentication errors with proper error messages
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 3.3 Create AuthController with login endpoint
    - Implement POST /auth/login endpoint
    - Add request validation using class-validator
    - Return JWT token on successful authentication
    - _Requirements: 1.1, 1.2, 8.1, 8.3_
  
  - [ ]* 3.4 Write unit tests for AuthService
    - Test successful login with valid credentials
    - Test failed login with invalid credentials
    - Test JWT token generation and validation
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 3.5 Write integration tests for auth endpoints
    - Test POST /auth/login with valid and invalid credentials
    - Test protected endpoints with and without JWT
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Implement users module
  - [x] 4.1 Create UsersService with CRUD operations
    - Implement createUser method with zero initial balance
    - Implement findByEmail method with unique email constraint
    - Implement getUserProfile method returning user details and balance
    - Implement updateBalance method with transaction safety
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.2 Create UsersController with user management endpoints
    - Implement POST /users/register endpoint
    - Implement GET /users/me endpoint (protected with JWT)
    - Add request validation and response serialization
    - _Requirements: 2.1, 2.3, 8.1, 8.3, 8.4_
  
  - [ ]* 4.3 Write unit tests for UsersService
    - Test user creation with zero balance
    - Test unique email constraint
    - Test balance updates
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [ ]* 4.4 Write integration tests for user endpoints
    - Test user registration flow
    - Test retrieving user profile
    - _Requirements: 2.1, 2.3_

- [x] 5. Checkpoint - Verify authentication and user management
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement proxy service module
  - [x] 6.1 Create ProxiesService with proxy management logic
    - Implement createProxy method with type, IP, port, credentials, and expiration
    - Implement getUserProxies method filtering by active and non-expired
    - Implement expireProxy method to mark proxies as inactive
    - Support both RESIDENTIAL and DATACENTER proxy types
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 6.2 Create ProxiesController with proxy endpoints
    - Implement POST /proxies endpoint (protected with JWT)
    - Implement GET /proxies endpoint returning user's active proxies (protected with JWT)
    - Add validation for proxy type enum
    - _Requirements: 3.1, 3.5, 8.1, 8.3_
  
  - [ ]* 6.3 Write unit tests for ProxiesService
    - Test proxy creation with different types
    - Test filtering active vs expired proxies
    - Test proxy expiration logic
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 6.4 Write integration tests for proxy endpoints
    - Test creating proxies
    - Test retrieving user's proxies
    - Test proxy expiration handling
    - _Requirements: 3.1, 3.5_

- [x] 7. Implement Stripe payment provider
  - [x] 7.1 Create StripeService for payment processing
    - Initialize Stripe SDK with API key from config
    - Implement createPaymentIntent method
    - Implement handleWebhook method for payment confirmations
    - Handle payment success and failure scenarios
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 7.2 Write unit tests for StripeService
    - Test payment intent creation
    - Test webhook handling for success and failure
    - Mock Stripe SDK calls
    - _Requirements: 4.3_

- [x] 8. Implement M-Pesa payment provider
  - [x] 8.1 Create MpesaService for STK Push integration
    - Implement OAuth token generation for M-Pesa API
    - Implement initiateSTKPush method
    - Implement handleCallback method for payment responses
    - Handle M-Pesa specific error codes
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ]* 8.2 Write unit tests for MpesaService
    - Test STK Push initiation
    - Test callback handling
    - Test OAuth token generation
    - _Requirements: 4.4_

- [x] 9. Implement payments module orchestration
  - [x] 9.1 Create PaymentsService to coordinate payment providers
    - Implement initiatePayment method creating PENDING transaction
    - Implement completePayment method updating transaction status and user balance
    - Implement failPayment method updating transaction status to FAILED
    - Store external payment IDs for reconciliation
    - Route to appropriate provider based on payment method
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 9.2 Create PaymentsController with payment endpoints
    - Implement POST /payments/stripe endpoint (protected with JWT)
    - Implement POST /payments/mpesa endpoint (protected with JWT)
    - Implement POST /payments/stripe/webhook endpoint (public)
    - Implement POST /payments/mpesa/callback endpoint (public)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.1_
  
  - [ ]* 9.3 Write unit tests for PaymentsService
    - Test transaction creation with PENDING status
    - Test payment completion and balance update
    - Test payment failure handling
    - _Requirements: 4.1, 4.5, 4.7_
  
  - [ ]* 9.4 Write integration tests for payment endpoints
    - Test Stripe payment flow
    - Test M-Pesa payment flow
    - Test webhook and callback handling
    - _Requirements: 4.1, 4.3, 4.4_

- [x] 10. Checkpoint - Verify payment processing
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement ETIMS tax compliance service
  - [x] 11.1 Create EtimsService for tax invoice generation
    - Implement authentication with ETIMS API
    - Implement generateInvoice method for completed transactions
    - Implement retry logic with exponential backoff for failures
    - Implement queue mechanism for offline invoice generation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 11.2 Create TaxService to integrate ETIMS with payments
    - Implement processTransactionTax method called after payment completion
    - Store tax invoice ID in transaction record
    - Handle ETIMS unavailability gracefully
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 11.3 Write unit tests for EtimsService
    - Test invoice generation
    - Test retry logic
    - Test queue mechanism
    - Mock ETIMS API calls
    - _Requirements: 5.1, 5.3, 5.5_
  
  - [ ]* 11.4 Write unit tests for TaxService
    - Test tax processing after payment
    - Test handling ETIMS failures
    - _Requirements: 5.1, 5.3_

- [x] 12. Implement AWS S3 file management service
  - [x] 12.1 Create S3Service for file operations
    - Initialize AWS S3 SDK with credentials from config
    - Implement uploadFile method with access controls
    - Implement generatePresignedUrl method for secure file access
    - Implement deleteFile method for cleanup
    - Implement getFileMetadata method
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 12.2 Create FilesController with file endpoints
    - Implement POST /files/upload endpoint (protected with JWT)
    - Implement GET /files/:id endpoint with permission validation (protected with JWT)
    - Implement DELETE /files/:id endpoint (protected with JWT)
    - Use multer for file upload handling
    - _Requirements: 6.1, 6.3, 8.1_
  
  - [ ]* 12.3 Write unit tests for S3Service
    - Test file upload
    - Test presigned URL generation
    - Test file deletion
    - Mock AWS S3 SDK calls
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ]* 12.4 Write integration tests for file endpoints
    - Test file upload flow
    - Test file access with permissions
    - Test file deletion
    - _Requirements: 6.1, 6.3_

- [x] 13. Implement error handling and logging
  - [x] 13.1 Create global exception filter
    - Implement custom exception filter for consistent error responses
    - Handle database connection errors gracefully
    - Return appropriate HTTP status codes for different error types
    - _Requirements: 10.1, 10.2, 10.5, 8.5_
  
  - [x] 13.2 Implement structured logging service
    - Create LoggerService with different severity levels
    - Log errors with context and stack traces
    - Implement retry mechanisms for external service failures
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [ ]* 13.3 Write unit tests for error handling
    - Test exception filter responses
    - Test logging at different severity levels
    - _Requirements: 10.1, 10.5_

- [x] 14. Implement CORS and API validation
  - [x] 14.1 Configure CORS for client access
    - Set up CORS middleware in main.ts
    - Configure allowed origins based on environment
    - _Requirements: 8.6_
  
  - [x] 14.2 Set up global validation pipes
    - Configure class-validator globally
    - Configure class-transformer for response serialization
    - Return validation errors with HTTP 400 status
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 15. Implement database connection pooling and performance optimizations
  - [x] 15.1 Configure Prisma connection pooling
    - Set up connection pool size in Prisma configuration
    - Implement connection retry logic
    - _Requirements: 12.2, 10.2_
  
  - [x] 15.2 Add database indexes for performance
    - Add index on User.email for unique lookups
    - Add index on Proxy.userId and Proxy.expiresAt for filtering
    - Add index on Transaction.userId for user transaction queries
    - _Requirements: 12.5_
  
  - [ ]* 15.3 Write performance tests
    - Test concurrent payment processing
    - Test response times under load
    - _Requirements: 12.1, 12.3_

- [x] 16. Checkpoint - Verify complete system integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Create end-to-end test suite
  - [ ]* 17.1 Write E2E tests for complete user workflows
    - Test user registration → login → payment → proxy creation flow
    - Test Stripe payment with tax invoice generation
    - Test M-Pesa payment with tax invoice generation
    - Test file upload and retrieval
    - _Requirements: 11.3_
  
  - [ ]* 17.2 Set up test coverage reporting
    - Configure Jest coverage thresholds
    - Generate coverage reports
    - _Requirements: 11.4_

- [x] 18. Final integration and documentation
  - [x] 18.1 Wire all modules together in AppModule
    - Import and configure all feature modules
    - Set up module dependencies
    - Configure global middleware and guards
    - _Requirements: 1.5, 8.1_
  
  - [x] 18.2 Create API documentation
    - Document all endpoints with request/response examples
    - Document authentication requirements
    - Document error responses
    - _Requirements: 8.1_
  
  - [x] 18.3 Create environment configuration template
    - Create .env.example file with all required variables
    - Document each configuration variable
    - _Requirements: 9.1, 9.4_

- [x] 19. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation follows NestJS best practices with modular architecture
- All services use dependency injection for testability
- Database operations use Prisma ORM for type safety
- External service integrations (Stripe, M-Pesa, ETIMS, S3) are isolated in dedicated services
- Authentication is enforced using JWT guards on protected endpoints
- Validation is handled using class-validator decorators
- Error handling is centralized through exception filters
