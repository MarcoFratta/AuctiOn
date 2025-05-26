# Usage Examples

*Show how to use the produced software artifacts. Ideally, there should be at least one example for each scenario
proposed in the Goal & Requirements section.*

*Example Scenario 1: Joining and Playing a Game*

1. **Register/Login:** (Show API call examples using `curl` or a client snippet)
   ```bash
   # Login (assuming user exists)
   curl -X POST http://localhost:3000/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "user@example.com", "password": "password123"}'
   # Obtain JWT token from response
   ```
2. **List Lobbies:**
   ```bash
   curl http://localhost:3000/lobbies -H "Authorization: Bearer <your-jwt-token>"
   ```
3. **Join Lobby:**
   ```bash
   curl -X POST http://localhost:3000/lobbies/<lobby-id>/join \
        -H "Authorization: Bearer <your-jwt-token>"
   ```
4. **Connect WebSocket:** (Show client-side JavaScript snippet)
   ```javascript
   // Use the token obtained from login
   const socket = io('http://localhost:3000/auction', { // Adjust URL if needed
     auth: { token: 'your-jwt-token' }
   });

   socket.on('connect', () => console.log('Connected!'));
   socket.on('auction', (data) => console.log('Auction State:', data));
   // ... other event listeners
   ```
5. **Place Bid:** (Show client-side WebSocket emit)
   ```javascript
   socket.emit('bid', {
     type: 'bid',
     bid: { amount: 25, auctionId: 'current-auction-id' }
   });
   ```
6. **Create Sale:** (Show client-side WebSocket emit)
    ```javascript
   socket.emit('sell', {
     type: 'sell',
     sale: { items: { circle: 2, square: 1 } } // Example items
   });
   ```

*Example Scenario 2: Creating a Lobby*
*(Show API calls for creating a lobby)*

*Refer to Game Rules:*

* *For understanding the game flow these examples represent, see the [Game Rules](/game-rules).* 