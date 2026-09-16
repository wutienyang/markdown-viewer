# 10: Design a Blackjack Game

## Core Idea
Model Blackjack with immutable `Card`/`Rank`/`Suit`, a `Deck`, a `Hand` that precomputes all possible Ace-adjusted totals, and a `BlackJackGame` orchestrator that delegates decisions via the Strategy Pattern (`PlayerDecisionLogic`).

## Design Framework / Approach
Keep `Card` data-only and immutable; let `Hand` own value calculation (Aces as 1 or 11). Use an interface `Player` with `RealPlayer` (bets/balance) and `DealerPlayer` (hits until ≥17). In the deep dive, decouple decision-making so `BlackJackGame` coordinates turns while each player decides independently.

## Key Concepts & Components
- **Card**: immutable rank + suit; `getRankValues()` returns an array (Ace → [1, 11]).
- **Rank / Suit** (enums): type-safe; face cards = 10, Ace = 1 or 11.
- **Deck**: 52 cards in `List<Card>`; `shuffle`, `draw`, `reset`; tracks `nextCardIndex` for O(1) draw (no list removal).
- **Hand**: `List<Card>` + `SortedSet<Integer> possibleValues` (TreeSet); `addCard` computes all totals; `isBust()` checks if the lowest value > 21.
- **Player** (interface): `bet`, `payout`, `loseBet`, `returnBet`, `isBust`, `getHand`.
- **RealPlayer**: name, bet, balance; validates bet ≤ balance; delegates cards to `Hand`.
- **DealerPlayer**: no betting; empty bet methods; hits until 17.
- **BlackJackGame**: `dealInitialCards`, `bet`, `hit`, `stand`, `getNextEligiblePlayer`, `checkGameEndCondition`.
- **PlayerDecisionLogic** (interface): `RealPlayerDecisionLogic` (<16 hit) and `DealerDecisionLogic` (<17 hit) — Strategy Pattern.

## Trade-offs & Anti-patterns
- **Strings/ints for rank/suit**: need validation and are error-prone — use enums.
- **Recalculating Ace values dynamically**: recompute per evaluation — precompute all possible totals upfront.
- **List for hand values**: O(n) to find the minimum — use a `TreeSet` for O(1) min access.
- **Hardcoded `dealerTurn()` in `BlackJackGame`**: couples rules to the game class — extract `PlayerDecisionLogic` to swap strategies.

## Key Takeaways
1. Precompute all possible hand values (Ace as 1 and 11) instead of adjusting after a bust.
2. Use `nextCardIndex` instead of removing drawn cards to keep drawing O(1).
3. Extract player/dealer decision logic behind `PlayerDecisionLogic` so rules are swappable without touching the orchestrator.

## Connects To
- **09 Design a Tic Tac Toe Game**: turn-based coordination and delegation.
- **03 Design a Parking Lot**: Strategy Pattern source.
- **02 OOP Fundamentals**: immutability, enums, and interface-based polymorphism.
