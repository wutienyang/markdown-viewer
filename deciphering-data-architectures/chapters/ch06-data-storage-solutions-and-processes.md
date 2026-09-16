# Chapter 6: Data Storage Solutions and Processes

## Core Idea
Beyond the warehouse and lake, a full architecture is assembled from specialized storage components (data marts, ODS, data hubs) and processes (MDM, virtualization, catalogs, marketplaces) — each solving a distinct problem, and each most valuable when orchestrated together rather than chosen in isolation.

## Frameworks Introduced
- **Data Mart**: a department-focused subset of the warehouse, tailored to one business line.
  - When to use: giving a specific department streamlined, self-managed access without navigating the whole DW.
  - How: extract/consolidate relevant data from the DW into a department-owned, independently-structured repository.
- **Operational Data Store (ODS)**: an enterprise-wide, near-real-time view of operational (not analytical) data.
  - When to use: when you need up-to-the-minute operational reporting, or when only a few people have source-system access and you want to widen it.
  - How: integrate source data at the lowest granularity every few minutes; optionally use the ODS as a staging area for the DW.
- **Data Hub**: a centralized system for ingesting, integrating, and *distributing* data — eliminating point-to-point interfaces between systems.
  - When to use: data exchange/collaboration among operational systems, beyond pure analytics.
  - How: store copies of source data, distribute them; processing happens outside the hub.
- **Master Data Management (MDM)**: creating one "golden" master record per person/place/thing across sources.
  - When to use: whenever duplicate/near-duplicate entities (customers, products) would corrupt reports.
  - How: copy data in, clean/standardize, dedupe, build hierarchies, copy the golden record back to the lake/DW.
- **Data Virtualization / Data Federation**: a logical (non-replicating) view over multiple sources.
  - When to use: speed to market, data that can't move (sovereignty), frequently-changing reference data, or self-service sandboxes.
  - How: create a unified access point; push queries down to sources; rely on caching.

## Key Concepts
- **Near-duplicates**: records that differ subtly (middle initial, hyphen, suffix) so simple filters miss them — MDM's core target.
- **Golden source / best version of the truth**: the mastered record MDM produces.
- **Push-down query**: delegating filter/aggregation to the source system to reduce data transfer (at the cost of source compute).
- **Federated queries**: a single query spanning multiple sources/format, combined into one result set.
- **Data catalog**: metadata-only repository for discovery, lineage, and governance (Informatica, Collibra, Purview).
- **Data marketplace / data exchange**: platform for buying/selling/sharing datasets (Snowflake Marketplace, Datarade).
- **Virtual sandbox**: an isolated, secure environment to explore data without affecting production.

## Mental Models
- Think of a data mart as a microscope vs. the ODS as a wide-angle lens — both view the same data, different scope and speed.
- Think of MDM as the trust machine: lose a user's trust on one duplicate, and it is very hard to win back.
- Think of virtualization as "query the source where it lives" vs. movement as "copy, transform, store."

## Anti-patterns
- **Skipping MDM**: the first report shows the same customer twice, and you've already lost the user's trust.
- **Treating the ODS as a warehouse**: it stores operational data, not analytical data, and holds a short window, not history.
- **Using virtualization for sub-second dashboards**: federated queries rarely match a warehouse's read performance.
- **Over-copying data**: every physical copy widens the attack surface and creates consistency/governance burden.

## Reference Tables
ODS vs. Data Warehouse:

| | Operational Data Store | Data Warehouse |
|---|---|---|
| Best suited for | Granular, low-level queries on detailed operational data | Complex queries on aggregated analytical data |
| Purpose | Operational, near-real-time reporting | Historical and trend analysis |
| Data duration | Short window | Entire history |
| Decision making | Operational/tactical, near real-time | Strategic |
| Load frequency | Minutes/hourly | Daily/weekly/monthly/quarterly |

## Worked Example
**ShoesForLess inventory.** With many stores each tracking orders in its own database, only an ODS can combine order data in near-real-time to tell a customer-service rep whether "men's running shoe, size 10" is in stock *right now* — a warehouse is too slow. The same company's marketing manager turns to the DW for last year's *aggregated* monthly sales trend. ODS for the current minute, DW for the year.

## Key Takeaways
1. Data marts give departments self-service access; the ODS gives real-time operational reporting; the DW gives history and strategy.
2. Use the ODS as a staging area for the DW to reduce ETL flows and staging sizes.
3. A data hub is for *distribution and exchange* among systems — its goal is not analytics.
4. Implement MDM before users see duplicates; near-duplicates are the hardest case.
5. Choose virtualization for speed-to-market, sovereignty, and fresh data; choose movement for aggregation, joins, and fast repeated queries.

## Connects To
- **Ch 4**: data marts and MDM sit on top of the RDW; the ODS feeds it.
- **Ch 5**: the lake is the landing zone; virtualization can query it in place.
- **Ch 8**: MDM produces the dimension tables of a star schema.
- **Ch 9**: virtualization is an alternative to ETL/ELT data movement.
- **Ch 11**: the data fabric weaves these components (catalog, virtualization, MDM) together.
