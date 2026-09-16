---
name: deciphering-data-architectures
description: "Knowledge base from \"Deciphering Data Architectures\" by James Serra. Use when choosing between a modern data warehouse, data fabric, data lakehouse, and data mesh; designing data lakes/warehouses; or reasoning about data modeling, ingestion, and architecture trade-offs."
---

<!-- argument-hint: [topic, framework name, or chapter number] -->

# Deciphering Data Architectures
**Author**: James Serra | **Pages**: ~278 | **Chapters**: 16 | **Generated**: 2026-09-16

## How to Use This Skill

- **Without arguments** — load the core frameworks below for reference
- **With a topic** — ask about `data mesh`, `lakehouse`, `ETL vs ELT`, `star schema`, `ADS`, or another indexed topic; I find and read the relevant chapter
- **With chapter** — ask for `ch10`; I load that specific chapter file
- **Browse** — ask "what chapters do you have?" to see the full index

When you ask about a topic not covered in Core Frameworks below, I read the relevant chapter file before answering.

---

## Core Frameworks & Mental Models

**The four architectures, in one line.** Modern data warehouse = data lake + relational data warehouse, side by side. Data fabric = an MDW plus technologies (≥3 of 8 features) to consume any data. Data lakehouse = one data lake with a transactional layer (Delta/Iceberg/Hudi), no RDW. Data mesh = a decentralized *concept* (Dehghani's four principles), not a technology.

**Use the "one distinguishing line" to classify.** If data is replicated to an RDW, it's an MDW. If no RDW and one Delta-enabled lake, it's a lakehouse. If domains own and serve data as products, it's a mesh. If you only satisfy mesh principle #1 (domains own data), it's data federation — not a mesh.

**Decide by volume and workload.** Under ~10 TB with relational users → MDW (even SMP). Over ~10 TB, diverse sources, real-time, governance-heavy → fabric. AI/ML-heavy and cost-sensitive → lakehouse, until you hit its limits, then move that data to an RDW. Very large, domain-oriented, scaling-bottlenecked, high maturity → mesh (only ~1% of companies qualify).

**Every architecture is a trade-off; none is wrong.** Centralized architectures (MDW, fabric, lakehouse) trade ownership/quality/scaling bottlenecks for simplicity; the mesh trades a massive org/cultural shift for the reverse. Serra's core lesson: pick the architecture for *your* use case, not for hype.

**The six Vs** describe any dataset: Volume, Variety, Velocity, Veracity, Variability, and Value (the most important). Classify data with them before choosing technology.

**Data maturity** is a four-stage ladder: Reactive (spreadmarts) → Informative (centralized batch) → Predictive (cloud + ML) → Transformative (self-service BI). Stages 1–2 are "rearview mirror"; 3–4 are the book's focus.

**Schema-on-write vs. schema-on-read** is the fundamental divide. Relational (RDW) enforces schema before data lands — integrity but joins. Data lake applies schema at read — flexibility but no forced metadata.

**ETL vs. ELT**: ETL = "Early Transformation Leads" (transform in flight — smaller relational moves, quality control). ELT = "Every Load Transforms" (transform in place — lakes, big/unstructured data). Choose batch vs. real-time by **latency tolerance** alone.

**Modeling**: relational (3NF) for OLTP/integrity; dimensional (star schema) for analysis speed; use surrogate keys and SCD Type 2 when history matters. Inmon (top-down CIF) and Kimball (bottom-up data marts) are compatible — hybridize, ~25% design up front.

**The architecture design session (ADS)** is the highest-leverage practice: vendor-neutral discovery, whiteboard the architecture, verify all pain points are addressed — before choosing products. A $100M rebuild is the cost of skipping it.

**People and processes, not technology, decide success.** The 15 pitfalls (wrong technology, unvalidated reports, consultant black boxes, fixed deadlines) sink most projects; ~87% of data science projects never reach production.

**Cloud defaults**: prefer cloud over on-prem, PaaS for data warehouses, and a single cloud over multi-cloud (DR = another region, not another cloud).

---

## Chapter Index

| # | Title | Key Frameworks |
|---|-------|----------------|
| [ch01](chapters/ch01-big-data.md) | Big Data | Six Vs, data maturity, self-service BI |
| [ch02](chapters/ch02-types-of-data-architectures.md) | Types of Data Architectures | Six types, schema-on-write/read |
| [ch03](chapters/ch03-the-architecture-design-session.md) | The Architecture Design Session | ADS, discovery, whiteboarding |
| [ch04](chapters/ch04-the-relational-data-warehouse.md) | The Relational Data Warehouse | RDW, SVOT, top-down, ETL |
| [ch05](chapters/ch05-data-lake.md) | Data Lake | Lake layers, bottom-up, multiple lakes |
| [ch06](chapters/ch06-data-storage-solutions-and-processes.md) | Data Storage Solutions and Processes | Data marts, ODS, data hub, MDM, virtualization, catalog, marketplace |
| [ch07](chapters/ch07-approaches-to-design.md) | Approaches to Design | OLTP/OLAP, SMP/MPP, Lambda, Kappa, polyglot |
| [ch08](chapters/ch08-approaches-to-data-modeling.md) | Approaches to Data Modeling | Relational, dimensional, SCD, CDM, data vault, Inmon vs Kimball |
| [ch09](chapters/ch09-approaches-to-data-ingestion.md) | Approaches to Data Ingestion | ETL/ELT, reverse ETL, batch/real-time, governance |
| [ch10](chapters/ch10-the-modern-data-warehouse.md) | The Modern Data Warehouse | MDW, five stages, stepping stones |
| [ch11](chapters/ch11-data-fabric.md) | Data Fabric | Fabric, eight components, lineage |
| [ch12](chapters/ch12-data-lakehouse.md) | Data Lakehouse | Delta Lake, ACID, time travel, serving layer |
| [ch13](chapters/ch13-data-mesh-foundation.md) | Data Mesh Foundation | Four principles, domains, topologies |
| [ch14](chapters/ch14-should-you-adopt-data-mesh.md) | Should You Adopt Data Mesh? | Myths, concerns, readiness assessment, hub-and-spoke |
| [ch15](chapters/ch15-people-and-processes.md) | People and Processes | Team roles, 15 pitfalls, success tips |
| [ch16](chapters/ch16-technologies.md) | Technologies | OSS vs cloud, IaaS/PaaS/SaaS, Hadoop, Databricks, Snowflake |

## Topic Index

- **ACID** → ch12
- **Architecture Design Session (ADS)** → ch03
- **Batch vs. real-time** → ch09
- **Cloud service models (IaaS/PaaS/SaaS)** → ch16
- **Common Data Model (CDM)** → ch08
- **Data catalog** → ch06, ch11
- **Data fabric** → ch11
- **Data governance** → ch09, ch11
- **Data hub** → ch06
- **Data lake** → ch05
- **Data lake layers (zones)** → ch05
- **Data lakehouse** → ch12
- **Data mart** → ch06
- **Data maturity** → ch01
- **Data mesh** → ch13, ch14
- **Data modeling (relational/dimensional)** → ch08
- **Data product / data contract** → ch13
- **Data vault** → ch08
- **Data virtualization / federation** → ch06, ch11
- **Delta Lake** → ch12
- **ELT / ETL** → ch09
- **ETL vs. ELT (mnemonics)** → ch09
- **Inmon vs. Kimball** → ch08
- **Kappa architecture** → ch07
- **Lambda architecture** → ch07
- **Master Data Management (MDM)** → ch06, ch11
- **Modern Data Warehouse (MDW)** → ch10
- **MPP / SMP** → ch07
- **OLTP / OLAP** → ch07
- **Operational Data Store (ODS)** → ch06
- **Polyglot persistence** → ch07
- **Relational Data Warehouse (RDW)** → ch04
- **Reverse ETL** → ch09
- **Schema-on-read / schema-on-write** → ch02
- **Single Version of Truth (SVOT)** → ch04
- **Six Vs of big data** → ch01
- **Slowly Changing Dimensions (SCD)** → ch08
- **Star schema** → ch08
- **Stepping-stone architectures** → ch10

## Supporting Files

- [glossary.md](glossary.md) — all key terms with definitions
- [patterns.md](patterns.md) — all techniques and design patterns
- [cheatsheet.md](cheatsheet.md) — quick reference decision rules and tables

---

## Scope & Limits

This skill covers the book content only. For hands-on implementation in your codebase, combine with project-specific tools. For topics beyond this book, check related skills or ask the agent directly.
