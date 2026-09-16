# Chapter 2: Types of Data Architectures

## Core Idea
There is no one-size-fits-all data architecture. This chapter introduces the six major types — relational data warehouse, data lake, modern data warehouse, data fabric, data lakehouse, and data mesh — and their evolution, so you can reason about which fits a given use case.

## Frameworks Introduced
- **Data Architecture (definition)**: a high-level architectural approach and concept to follow, plus a set of technologies and the flow of data used to capture big data.
  - When to use: as the blueprint before building any data solution.
  - How: decide on the approach, the technologies, and the data flow; there is no flowchart that picks it for you.
- **Schema-on-write vs. schema-on-read**: define the schema before data lands (relational) vs. apply schema at query time (data lake).
  - When to use: schema-on-write when consistency/integrity dominate; schema-on-read when flexibility and raw storage dominate.
  - How: schema-on-write requires up-front table/field design; schema-on-read lets data land raw and be structured at read.
- **Six Architecture Types** (the book's taxonomy):
  - Relational Data Warehouse (1984), Data Lake (2010), Modern Data Warehouse (2011), Data Fabric (2016), Data Mesh (2019), Data Lakehouse (2020).
  - When to use: each gets its own chapter; the Table 2-1 comparison matrix is the decision starting point.

## Key Concepts
- **Relational database**: tables of rows/columns with key-based relationships, queried via SQL; the model proposed by E.F. Codd (1970).
- **Relational Data Warehouse (RDW)**: a relational database optimized for analytics/BI, with tied-together compute + relational storage, transaction support, audit trails, schema enforcement.
- **Data lake**: object storage with no associated compute engine; schema-on-read; stores raw data in its natural format (HDFS started it, most now in the cloud).
- **Modern Data Warehouse (MDW)**: data lake + RDW side by side — lake for staging/ML, warehouse for serving/reporting.
- **Data Fabric**: an evolution of MDW with more technology to source, secure, and serve more data — a "fabric" that ingests any data.
- **Data Lakehouse**: a single repository (data lake) with a transactional storage layer (Delta Lake, Iceberg, Hudi) replacing the RDW.
- **Data Mesh**: a decentralized concept (not a technology) where domains own and serve their own data; introduced by Zhamak Dehghani (2019).
- **OLTP / CRUD**: transactional systems doing create/read/update/delete; the reason RDWs were invented (offload reporting from operational databases).

## Mental Models
- Think of the data lake as "a glorified filesystem" — storage only, no compute.
- Think of the MDW as "best of both worlds" — the lake failed to replace the warehouse, so combine them.
- Think of the data mesh as "a concept, not a technology" — there is no data-mesh-in-a-box.
- Every architecture is a trade-off; none is "wrong," each fits only certain use cases.

## Anti-patterns
- **Template-driven architecture**: predefined templates fail to account for specific requirements and change over time.
- **"One technology to do everything"**: data lakes were hyped this way and failed — Hortonworks and MapR went out of business.
- **Treating the lake as a BI endpoint**: asking end users to write Hive/Python in Jupyter failed because most users lack those skills.
- **Assuming centralized is always right**: centralization creates ownership, quality, and scaling bottlenecks — the data mesh's motivation.

## Reference Tables
Table 2-1 (abridged) — high-level comparison of the six architectures:

| Characteristic | RDW | Data lake | MDW | Data fabric | Data lakehouse | Data mesh |
|---|---|---|---|---|---|---|
| Year introduced | 1984 | 2010 | 2011 | 2016 | 2020 | 2019 |
| Centralized/Decentralized | Centralized | Centralized | Centralized | Centralized | Centralized | Decentralized |
| Storage type | Relational | Object | Relational + object | Relational + object | Object | Domain-specific |
| Schema type | Schema-on-write | Schema-on-read | Both | Both | Schema-on-read | Domain-specific |
| Data security | High | Low–medium | Medium–high | High | Medium | Domain-specific |
| Time to value | Medium | Low | Low | Low | Low | High |
| Total cost | High | Low | Medium | Medium–high | Low–medium | High |
| Supported use cases | Low | Low–medium | Medium | Medium–high | High | High |
| Maturity of technology | High | Medium | Medium–high | Medium–high | Medium–high | Low |
| Company skill set needed | Low | Low–medium | Medium | Medium–high | Medium–high | High |

## Key Takeaways
1. A data architecture = approach + technologies + data flow; design it up front, before picking products.
2. Schema-on-write vs. schema-on-read is the fundamental relational-vs-lake divide.
3. The data lake's failure as a BI tool birthed the MDW (lake + warehouse together).
4. The lakehouse adds a transactional layer (Delta/Iceberg/Hudi) on top of the lake to replace the RDW.
5. The data mesh is decentralized by design and is an enterprise-only, high-skill, low-maturity option.

## Connects To
- **Ch 1**: the six Vs are the raw inputs that differentiate these architectures.
- **Ch 4–5**: deep dives on the RDW and data lake.
- **Ch 10–14**: one chapter per modern architecture type.
- **Ch 16**: Hadoop/Databricks/Snowflake as the technologies behind these patterns.
