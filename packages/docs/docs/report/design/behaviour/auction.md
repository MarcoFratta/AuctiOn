# Auction Service: Behaviour

## Overview

The Auction Service orchestrates the real-time auction gameplay,
starting from handling player connections, consuming lobby events,
and managing the full lifecycle of an auction session.
It is responsible for enforcing game rules, coordinating player actions,
and ensuring robust handling of disconnections and edge cases.

## Service Lifecycle

1. **Connection Handling**
    - The service accepts player connections.
    - Each player must be connected to participate in the auction.
    - The service tracks the connection status of each player throughout the game.

2. **Lobby Event Consumption**
    - The Auction Service consumes events from the Lobby Service, such as:
        - `lobby-started`: Triggers the start of the auction game.
        - `lobby-deleted`: Forces the auction to end and disconnects all players.
        - `player-joined`: Updates the player list.
        - `player-left`: Updates the player list and disconnect player.
        - `player-info` Updates player readiness or status.

3. **Auction Start and Player Actions**
    - When the auction starts (on `lobby-started`), the service transitions to the gameplay phase.
      Players can now interact with the auction:
        - **Sell**: Only the current seller (one per round) can offer items for sale.
        - **Bid**: Only non-seller players can place bids, and only if there is an active sale.
    - The service enforces these rules, rejecting invalid actions.

4. **Round and Turn Management**
    - Each round consists of a selling phase (waiting for the seller to offer items) and a bidding phase
      (other players place bids within a time window).
    - When the timer expires or a winning bid is placed, the round ends. The seller role rotates to
      the next player.
    - There is a waiting period between rounds, as the new seller prepares to sell items.
    - After a specified number of rounds, the auction ends.
      All players are automatically disconnected and receive the final results.

## Disconnection Handling

- **Seller Disconnection**: If the current seller disconnects, the game tolerates this and waits
  for the seller to reconnect. All players must wait for the seller to offer items.
  The admin can kick the seller if the wait is excessive, which skips the seller for that round and passes
  the role to the next player (the round does not advance).
- **Next Seller Disconnection**: If a player disconnects before their turn and is the next seller,
  they are automatically skipped if not reconnected by the time their turn arrives.
- **Left Players**: Kicked players or players who left the auction,
  are removed from the game and cannot reconnect. (See [Lobby Rules](lobby.md).)

## Player States

- **Connected**: Player is connected and participating.
- **Disconnected**: Player has lost connection.
- **Selling**: Player is the current seller.
- **Bidding**: Player is bidding in the current round.
- **Kicked/left**: Player has been removed from the game and cannot reconnect.

## State Diagram

![Auction Service Behavior](../../images/AuctionBehavior.svg "Auction service Behavior")

Disconnection handling is crucial for the game logic; particularly when the seller leaves the game.
In such cases, other players would wait indefinitely for a sale that will never arrive,
which is why it's important for the admin to always be connected in the lobby.
If the creator is not connected and the seller does not reconnect,
the other players will remain in a waiting state.

To address **stuck** auctions, players can always leave the game entirely (not just disconnect)
and join another lobby. See the section below for more details.

## Stuck Auctions

How can an auction become stuck? This is one possible scenario:

1. The round ends and the next seller is connected.
2. The next seller becomes the actual seller of the new round.
3. The next seller disconnects before placing any item for sale.
4. The lobby creator (admin) disconnects.

Now the auction is **stuck**, since:

- The current seller is disconnected (suppose it will not reconnect).
- The creator is the only one that can kick the seller and make the game progress, but
  the creator is disconnected.

The auction service does not explicitly handle this scenario, as there is no definitive way to
resolve it automatically. The seller may eventually reconnect and resume the game,
just as the lobby creator can reconnect and remove the seller if necessary.
In the meantime, players have the option to either leave the game or wait for the seller/creator to return.
However, to maintain fairness, the system enforces a rule during round transitions:
> If no other players are connected besides the previous seller, the game ends automatically.

This prevents situations where a player could act as the seller in consecutive rounds,
ensuring a balanced gameplay experience even in the face of connectivity issues.

## Notes

- If the lobby creator disconnects, the auction does not end. The auction will be deleted only if the
  creator leaves the auction.
- Knowing the state (connected / not-connected) of the players is crucial
  for the other players. This information will also affect the next-seller selection.

