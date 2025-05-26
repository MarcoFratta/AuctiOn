# Lobby Service

The Lobby Service manages game lobbies where players gather before starting an auction game.

## Responsibilities

- Create and delete lobbies
- Manage player joining and leaving
- Handle lobby settings and configuration
- Broadcast lobby events to other services
- Track player readiness status

## Lobby Data Model

```typescript
interface Lobby {
  lobbyId: string;
  creatorId: string;
  players: Player[];
  settings: GameSettings;
  status: 'waiting' | 'starting' | 'in_progress';
  createdAt: Date;
}

interface Player {
  id: string;
  username: string;
  status: 'waiting' | 'ready' | 'disconnected';
}
```

## Event Production

The Lobby Service produces the following Kafka events that are consumed by the Auction Service:

| Event           | Description                | Schema                    |
|-----------------|----------------------------|---------------------------|
| `lobby-created` | New lobby has been created | `lobbyCreatedEventSchema` |
| `lobby-joined`  | Player joined a lobby      | `lobbyJoinedEventSchema`  |
| `lobby-left`    | Player left a lobby        | `lobbyLeftEventSchema`    |
| `lobby-started` | Game has been started      | `lobbyStartedEventSchema` |
| `lobby-deleted` | Lobby has been deleted     | `lobbyDeletedEventSchema` |
| `player-status` | Player changed status      | `playerStatusEventSchema` |

## API Endpoints

| Endpoint              | Method | Description                   |
|-----------------------|--------|-------------------------------|
| `/lobbies`            | GET    | Get list of available lobbies |
| `/lobbies`            | POST   | Create a new lobby            |
| `/lobbies/:id`        | GET    | Get lobby details             |
| `/lobbies/:id`        | DELETE | Delete a lobby                |
| `/lobbies/:id/join`   | POST   | Join a lobby                  |
| `/lobbies/:id/leave`  | POST   | Leave a lobby                 |
| `/lobbies/:id/start`  | POST   | Start the game                |
| `/lobbies/:id/status` | POST   | Update player status          