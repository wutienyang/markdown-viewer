# Chapter 4: The Relational Data Warehouse

## Core Idea
The relational data warehouse (RDW) is the central, structured repository that gives an organization its single version of truth (SVOT). It is optimized for analytical (read) workloads, offloads reporting from operational systems, and — contrary to the "RDW is dead" hype — remains a fundamental, permanent component of most architectures.

## Frameworks Introduced
- **Relational Data Warehouse (RDW)**: centrally stored, structured data copied from multiple sources, for historical/trend reporting; built on the relational model and queried via SQL.
  - When to use: when you need a single version of truth, fast read access, historical accuracy, and easy self-service reporting for business users.
  - How: ingest via ETL; optimize for read access; enforce schema-on-write; run a top-down design process.
- **Single Version of Truth (SVOT)**: a unified, consistent, standardized view of all data — eliminating silos and discrepancies.
  - When to use: whenever reports from multiple sources are producing conflicting answers.
  - How: centralize data in the warehouse so any question about report accuracy can be answered from one place.
- **Top-Down Approach**: the RDW methodology of planning/design first, then building — works for descriptive and diagnostic analytics.
  - When to use: historical reporting ("what happened" and "why").
  - How: 9 steps from hypotheses → requirements → architecture → data model → build → ETL → BI → test → maintain.

## Key Concepts
- **Enterprise Data Warehouse (EDW)**: a DW used by the whole company, supporting all business units with a single unified view.
- **ETL (Extract, Transform, Load)**: the three-step pipeline — extract from sources, transform to fit the target, load into the warehouse.
- **Descriptive vs. diagnostic analytics**: describing past events (what happened) vs. investigating causes (why it happened).
- **Write-once, read-many**: the DW's workload shape — optimized for reads, tolerant of slow writes.
- **Full vs. incremental extraction**: pull the whole table vs. only changed rows.
- **Online vs. offline extraction**: connect directly to the source vs. pull a flat file staged by the source system.

## Mental Models
- Think of the RDW as "the single source of truth" — every accuracy dispute is settled there.
- Think of a DW-copy-with-prefix (`DW_Finance`) as a fake warehouse: copying operational tables ≠ designing for analytics.
- Use "how easy will reports be to build?" as the test for whether your DW is well-modeled.

## Anti-patterns
- **"DW prefix"**: copying an operational database and renaming it `DW_*` — operational data is not analytical data.
- **Views with unions**: unioning three `CustomerSource1/2/3` tables into a view instead of merging into one modeled table (use MDM).
- **Dumping ground**: letting a DW grow ad hoc from one-off requests into a jumbled mess of tables.
- **The maintenance window**: locking out users during ETL kills 24/7 access and causes upset users when jobs fail.
- **"RDW is dead"**: the Hadoop-vendor claim; data lakes failed to replace warehouses, and RDWs persist for three reasons — lakes are harder to report from, RDWs still meet user needs, and users trust them.

## Reference Tables
Techniques for identifying changed data (for incremental extraction), most- to least-preferred:

| Technique | Notes |
|---|---|
| Timestamps | Easiest; use a `last modified` column, default value, or trigger |
| Change data capture (CDC) | Reads the transaction log; enables near-real-time warehousing |
| Partitioning | Range-partition source tables by date key |
| Database triggers | Write changes to a change table (fallback if no CDC) |
| MERGE statement | Full extract + compare against prior extract; last resort |

## Worked Example
**Historical accuracy without saved reports.** A user wants "sales by state" for a customer who has since moved. Running today's report would wrongly show the customer's sales in the *new* state, because the record was updated. Solution: the DW tracks customer location history with start/end dates, so the report can pull data "as of" a past date — no more saving monthly report files. This is why the DW keeps *history* rather than just current state.

## Key Takeaways
1. The RDW's defining value is the single version of truth — one consistent, standardized view of all data.
2. Offload reporting from OLTP systems to stop report queries from crushing application performance.
3. Design for analytics, not operation: restructure/rename tables and build a proper data model (not a DW-prefix copy).
4. Prefer timestamps → CDC → partitioning → triggers → MERGE, in that order, for change detection.
5. The RDW is not dead — it remains a permanent component, now usually paired with a data lake.

## Connects To
- **Ch 2**: RDW was the first architecture type (1984).
- **Ch 5**: the data lake is the schema-on-read counterpart; the bottom-up approach.
- **Ch 6**: data marts, MDM, and operational data stores build on the RDW.
- **Ch 8**: Kimball vs. Inmon and data modeling for the RDW.
- **Ch 10**: the modern data warehouse pairs the RDW with a lake.
