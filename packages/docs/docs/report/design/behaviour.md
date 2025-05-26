# Design: Behaviour

*How should each key entity/component behave?*

*Describe the lifecycle or key states of major components:*

* **Lobby Service:**
    * *e.g., States: Waiting, Starting, In Progress. Transitions based on player actions (join, leave, ready) and
      creator actions (start).*
    * *(UML State Diagram for Lobby)*
      ```mermaid
      stateDiagram-v2
          [*] --> Waiting: Lobby Created
          Waiting --> Waiting: Player Joins/Leaves
          Waiting --> Starting: All Ready & Start Triggered
          Starting --> InProgress: Auction Service Confirms Start
          InProgress --> [*]: Game Ends / Lobby Deleted
          Waiting --> [*]: Lobby Deleted
          Starting --> Waiting: Start Aborted
      ```
* **Auction Service (Game State):**
    * *e.g., States: WaitingForPlayers, Selling, Bidding, RoundEnd, AuctionEnd. Transitions based on timers, player
      actions (sell, bid), and events (lobby-started).*
    * *(UML State or Activity Diagram for Auction Round)*
* **Player within Auction:**
    * *e.g., States: Connected, Disconnected, Selling, Bidding.*

**Rationale:**

*Explain why these state models were chosen to manage the game flow and service lifecycles.* 