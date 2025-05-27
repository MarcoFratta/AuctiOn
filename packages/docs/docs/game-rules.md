# 🎮 AuctiOn Game Rules

> *A strategic auction game of bluffing, bidding, and resource management*

## 📜 Introduction

**AuctiOn** is a turn-based auction game where players strategically buy and sell items to accumulate as much virtual
currency as possible. Success requires careful inventory management, clever bidding strategies, effective bluffing, and
smart resource allocation.

### Game Items

| Item         | Weight | Set Bonus (3 items) |
|--------------|--------|---------------------|
| **Square**   | 1      | +10 coins           |
| **Circle**   | 3      | +30 coins           |
| **Triangle** | 5      | +50 coins           |

## 🎯 Objective & Game Setup

### Primary Goal

`Accumulate the most coins`

### Starting Resources

Each player begins with:

- **Initial inventory** of items (Squares, Triangles, Circles)
- **Starting coins**

Those parameters can be customized in the lobby settings before starting the game.

## ⚙️ Game Mechanics

### Turn Structure

The game progresses through a series of turns where players alternate roles:

1. One player acts as the`Seller`
2. All other players act as `Buyers`
3. After each round, roles rotate

### Selling Phase

**As the Seller:**

1. Select any number of items from your inventory to create a batch
2. Buyers do not know the specific items or quantities in your batch
3. Only the **total weight** of the batch (sum of item weights) is revealed to buyers

::: details 💡 Seller Strategy Tip
Consider creating batches with **mixed** item types that might confuse buyers about the true value.
For example, a batch with weight 5 could be one Triangle (weight 5) or five Squares (weight 1 each).
Also be careful not to create batches with all your items, otherwise you risk disqualification!
More details on disqualification in the **Item Management Rules** section below.
:::

### Bidding Phase

**As a Buyer:**

1. Evaluate the potential value of the batch based on its weight
2. Place a bid using coins. (this is not mandatory)
3. The highest bidder wins the entire batch and pays their bid amount to the seller

::: details 💡 Bidding Strategy Tip
Consider both the potential value of items AND your current **inventory** needs when bidding.
Sometimes it's worth overbidding to prevent another player from getting crucial items.
:::

### Bluffing & Strategic Elements

- **Sellers** can create misleading batches to drive up bids
- **Buyers** must decide how much to risk with limited information

::: details 💡 Advanced Strategy Tip
Pay close attention to other players' bidding patterns to identify when they might be desperate for certain items.
Players often bid higher when they need specific items to complete sets.
In the last round, for example, a player with a lot of items will desperately try to sell them,
trying to avoid being disqualified from being the player with most items.
:::

### ⚠️ Disqualification Rules

- You **MUST** end the game with at least one item

> Players with zero items are **DISQUALIFIED** from winning

- You **CANNOT** win if you finish with more items than any other player

> Having the most items **DISQUALIFIES** you from winning

::: details 💡 Important Balance Tip
**Balance your inventory!** Too many items will disqualify you, while too few risk elimination. Aim for the
second-highest item count among players.
:::

## 🏆 Victory Conditions

When all turns are completed:

1. Check if any player has been **disqualified**
2. Calculate your **Set Collection Bonus** (see below)
3. Add your bonus to your coin total
4. The player with the most coins who meets all item requirements `wins`

### Set Collection Bonus System

At the end of the game, you earn bonus coins for collecting complete sets of identical items:

- A 'set' consists of exactly **3 identical items**
- For each complete set, gain **10 × item weight** in bonus coins
- Incomplete sets provide **NO bonus**

#### Set Bonus Examples

```
⬜⬜⬜ = 3 Squares = +10 coins (10 × 1 weight)
🛆🛆🛆= 3 Triangles = +50 coins (10 × 5 weight)
⭕⭕⭕ = 3 Circles = +30 coins (10 × 3 weight)
```

::: details 💡 Set Collection Strategy
Focus on high-value sets like Triangles when possible. A single Triangle set (+50 coins) is worth more than collecting a
Square and Circle set combined (+40 coins)!
:::

## 🚀 Coming Soon Features

Future expansions to the AuctiOn game:

### 📈 Market Events

Dynamic economic changes that affect item values during gameplay.

::: details Feature Preview
Market events will periodically change item values
or provide temporary bonuses for holding specific combinations of items.
These events create opportunities for strategic planning and can dramatically shift the game's direction!
:::

### ⚡ Power-ups

Special abilities that provide tactical advantages during gameplay.

::: details Feature Preview
`Power-ups` will let you peek at batch contents,
block specific players from bidding, manipulate auction outcomes, and more.
Each power-up has a unique cost and timing, adding a new layer of strategy to your decision-making!
:::

### 👥 Friend System

Connect with other players for enhanced social gameplay.

::: details Feature Preview
The friend system will let you send requests, maintain a list of friends,
and invite friends to game lobbies.
You'll also be able to see when friends are online and track your gameplay history together!
:::
