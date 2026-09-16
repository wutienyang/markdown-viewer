# 09: Design a Tic Tac Toe Game

## Core Idea
Model the game with a `Game` coordinator delegating grid rules to `Board`, ratings to `ScoreTracker`, and move history to `MoveHistory`, keeping `Player` stateless; add undo via the Memento Pattern.

## Design Framework / Approach
Delegate each responsibility to a single owner (SRP): `Board` owns grid rules and win-checking, `ScoreTracker` owns ratings (contextual, not inherent to a player), and `Game` coordinates turns using a state-machine-style enum (`GameCondition`).

## Key Concepts & Components
- **Game**: `makeMove` (validates turn, occupancy, and status), `getGameStatus`, `getCurrentPlayer`; updates `ScoreTracker` on end.
- **Board**: 3x3 `Player[][]`; `updateBoard`, `getWinner` (rows/columns/diagonals), `isFull`, `reset`.
- **Player**: stateless — name + symbol only (no win counts, no move logic).
- **Move**: row, column, player — bundles move data (also the Memento).
- **ScoreTracker**: `HashMap<Player, Integer>` ratings; `reportGameResult`, `getTopPlayers`, `getRank`.
- **MoveHistory**: `ArrayDeque<Move>` stack — the Caretaker for undo.
- **GameCondition**: enum for `IN_PROGRESS` / `ENDED`.

## Trade-offs & Anti-patterns
- **Overloading `Game`**: putting win-checking and ratings there bloats the class — delegate to `Board`/`ScoreTracker`.
- **Ratings in `Player`**: ratings are contextual and evolve across games — keep centralized in `ScoreTracker`.
- **Memento memory overhead**: storing full state per move is fine for small boards but a bottleneck for large game states.

## Key Takeaways
1. Keep `Player` stateless; ratings belong to a centralized tracker that can rank across a group.
2. Use a `Move` object (not separate params) to make move handling readable and to enable undo.
3. Implement undo with a LIFO stack of `Move` mementos, reverting the board and the current-player index.

## Connects To
- **10 Design a Blackjack Game**: turn-based game state machine and delegation.
- **02 OOP Fundamentals**: SRP drives class decomposition.
- **01 A Framework for the OOD Interview**: delegate-to-avoid-overload pattern.
