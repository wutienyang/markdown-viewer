# 03: Design a Parking Lot

## Core Idea
Model a parking lot as a facade (`ParkingLot`) coordinating allocation (`ParkingManager`) and pricing (`FareCalculator`), with size-based abstraction (`VehicleSize`) instead of vehicle-type semantics.

## Design Framework / Approach
Separate concerns across five objects: `Vehicle` and `ParkingSpot` as physical entities, `Ticket` as an immutable session record, `ParkingManager` for allocation, and `ParkingLot` as a lightweight facade. Use the **Strategy Pattern** for interchangeable fare rules and the **Facade Pattern** for a single client entry point.

## Key Concepts & Components
- **Vehicle** (interface): `getLicensePlate()` + `getSize()` returning a `VehicleSize` enum (SMALL/MEDIUM/LARGE); concrete `Motorcycle`, `Car`, `Truck`.
- **ParkingSpot** (interface): state-only (`isAvailable`, `occupy`, `vacate`, `getSize`); concrete `CompactSpot`, `RegularSpot`, `OversizedSpot`.
- **ParkingManager**: `parkVehicle`/`unparkVehicle`; uses `availableSpots` (Map by size) and `vehicleToSpotMap` for O(1) best-fit allocation.
- **Ticket**: immutable record of ticketId, vehicle, spot, entry/exit time; computes duration.
- **FareStrategy** (interface): `BaseFareStrategy` (size × duration) and `PeakHoursFareStrategy` (1.5× at peak); orchestrated by `FareCalculator` holding an ordered `List<FareStrategy>`.
- **ParkingLot**: facade coordinating entry (`enterVehicle`) and exit (`leaveVehicle`).

## Trade-offs & Anti-patterns
- **`getType()` over `getSize()`**: ties logic to concrete names, forcing new cases per type — abstract by size so scooters/ vans just map to a size.
- **Strings/ints for size**: typo-prone and type-unsafe — use an enum.
- **`Set` for strategies**: loses order; base must run before peak, so use `List`.
- **Embedding allocation/fare in `ParkingLot`**: overloads a single class; delegate to keep the facade lightweight.

## Key Takeaways
1. Model by *size* not *type* so new vehicle kinds slot in without logic changes.
2. Use bidirectional maps (`vehicleToSpotMap` + `spotToVehicleMap`) for O(1) lookups in both directions.
3. Add new spot types (e.g., `HandicappedSpot`) by implementing the `ParkingSpot` interface — Open/Closed in action.

## Connects To
- **02 OOP Fundamentals**: Strategy/Facade patterns realize OCP and SRP.
- **06 Design a Vending Machine**: same facade + strategy/state pattern structure.
- **08 Design a Grocery Store System**: strategy pattern reused for discount calculation.
