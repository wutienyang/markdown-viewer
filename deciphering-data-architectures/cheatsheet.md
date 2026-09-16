# Cheatsheet

## Choosing an architecture (decision rules)

- **<10 TB, already relational, gentle transition** → Modern Data Warehouse (even an SMP RDW suffices).
- **>10 TB, diverse sources, real-time, strong governance** → Data Fabric (MDW + ≥3 of 8 features).
- **AI/ML-heavy, cost-sensitive, smaller data** → Data Lakehouse; use until you hit its limits, then move that dataset to an RDW.
- **Very large, domain-oriented, scaling bottleneck, high maturity** → Data Mesh (~1% of companies qualify).

## The four architectures by cost/complexity

| Architecture | Centralized? | Storage | Best fit |
|---|---|---|---|
| Modern Data Warehouse | Centralized | Lake + RDW | Small data, relational users |
| Data Fabric | Centralized | Lake + RDW + catalog/MDM/APIs | Diverse sources, real-time |
| Data Lakehouse | Centralized | One lake (Delta/Iceberg/Hudi) | ML-heavy, cost-sensitive |
| Data Mesh | Decentralized | Per-domain | Enterprise scale + domains |

## Architecture tell (the single distinguishing line)

- Replicates data to an RDW → **MDW**.
- MDW + ≥3 of 8 fabric features → **Data Fabric**.
- No RDW, one Delta-enabled lake → **Data Lakehouse**.
- Domains own & serve data as products → **Data Mesh**.
- Only principle #1 (domains own data), no product/self-serve/governance → **Data Federation**, not a mesh.

## Six Vs — classify any dataset before designing

Volume · Variety · Velocity · Veracity · Variability · **Value (most important)**.

## Data maturity — where is the org?

Reactive (spreadmarts) → Informative (centralized, batch) → Predictive (cloud + ML) → Transformative (self-service). Stages 1–2 = rearview mirror; 3–4 = this book's focus.

## Schema rule

- Consistency/integrity first → **schema-on-write** (RDW).
- Flexibility/raw storage first → **schema-on-read** (lake).

## Data lake layers (and aliases)

Raw (bronze) → Conformed (base, Parquet) → Cleansed (silver) → Presentation (gold) → Sandbox (optional).

## Ingestion rules

- ETL = "Early Transformation Leads" → smaller relational moves, quality control.
- ELT = "Every Load Transforms" → lakes, big/unstructured data.
- Reverse ETL → push mastered data/scores back into SaaS tools.
- Batch vs. real-time → decide by **latency tolerance** alone.

## Change detection (prefer in this order)

Timestamps → CDC → Partitioning → Triggers → MERGE (last resort).

## Modeling rules

- Relational (3NF) for OLTP/integrity; dimensional (star schema) for analysis.
- Surrogate keys in dimensional models; SCD Type 2 when history matters.
- Report from the cube where possible.
- Inmon (top-down CIF) vs. Kimball (bottom-up data marts): hybridize; ~25% design up front.

## Data mesh adoption gates

1. All four principles present? (ownership, product, self-serve platform, federated governance)
2. Readiness self-assessment: all 8 criteria "somewhat/highly applicable"?
3. If most responsibility dots sit with central IT → call it a fabric/lakehouse, not a mesh.

## Project-failure tells (the 15 pitfalls, top checks)

- Executives think BI is "easy" → educate them.
- Wrong technology ("hammer, nail") → research committees.
- Unvalidated reports or slow response times → lost trust, hard to win back.
- Consultants as black box / no knowledge transfer → embed your people.
- Fixed end date → keep schedules flexible.

## Cloud defaults

- Cloud over on-prem (unless no internet, millisecond needs, or locked lease).
- PaaS for data warehouses (no VMs, auto-patch/backup, one-click DR).
- One cloud over multi-cloud (volume discounts; DR = another region, not another cloud).
