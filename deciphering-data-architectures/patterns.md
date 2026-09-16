# Patterns

## Architecture Design Session (ADS)
**When to use**: the start of any data architecture project; before choosing products.
**How**: discovery (vendor-neutral questionnaire) → whiteboard goals/pain points/parking lot → produce blueprint + plan. Verify all pain points are addressed.
**Trade-offs**: a full day of prep and facilitation, but far cheaper than a $100M rebuild.

## Data Lake Layering (zones)
**When to use**: designing any data lake.
**How**: Raw → Conformed (Parquet) → Cleansed → Presentation (+ optional Sandbox); partition folders by time/source/subject/security.
**Trade-offs**: layering is up-front work but prevents the data swamp and improves performance/security.

## ETL vs. ELT Selection
**When to use**: choosing an ingestion pipeline.
**How**: ETL ("Early Transformation Leads") for smaller relational moves and quality control; ELT ("Every Load Transforms") for lakes and big/unstructured data.
**Trade-offs**: ETL gives better pre-load quality/security but is slow and re-extracts on rerun; ELT is flexible and reruns in place but lands raw data first.

## Change Detection for Incremental Extraction
**When to use**: deciding how to identify changed rows for a warehouse load.
**How**: prefer, in order — timestamps → change data capture (CDC) → partitioning → database triggers → MERGE statement.
**Trade-offs**: each step down trades ease/reliability for fallback usability; MERGE is a last resort that burdens the DW.

## Slowly Changing Dimensions (SCD)
**When to use**: tracking history in dimensional models.
**How**: Type 1 (overwrite) for trivial fixes; Type 2 (old + new versions) to preserve history; Type 3 (full new record) for complete audit.
**Trade-offs**: richer history costs more complexity and storage.

## Modern Data Warehouse (MDW)
**When to use**: default for big data under ~10 TB; the "best of both worlds."
**How**: ingest → store in lake → transform → model into RDW → visualize; replicate at least some data to an RDW.
**Trade-offs**: two copies (cost, staleness, complexity) in exchange for RDW serving speed and self-service BI.

## Stepping-Stone Migration to MDW
**When to use**: organizations with an existing on-prem EDW.
**How**: EDW augmentation (add a cloud lake), temporary data lake + EDW (lake for staging only), or all-in-one (lake only).
**Trade-offs**: each gets value now while trading some lake benefits until a full MDW is reached.

## Data Fabric (MDW + ≥3 of 8)
**When to use**: >10 TB, diverse sources, real-time, strong governance.
**How**: add at least three of — access policies, metadata catalog, MDM, virtualization (optional), real-time, APIs, services, products.
**Trade-offs**: more capability and governance, but more complexity and troubleshooting difficulty.

## Data Lakehouse (Delta Lake)
**When to use**: smaller datasets, AI/ML-heavy workloads, cost-sensitive teams.
**How**: store data in Delta format (Parquet + transaction log) for DML/ACID/time-travel/schema-enforcement; add a relational serving layer.
**Trade-offs**: one copy (reliability/cost/governance wins) vs. losing RDW speed, security, concurrency, and forced metadata.

## Relational Serving Layer
**When to use**: making a Delta Lake usable to end users.
**How**: create SQL views / reporting datasets / Hive tables over the files so users join and report as if from an RDW.
**Trade-offs**: reintroduces a metadata layer, but it isn't tied to the data the way an RDW's is.

## Data Mesh (Dehghani's Four Principles)
**When to use**: very large, domain-oriented enterprises hitting ownership/scaling bottlenecks (~1% of companies).
**How**: domain ownership + data as a product + self-serve platform + federated governance; migrate via hub-and-spoke, domain by domain.
**Trade-offs**: solves ownership/scaling but costs huge org change, duplication, hiring, and years of timeline.

## Hub-and-Spoke Mesh Migration
**When to use**: moving an existing centralized estate toward a mesh.
**How**: stand up new mesh domains from new data first, keep the central solution running, migrate gradually.
**Trade-offs**: slower but risk-contained and cost-spread vs. a big-bang migration.

## Batch vs. Real-Time Selection
**When to use**: deciding ingestion cadence.
**How**: choose by latency tolerance — high tolerance → batch; low tolerance → real-time.
**Trade-offs**: real-time gives immediate insight at higher resource cost, failure risk, and complexity.

## Polyglot Persistence
**When to use**: systems with heterogeneous data types (carts, orders, inventory, graphs).
**How**: key-value for sessions, document for orders, RDBMS for inventory, graph for social graphs.
**Trade-offs**: the right tool per data type wins on speed, but costs learning and integration complexity.

## Single Cloud (over Multi-Cloud)
**When to use**: nearly always; pick one CSP and go deep.
**How**: use PaaS for data warehouses; fail over to another region, not another cloud.
**Trade-offs**: multi-cloud only pays off for data-sovereignty gaps or genuine per-region strengths — and even then costs egress, staffing, and admin overhead.
