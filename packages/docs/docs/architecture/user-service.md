# User Service

The User Service manages all user-related data and operations in the AuctiOn platform.

## Responsibilities

- Store and manage user profiles
- Handle user registration
- Update user information
- Retrieve user details
- Manage user preferences

## User Data Model

The service maintains the following core user information:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed
  createdAt: Date;
  updatedAt: Date;
  // Additional profile fields
}
```

## API Endpoints

| Endpoint     | Method | Description                    |
|--------------|--------|--------------------------------|
| `/users`     | GET    | Get list of users (admin only) |
| `/users/:id` | GET    | Get user details               |
| `/users`     | POST   | Create new user                |
| `/users/:id` | PUT    | Update user information        |
| `/users/:id` | DELETE | Delete user account            |

## Integration Points

The User Service primarily interacts with:

- **Auth Service**: For user creation during registration and verification of user existence
- **Lobby Service**: To provide user details for lobby participants
- **Auction Service**: To associate auction actions with specific users 