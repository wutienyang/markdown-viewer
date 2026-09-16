# Chapter 8: Approaches to Data Modeling

## Core Idea
Data modeling is the blueprint that turns raw data into usable insight. The core choice is between a normalized relational model (integrity, but joins) and a denormalized dimensional model (fast analysis), plus three ways to organize a warehouse — Inmon's top-down CIF, Kimball's bottom-up data marts, or a hybrid — with the data vault as a resilient middle path.

## Frameworks Introduced
- **Relational Modeling**: tables/rows/columns with primary/foreign keys, normalized to 3NF.
  - When to use: OLTP source systems; capturing "how part of the business works."
  - How: ER diagram → normalization (1NF → 2NF → 3NF); track changes with history tables.
- **Dimensional Modeling (Kimball)**: facts (numeric measures) + dimensions (descriptive attributes), denormalized.
  - When to use: querying/reporting; capturing "how well the business is doing."
  - How: star schema (central fact table + dimension tables), surrogate keys, slowly changing dimensions.
- **Slowly Changing Dimensions (SCDs)**: Type 1 (overwrite), Type 2 (keep old + new versions), Type 3 (full new record per change).
  - When to use: Type 1 for trivial corrections; Type 2 to preserve history; Type 3 for complete audit.
- **Common Data Model (CDM)**: a standardized, industry-tailored schema so any source maps to a common language.
  - When to use: many source systems of the same type (e.g. multiple CRM vendors) feeding one DW.
  - How: customize a vendor/cloud prebuilt CDM rather than building from scratch.
- **Data Vault**: hubs (business entities) + links (relationships) + satellites (attributes over time).
  - When to use: large data volumes with complex relationships; sits between 3NF and star schema.
  - How: model each entity/relationship/attribute set as hub/link/satellite tables.

## Key Concepts
- **Primary key / foreign key / natural key / surrogate key**: unique identifier; cross-table reference; real-world unique field; artificial generated key.
- **Normal forms (1NF/2NF/3NF)**: single values + no repeating groups (1NF); all attributes depend on the full key (2NF); no transitive dependencies (3NF).
- **Conformed dimensions**: standardized dimensions consistent across fact tables (Kimball's integration mechanism).
- **CIF (Corporate Information Factory)**: Inmon's centralized atomic 3NF EDW that data marts depend on.
- **DW bus / information bus**: Kimball's conformed warehouse, a unified view over independent data marts.
- **EDW bus matrix**: Kimball's top-down planning blueprint of business processes and dimensions.

## Mental Models
- Think of relational modeling as "designing the city" and dimensional modeling as "designing the buildings."
- Think of Inmon's CIF as a hub-and-spoke: one central EDW feeding dependent data marts.
- Use the "~25% design up front" rule: both Inmon and Kimball sit far from waterfall and ad hoc alike.
- Report from the cube where possible — it is a semantic layer with concurrency, aggregation, and row-level security built in.

## Anti-patterns
- **Big-bang/waterfall warehouse**: Inmon never recommended it; build iteratively, data mart by data mart.
- **Natural keys as surrogate keys**: they leak sensitive info, cause duplication/format conflicts across systems.
- **Believing the methodology myths**: Kimball *is* enterprise-focused (EDW bus matrix); Inmon *does* allow star-schema data marts; the two are compatible and often hybridized.
- **Over-normalizing for analysis**: 3NF forces many joins and slows querying — that's when you need a dimensional model.

## Reference Tables
Kimball vs. Inmon:

| | Inmon (top-down) | Kimball (bottom-up) |
|---|---|---|
| Core | Normalized 3NF EDW (CIF) first | Dimensional data marts first |
| Data marts | Dependent on the CIF | Independent, subject-oriented |
| Integration | Central CIF (single version of truth) | Conformed dimensions + DW bus |
| EDW | Physical | Conformed (logical, no physical EDW) |
| End users | Passive; access via marts/cubes | Active participants |
| Driven by | Technology department | Business |

## Worked Example
**The 1NF repeating group.** A `Students` table with columns `Course1`, `Course2`, `Course3` violates 1NF. The fix: one row per student-course pairing (primary key `StudentID`), so each attribute holds a single value and no column repeats. This is the concrete, mechanical first step of normalization, and it's the reason a "spreadsheet-style" wide table is not a relational model.

## Key Takeaways
1. Relational (3NF) for integrity and OLTP; dimensional (star schema) for analysis and reporting speed.
2. Use surrogate keys in dimensional models; use SCD Type 2 when history matters (e.g. a customer's old state).
3. Data vault sits between 3NF and star schema — good for large, complex, history-heavy organizations.
4. Don't build a CDM from scratch; customize a prebuilt industry model.
5. You need not pick Inmon or Kimball strictly — hybridize; both are iterative, ~25% up-front design.

## Connects To
- **Ch 4**: the RDW is the platform these models are built on.
- **Ch 6**: MDM produces the mastered dimension tables; data marts are modeled dimensionally.
- **Ch 7**: OLAP cubes sit on top of star schemas (semantic layer).
- **Ch 10**: MDW's serving layer uses dimensional/star-schema modeling.
