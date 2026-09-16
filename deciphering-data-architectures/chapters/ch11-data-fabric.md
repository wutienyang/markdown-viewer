# Chapter 11: Data Fabric

## Core Idea
A data fabric is an MDW plus additional technologies to source, secure, and serve more data. The author's pragmatic definition: it's a data fabric if it uses at least three of eight key components — but there is no bright line, and the philosophy ("consume any and all data") matters as much as the technology.

## Frameworks Introduced
- **Data Fabric**: an evolution of the MDW that can consume any data regardless of size, speed, or type.
  - When to use: large data volumes (>10 TB), real-time needs, strong governance/security, and multinational compliance.
  - How: build the MDW's five stages, then add fabric components (access policies, catalog, MDM, virtualization, real-time, APIs, services, products).
- **The "three of eight" test**: the author's rule of thumb — an architecture is a data fabric if it uses at least three of the eight components.
  - When to use: deciding whether you've built an MDW or a fabric.
  - How: count which of the eight features are present; ≥3 → fabric (with no strict line).
- **Eight fabric components**: data access policies, metadata catalog, MDM, data virtualization (optional per the author), real-time processing, APIs, services, products.

## Key Concepts
- **Data access policies**: governance rules controlling who accesses what, how, and when — the key to governance/compliance (GDPR, HIPAA).
- **Metadata catalog**: a searchable repository of data assets + lineage (origin, transformations, storage) so data is discoverable and trusted.
- **Data lineage**: the history of a piece of data — where it came from, how it was transformed — used for trust and compliance.
- **APIs**: standardized data access that hides the underlying location; update the API, not every caller.
- **Services / products**: generic reusable code blocks, or an entire fabric bundled and sold (e.g. an industry fabric).

## Mental Models
- Think of the fabric as "weaving" — it accumulates data from across the company and delivers it to whoever needs it.
- Use the author's divergence from Gartner as a judgment lesson: Gartner centers virtualization + AI/ML automation; the author treats virtualization as optional and focuses on what exists *today*.
- Think of the fabric as "MDW + ≥3 of 8 features" — an upgrade path, not a separate planet.

## Anti-patterns
- **Chasing Gartner's "intelligent data fabric"**: much of the AI/ML knowledge-graph automation doesn't exist yet — build for today.
- **Adding fabric complexity for a small business**: with limited sources and simple processing, an MDW suffices.
- **Adopting fabric without in-house expertise**: the added complexity makes troubleshooting harder.

## Reference Tables
The eight data fabric components vs. their role:

| Component | Role |
|---|---|
| Data access policies | Governance, security, compliance |
| Metadata catalog | Discoverability + lineage |
| Master data management | Single authoritative master data |
| Data virtualization | Optional logical view (author's view) |
| Real-time processing | Immediate insights |
| APIs | Standardized, location-hiding access |
| Services | Reusable generic code blocks |
| Products | Bundled, sellable fabric |

## Key Takeaways
1. A data fabric = MDW + ≥3 of 8 features (author's pragmatic line).
2. The fabric's biggest wins are real-time processing, unified governance, and consuming any data.
3. A metadata catalog with lineage is what makes data discoverable and trustworthy.
4. Data virtualization is optional, not definitive — don't let industry gatekeeping mislead you.
5. Skip the fabric if you have small data or lack expertise; the added complexity isn't free.

## Connects To
- **Ch 6**: the fabric's components (catalog, MDM, virtualization) are defined here.
- **Ch 10**: the fabric is the MDW's evolution.
- **Ch 12**: the lakehouse takes the opposite path — removing the RDW instead of adding technology.
- **Ch 13**: the mesh decentralizes; the fabric is still centralized.
