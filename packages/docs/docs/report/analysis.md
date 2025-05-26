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