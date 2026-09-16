# Chapter 1: Big Data

## Core Idea
Big data is not about size — it is about handling *all* data (volume, velocity, variety, plus veracity, variability, value) and turning it into business decisions. The goal of any architecture is to put the right information in the right format in front of the right people, fast, without IT as a bottleneck.

## Frameworks Introduced
- **The Six Vs of Big Data**: the author's characterization of data — Volume, Variety, Velocity, Veracity, Variability, Value.
  - When to use: describing *any* dataset before architecting for it; each V drives different product/design choices.
  - How: classify incoming data along all six axes — the combination, not any single V, determines the architecture.
- **Enterprise Data Maturity Stages**: the four stages of an organization's data sophistication.
  - When to use: assessing where a company sits before recommending an architecture.
  - How: locate the org as Reactive → Informative → Predictive → Transformative; each stage implies different architecture and tooling.
- **Self-Service BI**: an end state where nontechnical users build their own reports without IT.
  - When to use: as the north-star requirement of nearly every data solution.
  - How: IT does the up-front modeling so users can drag-and-drop fields; always ask "how easy will it be for people to build their own reports?"

## Key Concepts
- **Spreadmart**: an informal, spreadsheet-based data mart — scattered Excel files outside governance. Sign of maturity Stage 1 (Reactive).
- **Structured / semi-structured / unstructured / binary data**: relational rows; CSV/XML/JSON/logs; emails/documents/PDFs; images/audio/video. Drives "variety" decisions.
- **Batch vs. real-time streaming**: nightly batch vs. sub-second ingestion; determines product choice (velocity).
- **Predictive analysis**: using statistical/ML algorithms on historical data to predict future events, enabling proactive rather than reactive action.
- **Business intelligence (BI)**: collecting, analyzing, and using data to make more informed decisions.
- **Traditional BI vs. self-service BI**: IT-queue request model vs. end users building reports directly.
- **Digital transformation**: embedding technology across the business to change how value is delivered; data maturity is a key part of it.
- **"Data is the new oil"**: data, like oil, must be extracted, refined, and processed to be useful, and is a source of competitive advantage.

## Mental Models
- Think of big data as "all data, no matter size, speed, or type" — the word *big* is a distraction.
- Use the maturity stages as a diagnostic: rearview-mirror reporting (Stages 1–2) vs. predictive/transformative (Stages 3–4).
- Value is "the most important V" — evaluate every architecture choice by whether it produces business value, not novelty.

## Anti-patterns
- **Building before understanding**: a company spent $100M over two years on the wrong architecture and had to scrap it — the book's central cautionary tale.
- **Spreadmarts everywhere**: decentralized spreadsheets cause inconsistency, no governance, limited scalability, and duplicated effort.
- **Traditional BI as default**: an IT-request queue makes IT a bottleneck and delays value by days/weeks/months.
- **Over-indexing on one V**: designing for volume while ignoring variety/veracity leads to brittle systems.

## Key Takeaways
1. Describe any dataset with the six Vs before choosing technology.
2. Locate the organization's data-maturity stage; Stages 3–4 are this book's focus.
3. Design for self-service BI: the end user — who knows the data best — should build reports, not IT.
4. Always ask "how easy will it be for people to build their own reports?" as the design litmus test.
5. Validate data on ingest (veracity) — unreliable sources corrupt everything downstream.

## Connects To
- **Ch 2**: the six Vs become the criteria for comparing architecture types.
- **Ch 3**: the ADS questionnaire operationalizes these Vs into discovery questions.
- **Ch 6**: spreadmarts and master data management address Stage-1 data chaos.
- **Ch 16**: cloud migration is the enabler of Stages 3–4.
