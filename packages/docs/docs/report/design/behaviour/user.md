# User Service: Behaviour

## User Profile Workflow

- Create: New user profile is created.
- Update: Profile data is updated.
- Fetch: Profile data is retrieved.

The user entity is mostly stateless, with operations corresponding to CRUD actions.
These operations are meant to be called only by other services, not directly by the client.

A simple workflow is enough for user profile management, as the Auth Service  
handles all sensitive authentication logic.
Future updates may include more complex user-related features,
like friendships or profile pictures.