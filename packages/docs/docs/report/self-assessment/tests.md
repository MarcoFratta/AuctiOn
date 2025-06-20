# Testing

This section provides an overview of the testing strategy and implementation for the AuctiOn platform.

## Testing Strategy

The AuctiOn platform has been thoroughly tested using various testing methodologies:

1. **Unit Tests**: Each microservice has comprehensive unit tests for individual components, including services,
   controllers, and repositories.
2. **Integration Tests**: Tests that verify the interaction between different components within a microservice.
3. **End-to-End Tests**: Tests that verify the entire system's functionality from the user's perspective.

## Test Implementation

For each microservice, a comprehensive test suite has been developed:

- **Unit Tests**: Isolated tests for individual functions, services, and controllers
- **Integration Tests**: Tests that verify the interaction between different components within a microservice

To facilitate testing of external dependencies, the following tools were utilized:

- **TestContainers**: For Kafka testing, providing isolated Kafka instances during test execution
- **IoRedis Mock**: For Redis testing, simulating Redis functionality without requiring a live Redis instance
- **MongoDB Memory Server**: In-memory MongoDB server for database testing without external dependencies

This approach ensures tests can run in isolation without requiring external services to be running, making the test
suite more reliable and faster to execute.

## Test Coverage

The test coverage for each microservice is monitored using Jest's coverage reporting. The coverage reports provide
insights into the code quality and test completeness.

You can view the detailed coverage reports for each microservice in the [Coverage Report](./coverage) section.

## Code Quality Tools

To maintain high code quality standards, the following tools were implemented:

- **ESLint**: For static code analysis and identifying problematic patterns
- **Prettier**: For consistent code formatting across the entire codebase

## Continuous Integration Process

A robust CI/CD process was implemented using Git hooks to ensure code quality at every step:

1. **Pre-commit Hooks**:
    - **Conventional Commits**: Validates that commit messages follow the conventional commits format
    - **ESLint**: Runs linting checks on staged files, aborting the commit if issues are found
    - **Prettier**: Automatically formats staged files to ensure consistent code style
    - **Targeted Testing**: Runs tests based on the commit scope

2. **Commit Scope Strategy**:
    - Commit messages include a scope matching the packages in the monorepo
    - Tests are automatically run only for the affected package based on the commit scope
    - This approach ensures faster feedback cycles while maintaining code quality

This comprehensive approach to testing and quality assurance ensures that the AuctiOn platform remains robust,
maintainable, and free of regressions as development progresses.

## Testing Tools

The following tools and libraries were used for testing:

- **Jest**: Primary testing framework for unit and integration tests
- **Supertest**: HTTP assertions for API testing
- **MongoDB Memory Server**: In-memory MongoDB server for testing
- **Redis Memory Server**: In-memory Redis server for testing
- **Cypress**: End-to-end testing framework
