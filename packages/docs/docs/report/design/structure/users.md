# User Context

## Overview

The User Context is designed as an independent microservice responsible for
managing user profile data and related operations.
It is designed to provide a clean separation between authentication credentials and user metadata,
supporting flexibility and scalability as the system evolves.

## Main Entities

- **User**: Represents the profile information of a user in the system.
    - **ID**: Unique identifier for the user. It should be used as the source of truth for all
      user-related operations in the system.
    - **Name**: The display name of the user.
    - **Email**: The user's email address (unique).

## Components

The User Context is organized into the following components:

- **Controller**: Handles external requests and responses, validates input, and delegates to the service layer.
- **User Service**: Encapsulates business logic for user management,
  orchestrating operations across repository.
- **User Repository**: Abstracts persistence and retrieval of users from the database.

## UML Class Diagram

![User UML](../../images/UserUML.svg "User UML diagram")
