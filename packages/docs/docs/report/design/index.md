# Design Overview

This section presents the logical/abstract contribution of the project,
focusing on the high-level design choices made for the AuctiOn platform.
We consider the system's structure, behavior, and the interactions between its core components,
emphasizing the rationale behind these decisions.

## Domain-Driven Design

The fundamental design of the system was driven by the principles of **Domain-Driven Design (DDD)**,
specifically the concept of **Bounded Contexts**.

**Rationale:**

* **Complexity Management:** Online multiplayer games, even seemingly simple ones like auctions,
  involve distinct areas of concern (e.g., user accounts, lobby management, game state...).
  A monolithic approach could lead to a tightly coupled codebase, making it difficult to understand,
  maintain, and evolve specific functionalities independently.
* **Scalability:** Different parts of the system have varying load requirements.
  For instance, the real-time auction component might experience a significantly higher load during active games
  than the user registration process.
  Microservices allow scaling individual components (e.g., the Game service) independently based on demand,
  optimizing resource utilization.
* **Independent Testability:** Changes to one functional area (e.g., changing the game rules)
  can be developed, tested independently within its corresponding microservice.

**Alternatives Considered:**

A traditional **monolithic architecture** was considered initially.
However, given the real-time requirements, the need for clear separation of concerns
(like authentication vs. active game logic), and the desire for independent scalability of the core auction logic,
it was deemed less suitable.