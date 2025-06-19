# Requirements Analysis

## Implicit hypotheses

* Users need to be authenticated to perform any action.
* Any user can join only one game at a time. So if a user is already in a game,
  they cannot join another one until they leave the current game.
* Each account can only be associated with one email address.
* Joining a lobby and connecting to a game are two different actions:
    - Joining a lobby means getting permission to participate in a game without actively playing yet.
    - Connecting means actively participating in the game after joining.

  > To illustrate: Joining a lobby is like acquiring a ticket to a party—you have permission to attend.
  Connecting is like physically entering the party venue. Disconnecting is temporarily stepping outside,
  but you still have your ticket. Leaving the lobby is surrendering your ticket completely,
  which means you can no longer enter the venue at all.

## Non-functional requirements

* The system should be able to scale to accommodate more users and games.
* Handle multiple concurrent users and games.
* Handle real-time updates and notifications.
* Handle network failures and recover gracefully.
* Data consistency and integrity across multiple services.
* Handle user authentication and authorization securely.
* The Auction timer should be consistent across all players.

## Glossary

* **Seller**: The player who is currently selling items during an auction round. Each auction has one seller who
  presents items for bidding.

* **Buyer**: Any player participating in an auction who can place bids on the items being sold by the seller.

* **Lobby Admin/Lobby Creator**: These terms are synonymous and refer to the user who created the lobby. The lobby admin
  has special privileges including the ability to kick players from the lobby and delete the entire lobby.

* **Leaving vs Disconnecting**:
  - **Leaving** means permanently exiting the lobby. Once a player leaves, they lose their membership and cannot
    reconnect to that lobby anymore.
  - **Disconnecting** is a temporary separation from the lobby due to network issues or client closure. Disconnected
    players can always reconnect to the lobby as they remain members.

* **Join vs Connect**:
  - **Join** means becoming a member of a lobby, which grants permission to connect to that lobby multiple times.
  - **Connect** means establishing an active real-time connection to a lobby you have already joined.

* **Auction**: A single round of the game where one player acts as the seller, presenting items for sale, while other
  players act as buyers and can place bids on those items.

* **Game**: A complete gaming session consisting of one or more auction turns, where players take turns being the seller
  until the game concludes.