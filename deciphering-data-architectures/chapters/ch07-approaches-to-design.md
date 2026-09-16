# Chapter 7: Approaches to Design

## Core Idea
How data is stored, processed, and accessed is governed by a handful of design choices — OLTP vs. OLAP, SMP vs. MPP, Lambda vs. Kappa, and polyglot persistence. None is best for everything; the skill is matching and combining them to your workload.

## Frameworks Introduced
- **OLTP vs. OLAP**: transactional CRUD systems (low latency, high concurrency, normalized) vs. analytical read-heavy systems (fast multi-dimensional analysis, denormalized).
  - When to use: OLTP for operational apps; OLAP for BI/reporting and "slicing and dicing."
  - How: OLTP feeds a DW, which feeds an OLAP cube/tabular model.
- **SMP vs. MPP**: scale up (multiple processors sharing disk/memory in one server) vs. scale out (many servers, each with its own memory/disk).
  - When to use: SMP for OLTP; MPP for the write-once read-many warehouse.
  - How: MPP distributes data across nodes; a control node splits queries into subqueries run in parallel.
- **Lambda Architecture**: dual batch + stream processing with a unified presentation layer.
  - When to use: distributed systems needing both accurate historical data and up-to-the-second views (recommendation engines, fraud detection).
  - How: batch layer (single source of truth) + speed/stream layer (recent, low-latency) + serving layer that mediates between them.
- **Kappa Architecture**: stream-only processing, no batch layer.
  - When to use: high-volume real-time with no need for batch or ad-hoc historical queries (streaming platforms, trading).
  - How: a single event stream, stateless processing.
- **Polyglot Persistence**: use multiple storage technologies in one system, each matched to its data type.
  - When to use: systems with heterogeneous data (carts, orders, inventory, graphs).
  - How: key-value for carts/sessions, document for orders, RDBMS for inventory, graph for social graphs.

## Key Concepts
- **Operational vs. analytical data**: real-time snapshots of current state (OLTP) vs. transformed historical views for insight (OLAP/DW).
- **OLAP cube vs. tabular model**: pre-aggregated multidimensional cube vs. a tabular ("relational-like") semantic model — both are semantic layers over the DW.
- **Control node vs. compute node (MPP)**: the node that splits/dispatches queries vs. the workers that execute subqueries.
- **Stateless vs. stateful processing**: Lambda is stateless (misses sequence); Kappa is stateless by design.
- **Polyglot data store**: the organization-wide version of polyglot persistence — different stores for different projects.

## Mental Models
- Think of SMP as "get a faster friend" and MPP as "get 26 friends each holding 2 cards" — scale up vs. scale out.
- Think of Lambda's serving layer as a mediator: default to the trusted batch layer, pull from the speed layer only when you need "right now."
- Think of polyglot persistence as "the right tool for the right data."

## Anti-patterns
- **Using SMP for a warehouse**: read-many workloads need scale-out MPP, not a bigger single server.
- **Lambda for stateful needs**: a stateless recommendation system misses the shopping journey (shoes → socks → polish) and recommends items already in the cart.
- **Kappa when you need batch/ad-hoc history**: stream-only processing struggles with historical batch queries.
- **One database for all data types**: forcing relational storage onto graph/key-value data slows development and performance.

## Reference Tables
Lambda vs. Kappa:

| | Lambda | Kappa |
|---|---|---|
| Handles | Batch + real-time | Real-time only |
| Layers | Batch + speed + serving | Speed + serving (no batch) |
| Strengths | Unified view, trusted + fresh | Low latency, simpler real-time, fault-tolerant |
| Weaknesses | Complexity, limited stateful, less real-time-efficient | Limited batch, limited ad-hoc queries |
| Best for | Recommendation, fraud detection | Streaming, financial trading |

## Key Takeaways
1. OLTP = operational data (fast CRUD); OLAP = analytical data (fast reads) — build the DW and OLAP model from OLTP sources.
2. Scale up for OLTP (SMP); scale out for warehouses (MPP).
3. Choose Lambda when you need both trusted history and real-time; choose Kappa for pure real-time.
4. Lambda/Kappa are high-level patterns you can implement *inside* any of the Part III architectures.
5. Pick storage technology per data type (polyglot) — accept the added complexity for the speed and fit.

## Connects To
- **Ch 4**: the DW is the OLAP/read-optimized counterpart to OLTP sources.
- **Ch 8**: OLAP cubes and star schemas build on dimensional modeling.
- **Ch 10**: MDW and lakehouse implement Lambda/Kappa patterns.
- **Ch 16**: Hadoop/Databricks/Snowflake are the engines for SMP/MPP and stream processing.
