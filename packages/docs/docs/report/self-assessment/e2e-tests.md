# End-to-End Tests

This section describes the end-to-end tests implemented for the AuctiOn platform.

## Overview

End-to-end (E2E) tests verify the entire system's functionality from the user's perspective. These tests simulate real
user interactions with the application and ensure that all microservices work together correctly as an integrated
system.

## Test Architecture

The E2E tests are implemented using a dedicated test package that orchestrates test scenarios across all microservices.
The tests use:

- **Jest**: As the primary testing framework
- **Supertest**: For HTTP API testing
- **Socket.io-client**: For WebSocket communication testing
- **Custom Client Class**: An abstraction layer to simplify test scenario implementation

The tests run in a controlled environment using Docker Compose, which spins up all required services including:

- All microservices
- MongoDB
- Redis
- Kafka
- Mailhog (for email testing)

### Multiple Auction Service Replicas

A key aspect of the test architecture is the use of multiple replicas of the Auction Service within the Docker Compose
test environment. This design choice serves several important purposes:

1. **Horizontal Scaling Verification**: Tests confirm that the system operates correctly when the Auction Service is
   horizontally scaled
2. **Load Distribution**: Validates that requests are properly distributed across service instances
3. **State Synchronization**: Ensures that all Auction Service instances maintain consistent state through shared Redis
   and Kafka infrastructure
4. **Failover Testing**: Provides confidence that the system can handle instance failures without disrupting user
   experience

This approach ensures that the application behaves correctly in a production-like environment where multiple instances
of services would typically be deployed for redundancy and load balancing.

## Test Scenarios

The following E2E test scenarios have been implemented:

### User Registration and Authentication Flow

The `RegisterFlow.test.ts` implements a comprehensive user registration and authentication flow:

1. User registration with email and password
2. Login with created credentials
3. Password reset flow (forgot password)
4. Login with new password after reset
5. Validation of token-based authentication

### Match Simulation

The `MatchSimulation.test.ts` tests a complete auction match with four players:

1. User registration for all players
2. Lobby creation and joining
3. WebSocket connections for real-time communication
4. Player readiness and match start
5. Multiple auction rounds with different sellers
6. Bidding process and winner determination
7. Validation of inventory and money changes
8. Final leaderboard verification

### Multiple Matches

The `MultipleMatches.test.ts` validates the system's ability to handle multiple concurrent matches:

1. Creation of multiple lobbies
2. User registration and joining for all players
3. Independent match progression
4. Verification of isolated game states
5. Correct completion of all matches

## MailHog Integration

A crucial part of the E2E testing is validating the forgot password flow, which requires testing email delivery. For
this purpose, [MailHog](https://github.com/mailhog/MailHog) is integrated into the testing environment.

### What is MailHog?

MailHog is an email testing tool that creates a local SMTP server and web UI for testing email sending in development
environments. It captures all outgoing emails without actually delivering them to real recipients.

### How MailHog is Used in Testing

In the `RegisterFlow.test.ts` file, MailHog is used to:

1. Capture the password reset email sent when a user initiates the forgot password flow
2. Retrieve the email using MailHog's API
3. Extract the password reset token from the email content
4. Use the token to complete the password reset process
5. Verify the user can log in with the new password

This approach allows for complete end-to-end testing of the password reset flow without requiring actual email delivery,
making tests reliable and reproducible.

### Implementation Details

The test suite includes a custom `retrieveResetTokenForUser` function that:

1. Queries the MailHog API for emails sent to a specific address
2. Parses the email content to extract the reset token
3. Returns the token for use in the password reset API call

## Running E2E Tests

The E2E tests are designed to run in an isolated environment. A custom shell script (`run-tests.sh`) orchestrates the
test execution:

1. Starts all required services using Docker Compose
2. Runs the Jest test suite
3. Tears down all containers and volumes after tests complete

::: warning
The E2E test are long-running and can take several minutes to complete.
This is because each round must wait for the auction timer to expire, simulating real user interactions.
:::
> 