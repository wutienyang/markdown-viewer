# Chapter 9: Approaches to Data Ingestion

## Core Idea
Getting data into the system is the first step and a business decision, not just a technical one. Choose ETL vs. ELT by data volume and environment, batch vs. real-time by latency tolerance, and remember reverse ETL closes the loop by pushing warehouse insights back into operational tools.

## Frameworks Introduced
- **ETL (Extract-Transform-Load)**: transform in-flight, then load. Mnemonic: "Early Transformation Leads."
  - When to use: smaller datasets, simpler transformations, relational-to-relational moves, and when data-quality control before load matters.
  - How: extract → clean/transform → load into destination.
- **ELT (Extract-Load-Transform)**: load raw first, transform in the destination. Mnemonic: "Every Load Transforms."
  - When to use: data lakes, high-volume unstructured/semi-structured data, big-data platforms.
  - How: land raw data once, transform in batches using the target's processing power; filter unneeded rows/columns during extract.
- **Reverse ETL**: move data from the warehouse back into operational (SaaS) systems.
  - When to use: operational analytics — putting mastered data and scores (churn, propensity, LTV) into Salesforce/CRM/apps.
  - How: sync mastered customer records or SQL-computed metrics into third-party tools to drive day-to-day actions.
- **Batch vs. real-time processing**: grouped, scheduled jobs vs. continuous, event-driven ingestion.
  - When to use: batch for high latency tolerance; real-time for low latency tolerance (fraud, traffic, trading).

## Key Concepts
- **Latency tolerance**: how long a business can wait for data — the core criterion for batch vs. real-time.
- **Operational analytics**: using DW-derived data for day-to-day decisions rather than only long-term strategy.
- **Lifetime value / product qualified lead / propensity score**: example metrics computed in SQL and pushed back out via reverse ETL.
- **Data governance**: policies for collecting, storing, securing, transforming, and reporting data, including compliance.
- **Center of Excellence (CoE)**: the governance hub that defines policies, roles, and standards.

## Mental Models
- Think of ETL as "clean before you store" and ELT as "store raw, then clean in place."
- Use the mnemonics: ETL = Early Transformation Leads; ELT = Every Load Transforms.
- Think of reverse ETL as "operationalize the insight" — a propensity score is only useful once it reaches the app.
- Use latency tolerance as the tiebreaker: can the process afford a day's delay? Batch. Must it react in seconds? Real-time.

## Anti-patterns
- **ETL for huge/unstructured data**: record-by-record transformation is slow and ETL tools have limited processing power and data-type support.
- **Long-running extracts**: the longer ETL pulls from the source, the more end users on that system suffer performance hits.
- **Rerunning buggy ETL from the source**: forces a re-extract; ELT avoids this because transformations rerun inside the target.
- **Real-time for high-latency-tolerant needs**: wastes continuous resources, raises cost and failure risk.
- **Ignoring governance up front**: projects fail because no one paid attention to data governance before building.

## Reference Tables
ETL vs. ELT:

| | ETL | ELT |
|---|---|---|
| Order | Extract → Transform → Load | Extract → Load → Transform |
| Transform location | In-flight | In the destination |
| Best for | Smaller datasets, relational sources, quality control | Data lakes, big/unstructured data |
| Data types | Limited | Wider variety |
| Rerun cost | Re-extract from source | Rerun inside target only |
| Quality/security | Strong (clean before load) | Flexible, batch transforms |

Batch vs. real-time:

| | Batch | Real-time |
|---|---|---|
| Latency tolerance | High | Low |
| Cost/resource risk | Lower, off-peak, retriable | Higher, continuous, complex recovery |
| Best for | Monthly bills, nightly loads | Fraud detection, Waze, trading |

## Worked Example
**Fraud detection is a latency decision.** A suspicious credit-card transaction must alert the cardholder *immediately* — not after the overnight batch. Banks use real-time processing precisely because the batch's latency would make the alert useless. Contrast with your electric bill, which is batch processing: the meter collects a month of usage, then the utility processes the whole batch into one bill. Same data-processing question, opposite answers, driven entirely by latency tolerance.

## Key Takeaways
1. Use ETL for smaller relational moves and quality control; ELT for lakes and big/unstructured data.
2. ELT extracts once and transforms in-place — faster batch transformations and no source re-extract on rerun.
3. Reverse ETL operationalizes warehouse insight: sync mastered data and computed scores into SaaS tools.
4. Choose batch vs. real-time by latency tolerance, not by trend.
5. Build a data governance framework and CoE *before* the warehouse, or the project risks failure.

## Connects To
- **Ch 4**: ETL is the classic RDW population pipeline.
- **Ch 5**: ELT is the natural fit for schema-on-read lakes.
- **Ch 6**: data virtualization is an alternative to ETL/ELT data movement.
- **Ch 10–12**: each modern architecture has a preferred ingestion pattern.
- **Ch 14**: governance and ownership concerns carry into the data mesh.
