# 08: Design a Grocery Store System

## Core Idea
Model a grocery store as a `GroceryStoreSystem` facade coordinating `Catalog` (static product data), `Inventory` (dynamic stock), and `Checkout`, with discounts split into **applicability criteria** and **calculation strategy** for maximum extensibility.

## Design Framework / Approach
Separate static product metadata (`Catalog`) from dynamic stock levels (`Inventory`). Decouple discount *applicability* (`DiscountCriteria`) from discount *calculation* (`DiscountCalculationStrategy`) using the Strategy Pattern, and layer more complex logic with the Composite and Decorator patterns.

## Key Concepts & Components
- **Item**: name, barcode, category, price — a data container.
- **Catalog**: `Map<String, Item>` keyed by barcode (`updateItem`, `removeItem`, `getItem`).
- **Inventory**: `Map<String, Integer>` stock (`addStock`, `reduceStock`, `getStock`).
- **DiscountCriteria** (interface): `ItemBasedCriteria`, `CategoryBasedCriteria`; extended by `CompositeCriteria` for AND/OR combinations.
- **DiscountCalculationStrategy** (interface): `AmountBasedStrategy`, `PercentageBasedStrategy`.
- **DiscountCampaign**: composes one criteria + one calculation strategy (`isApplicable`, `calculateDiscount`).
- **OrderItem**: item + quantity; `calculatePrice`, `calculatePriceWithDiscount`.
- **Order**: items + `appliedDiscounts` map; `calculateSubtotal`, `calculateTotal`, `calculateChange`.
- **Checkout**: orchestrates order building and picks the *highest* applicable discount per item.
- **GroceryStoreSystem**: facade mapping requirements to methods.

## Trade-offs & Anti-patterns
- **Merging Catalog and Inventory**: mixing slow-changing metadata with fast-changing stock violates SRP — keep separate.
- **Hardcoding discount logic**: not extensible — separate criteria from calculation.
- **Single discount only**: choose the highest discount when multiple apply; support composite criteria for complex rules.
- **Subclass explosion for styles/discounts**: use Decorator (`FixedDiscountDecorator`, `PercentageDiscountDecorator`) to layer sequentially.

## Key Takeaways
1. Split "does this discount apply?" from "how much is discounted?" for clean, composable promotions.
2. When multiple discounts apply to one item, automatically select the highest.
3. Layer sequential discounts with Decorator and combine rules with Composite for tiered/BOGO campaigns.

## Connects To
- **05 Design a Unix File Search System**: Composite Pattern source.
- **03 Design a Parking Lot**: Strategy Pattern source.
- **02 OOP Fundamentals**: SRP and Open/Closed in extensible discounts.
