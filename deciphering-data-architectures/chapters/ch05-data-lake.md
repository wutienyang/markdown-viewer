# Chapter 5: Data Lake

## Core Idea
A data lake stores vast amounts of raw data in its natural format with no up-front structure (schema-on-read). It is cheap, unlimited, and handles semi-structured/unstructured data — and when paired with a warehouse, the lake becomes the single version of truth, the ML/analytics playground, and the online archive.

## Frameworks Introduced
- **Data Lake**: a metaphor for storing raw data in its native format, like a lake holding water unchanged — contrasting with the "bottled and packaged" warehouse.
  - When to use: landing semi/unstructured data, streaming data, cheap unlimited storage, ML training, and data investigation before committing to a warehouse schema.
  - How: land raw data first, attach compute to clean/join/aggregate, then write refined data back to the lake.
- **Bottom-Up Approach**: collect data before forming hypotheses — explore to surface the questions.
  - When to use: when you don't yet know what questions to ask of the data; predictive/prescriptive analytics and data science.
  - How: land raw files, let data scientists explore, then model valuable findings into an RDW later.
- **Data Lake Layers (zones)**: logically divide the lake by increasing data quality.
  - When to use: always — prevents the "data swamp" and improves performance, manageability, and security.
  - How: Raw (bronze) → Conformed (base, convert to Parquet) → Cleansed (silver, clean/integrate) → Presentation (gold, business-ready) → optional Sandbox (exploration).

## Key Concepts
- **Data swamp**: an unorganized, unmanageable data lake — the failure mode when no governance/layering is applied.
- **Predictive vs. prescriptive analytics**: predict future outcomes vs. suggest actions to affect outcomes.
- **Parquet**: the standard columnar file format that the conformed layer normalizes everything into.
- **Source-aligned vs. consumer-aligned data lake**: minimal-transformation lake for source experts vs. transformed lake for broader consumers.
- **Storage access tiers**: archive (raw/conformed), cold (cleansed), hot (presentation/sandbox) — each a different cost/latency trade-off.

## Mental Models
- Think of the lake as "a glorified filesystem" that becomes useful only when compute is attached.
- Think of the layers as a desalination/filtration system: raw reservoir → standardized → filtered → ready-to-drink.
- When a lake and a warehouse coexist, the *lake* is the single version of truth, not the warehouse.
- Store data "just in case" in the lake; be deliberate in the warehouse.

## Anti-patterns
- **The data swamp**: dumping files with no layers, governance, or folder structure.
- **Transforming in the DW instead of the lake**: locks users out during the maintenance window and wastes expensive DW compute — transform in the lake.
- **Under-designing the lake**: not thinking through all current and future sources/use cases forces a costly redesign.
- **Forgetting integrity checks**: no auditing between layers means silent pipeline corruption of financial data.

## Reference Tables
The five lake layers and their aliases:

| Layer | Purpose | Aliases |
|---|---|---|
| Raw | Immutable, unprocessed, historical | bronze, staging, landing |
| Conformed | Convert all file types to Parquet | base, standardized |
| Cleansed | Clean, integrate, standardize | silver, transformed, refined, enriched |
| Presentation | Business logic applied, consumer-ready | gold, trusted, curated, serving, analytics |
| Sandbox (optional) | Data-scientist playground, read+modify | exploration, development, data science workspace |

## Worked Example
**The dressing-room data lake.** A retail chain ingested Twitter feedback into a data lake and ran sentiment analysis. The negative comments clustered around dressing rooms — too small, crowded, not private. After remodeling one store as an experiment, positive comments surged and that store's sales rose 7%. A nationwide remodel lifted sales 6% and added millions in profit. The lesson: raw unstructured data (social sentiment) landed cheaply in a lake and produced an insight no relational warehouse could have surfaced.

## Key Takeaways
1. Use the lake for schema-on-read: land first, structure later — faster ROI and easier investigation.
2. Do transformations in the lake (not the warehouse) to cut cost, enable parallel compute, and keep the DW available 24/7.
3. Divide the lake into Raw → Conformed → Cleansed → Presentation layers (plus a sandbox) to avoid a swamp.
4. Partition folders by time, source, subject, security boundary, etc., and pick storage tiers per layer.
5. Use multiple *physically separate* lakes when data sovereignty, ownership, security, DR, or environment isolation demand it — not just for convenience.

## Connects To
- **Ch 4**: the lake is the schema-on-read counterpart to the RDW's schema-on-write.
- **Ch 6**: the lake feeds data marts, MDM, and operational data stores.
- **Ch 10**: the modern data warehouse combines lake + warehouse.
- **Ch 12**: the lakehouse adds a transactional layer on top of the lake.
- **Ch 13**: source-aligned/consumer-aligned lakes foreshadow data-mesh domain ownership.
