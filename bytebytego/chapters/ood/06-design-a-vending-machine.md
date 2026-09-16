# 06: Design a Vending Machine

## Core Idea
Model a vending machine as a lightweight facade delegating to `InventoryManager` and `PaymentProcessor`, and enforce the purchase sequence with the State Pattern (`NoMoneyInsertedState` → `MoneyInsertedState` → `DispenseState`).

## Design Framework / Approach
Keep `Product` (static properties) separate from dynamic stock tracked by `Rack` + `InventoryManager`. Use the **Facade Pattern** for a single interface, the **Composite Pattern** for hierarchical inventory, and the **State Pattern** to prevent invalid actions like dispensing before payment.

## Key Concepts & Components
- **Product**: code, description, `unitPrice` (use `BigDecimal` or integer cents, never `float`/`double`).
- **Rack**: a physical slot holding one product type + count; composition of racks forms inventory.
- **InventoryManager**: `getProductInRack`, `dispenseProductFromRack` (decrements), `updateRack`, `getRack`; backed by `HashMap<String, Rack>`.
- **PaymentProcessor**: `addBalance`, `charge`, `returnChange` — encapsulates financial logic.
- **Transaction**: data structure tracking selected product, rack, and cost during a purchase.
- **VendingMachine**: facade with `insertMoney`, `chooseProduct`, `confirmTransaction`, `cancelTransaction`; holds `currentState`.
- **VendingMachineState** (interface) + `NoMoneyInsertedState`, `MoneyInsertedState`, `DispenseState`: each enforces which actions are legal.

## Trade-offs & Anti-patterns
- **"God object"**: stuffing all logic into `VendingMachine` — delegate to keep the facade thin.
- **Modeling stock in Product**: mixing dynamic inventory with static properties violates SRP — use `InventoryManager`.
- **Conditional state logic**: grows unmanageably as states increase — encapsulate each state in its own class.
- **Overpay/out-of-order actions**: state pattern guarantees Insert Money → Select Product → Dispense.

## Key Takeaways
1. Reserve the "get" prefix for getters; name behavior methods explicitly (e.g., `dispenseProductFromRack`, `getProductInRack`).
2. Use the State Pattern to enforce task sequences and per-state user prompts.
3. After core functionality, emphasize validation and error handling for systems where misuse causes loss.

## Connects To
- **03 Design a Parking Lot**: Facade pattern source.
- **02 OOP Fundamentals**: SRP and State pattern for behavior modeling.
- **07 Design an Elevator System**: state/behavior-focused modeling rather than data modeling.
