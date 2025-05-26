# WebSocket Events

The AuctiOn platform uses Socket.IO for real-time communication between clients and the Auction Service.
This page documents the available WebSocket events and their data structures.

## Connection

To connect to the WebSocket server, clients must first authenticate and then establish
a Socket.IO connection with the authentication token.

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost/auction', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## State Reconstruction

Several message types in the AuctiOn platform include an `old` boolean parameter.
This parameter plays a crucial role in state reconstruction when players reconnect to an ongoing auction.

### Purpose of the `old` Parameter

- **When `old: false` (default)**: Indicates a real-time event that has just occurred.
- **When `old: true`**: Indicates a historical event being replayed to a newly
  reconnected client to help reconstruct the current state.

### How State Reconstruction Works

1. When a player reconnects, the server sends a sequence of messages with `old: true`
   to rebuild the client's state.
2. These messages represent the current state of the auction system, including:
    - Which players are currently connected (`player-connected`)
    - Current player information (`player-info`)
    - Current player statuses (`player-status`)
    - Current auction state (`auction`)
4. After all historical messages are sent, new real-time events will follow
   with `old: false` (or omitted, as false is the default).

### Message Types Using the `old` Parameter

The following message types can include the `old` parameter:

- `player-connected`: Indicates players currently in the auction
- `player-join`: Indicates players who have joined the auction
- `player-info`: Provides player information like username and status

### Implementation Considerations

- Client implementations should check the `old` parameter on relevant messages and
  handle them appropriately.
- Historical messages (`old: true`) should update the client's state but typically
  shouldn't trigger UI notifications like toast messages or sound effects.
- User interface elements that display the current auction state should be updated regardless of the `old`
  parameter value.

## System Events

These events handle core system functionality like time synchronization and connection management.

### `time-sync`

Synchronizes the client's clock with the server's clock to ensure consistent timing across all clients.

**Client to Server**:

```typescript
// Event emission with acknowledgement callback
socket.emit('time-sync', {}, (response) => {
  // Process server response
});
```

**Server to Client (via acknowledgement)**:

```typescript
// Response payload
{
  serverTime: number // Timestamp from server in milliseconds (Date.now())
}
```

**Field Details**:

- `serverTime`: The current server timestamp in milliseconds since the Unix epoch. This value
  is used by clients to calculate the time offset between their local clock and the server's clock.

**Implementation Notes**:

- Clients should record the time before sending the request and after receiving the response
  to calculate network latency.
- The recommended formula for calculating the time offset is:
  ```
  offset = serverTime - (requestTime + (responseTime - requestTime)/2)
  ```
- Clients should periodically resynchronize (e.g., every 60 seconds) to account for clock drift.
- The synchronized time can be calculated as `clientTime + offset`.

### `player-connected`

Notifies when a player connects to the auction.

```typescript
// Event payload
{
  type: 'player-connected',
  playerId: string,
  old: boolean // Indicates if this is a historical event
}
```

### `player-disconnected`

Notifies when a player disconnects from the auction.

```typescript
// Event payload
{
  type: 'player-disconnected',
  playerId: string
}
```

### `player-join`

Notifies when a player joins the auction. This is distinct from connection in that
it represents a player actively joining the auction game rather than just connecting to the server.

```typescript
// Event payload
{
  type: 'player-join',
  playerId: string,
  username: string,
  old: boolean // Indicates if this is a historical event
}
```

### `player-leave`

Notifies when a player leaves the auction.

```typescript
// Event payload
{
  type: 'player-leave',
  playerId: string
}
```

### `player-status`

Updates a player's status in the auction.

```typescript
// Event payload
{
  type: 'player-status',
  playerId: string,
  status: string // Current player status
}
```

### `player-info`

Provides detailed information about a player.

```typescript
// Event payload
{
  type: 'player-info',
  playerId: string,
  playerInfo: {
    username: string,
    status: string
  },
  old: boolean // Indicates if this is a historical event
}
```

### `timer-start`

Notifies when a timer starts for an auction phase.

```typescript
// Event payload
{
  type: 'timer-start',
  time: string // ISO datetime string
}
```

## Client to Server

These are events that clients can emit to the server:

### `bid`

Place a bid on the current auction.

```typescript
// Event payload
{
  type: 'bid',
  bid: {
    amount: number,    // The bid amount in game currency
    auctionId: string  // Identifier of the auction
  }
}
```

**Field Details**:

- `amount`: Must be higher than the current highest bid and within the player's available funds.
- `auctionId`: Must match the ID of the currently active auction.

### `sell`

Create a sale as the current seller.

```typescript
// Event payload
{
  type: 'sell',
  sale: {
    items: [
      {
        item: string,     // Item type identifier
        quantity: number  // Quantity to sell (must be ≥ 0)
      }
    ]
  }
}
```

**Field Details**:

- Each item quantity must be non-negative and within the seller's available inventory.
- The seller can only create a sale during the "selling" phase of the auction round.
- The total weight of the sale affects the bidding dynamics.

## Server to Client

These are events that the server emits to clients:

### `auction`

Provides the current auction state.

```typescript
// Event payload
{
  type: 'auction',
  auction: {
    id: string,
    maxPlayers: number,
    maxRound: number,
    startAmount: number,
    startInventory: {
      items: [
        {
          item: string,
          quantity: number
        }
      ]
    },
    creatorId: string,
    currentRound: number,    // Current round number
    sellerQueue: string[],   // Queue of player IDs who will be sellers
    currentSale: {           // Current sale information (if available)
      info: {
        weight: number
      },
      sellerId: string,
      endTimestamp: string   // ISO datetime
    },
    currentBid: {            // Current highest bid (if available)
      playerId: string,
      amount: number,
      round: number,
      timestamp: string      // ISO datetime
    },
    startTimestamp: string,  // ISO datetime
    bidTime: number          // Time allowed for bidding in milliseconds
  },
  playerInfo: {
    money: number,           // Player's current funds
    inventory: {
      items: [
        {
          item: string,
          quantity: number
        }
      ]
    }
  }
}
```

**Field Details**:

- The auction state contains comprehensive information about the current auction, including configuration,
  current round, seller queue, and timing information.
- `sellerQueue`: An array of player IDs representing the order in which players will become sellers.
- `bidTime`: The time allowed for bidding in milliseconds, which should be used with the synchronized time to display
  consistent countdowns.

### `auction-start`

Notifies when an auction starts. Contains the same payload structure as the `auction`
event but with type `auction-start`.

### `new-bid`

Notifies about a new bid.

```typescript
// Event payload
{
  type: 'new-bid',
  bid: {
    playerId: string,   // ID of the bidding player
    amount: number,     // Bid amount
    round: number,      // Round number
    timestamp: string   // ISO datetime
  }
}
```

**Field Details**:

- `timestamp`: Server-side timestamp in ISO format that can be used for sorting
  and displaying when the bid was placed.
- `round`: The auction round in which this bid was placed.

### `new-sale`

Notifies about a new sale.

```typescript
// Event payload
{
  type: 'new-sale',
  sale: {
    info: {
      weight: number    // Total weight of the items being sold
    },
    sellerId: string,   // ID of the seller
    endTimestamp: string // ISO datetime (optional)
  }
}
```

**Field Details**:

- `weight`: The calculated weight of the sale
- `endTimestamp`: Optional ISO datetime string indicating when the sale period ends.

### `round-end`

Notifies about the end of a round.

```typescript
// Event payload
{
  type: 'round-end',
  auction: {
    // Auction state (same as 'auction' event)
  },
  playerInfo: {
    // Player info (same as 'auction' event)
  }
}
```

### `auction-end`

Notifies about the end of the entire auction.

```typescript
// Event payload
{
  type: 'auction-end',
  leaderboard: {
    leaderboard: [
      {
        id: string,
        inventory: {
          items: [
            {
              item: string,
              quantity: number
            }
          ]
        },
        money: number,          // Final balance
        position: number        // Final ranking (1 = first place)
      }
    ],
    removed: [                  // Players who were removed from the auction
      {
        id: string,
        inventory: { /* same as above */ },
        money: number
      }
    ]
  }
}
```

**Field Details**:

- `leaderboard`: Array of players ranked by their final position.
- `removed`: Array of players who were removed from the auction (e.g., due
  to disconnection or rule violations).

### `auction-deleted`

Notifies when an auction is deleted.

```typescript
// Event payload
{
  type: 'auction-deleted'
}
```

### `error`

Notifies about errors.

```typescript
// Event payload
{
  type: 'error',
  message: string     // Human-readable error message
}
```
