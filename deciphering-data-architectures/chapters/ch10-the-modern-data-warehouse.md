# Chapter 10: The Modern Data Warehouse

## Core Idea
The modern data warehouse (MDW) combines a relational data warehouse with a data lake — lake for staging, transformation, and ML; warehouse for serving, security, and self-service BI. Its defining feature is that at least some data is replicated from the lake into an RDW; otherwise you have a lakehouse.

## Frameworks Introduced
- **Modern Data Warehouse (MDW)**: RDW + data lake side by side — the "best of both worlds."
  - When to use: the default architecture for organizations with big data but not at fabric/lakehouse scale; still popular under ~10 TB.
  - How: land in lake → transform → model into RDW → visualize.
- **Five stages of the MDW data journey**:
  1. Ingestion — any source, size, speed, type (batch or streaming).
  2. Storage — data lake layers (raw → conformed → cleansed → presentation).
  3. Transformation — separate compute cleans/enriches and writes up the layers.
  4. Data modeling — copy to RDW (3NF + star schema).
  5. Visualization — reports/dashboards from the RDW.
  - When to use: as the standard mental map of an MDW pipeline.
  - How: follow data through each stage; decide full vs. incremental extraction and pipeline bandwidth at stage 1.
- **Three Stepping-Stone Architectures**: interim paths to an MDW for existing EDW owners.
  - **EDW augmentation** — add a cloud lake for big data, keep the EDW.
  - **Temporary data lake + EDW** — lake only for staging/transformation, not reporting.
  - **All-in-one** — data lake only, no RDW (closest to a lakehouse).
  - When to use: to get value now while migrating toward a full MDW.

## Key Concepts
- **The MDW's distinguishing feature**: replication to an RDW. No replication → data lakehouse (Ch 12).
- **Serving vs. staging split**: lake = staging/prep/ML + power users; RDW = serving/security/compliance + business users.
- **Bypass exceptions**: reference/dimension tables may go source → RDW directly; not all lake data needs to go to the RDW.
- **Leading MDW providers**: Azure Synapse Analytics, Amazon Redshift, Google BigQuery, Snowflake.
- **SMP vs. MPP choice**: under ~10 TB, a cheaper SMP RDW may suffice.

## Mental Models
- Think of the MDW as "store and process separately": the lake stores, compute processes, the warehouse serves.
- Think of the RDW as the self-service BI engine — low latency, MPP joins, millisecond dashboards, row/column security.
- Think of the stepping stones as "value now, full MDW later" — they are migration stages, not failures.

## Anti-patterns
- **Bypassing the lake for everything**: source data that skips the lake loses backup, strains the RDW with cleansing, and breaks the lake's single-source-of-truth role.
- **Full lakehouse without realizing it**: if no data is replicated to an RDW, you've built a lakehouse, not an MDW.
- **Data silos**: without integration and governance, the MDW's two-store structure can isolate data.
- **Vendor lock-in**: cloud MDW services create dependency on one provider.

## Worked Example
**Wilson & Gunkerk's MDW decision.** A midsized pharma company with data under 1 TB, growth projected within 10 TB, and an on-prem EDW chose a cloud MDW rather than a full lake/fabric. Reasons: smoother migration (no new lake paradigm), cost-effectiveness via an *SMP* (not MPP) RDW, and enough headroom for growth. Result: predictive models (forecasting drug efficacy from patient demographics/genetics) within months. The lesson: match the architecture to actual volume — under ~10 TB, an MDW on SMP is often the right call.

## Key Takeaways
1. The MDW's defining feature is replicating lake data into an RDW for serving.
2. Follow the five stages: ingest → store → transform → model → visualize.
3. Lake is for staging/ML/power users; RDW is for serving/security/business users and millisecond dashboards.
4. Use stepping stones (EDW augmentation, temporary lake, all-in-one) to get value during migration.
5. Under ~10 TB with modest growth, an MDW on an SMP RDW is cost-effective; scale to MPP/fabric/lakehouse only when data demands it.

## Connects To
- **Ch 4–5**: the MDW is the synthesis of the RDW and the data lake.
- **Ch 7**: SMP vs. MPP determines the MDW's RDW tier.
- **Ch 11–12**: the fabric adds more technology to the MDW; the lakehouse removes the RDW.
- **Ch 16**: Azure Synapse/Redshift/BigQuery/Snowflake are the MDW platforms.
