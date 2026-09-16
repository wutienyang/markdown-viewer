# 08: Similar Listings on Vacation Rental Platforms

## Core Idea
Design an Airbnb-like "similar listings" feature using a **session-based recommendation** approach: learn listing embeddings from click co-occurrence in search sessions, then retrieve nearest neighbors.

## Design Framework / Approach
Frame as a session-based recommendation (predict the next item given recent browsing). Train a shallow neural network to learn listing embeddings so co-occurring listings are close in embedding space. Improve the loss to favor **eventually-booked listings** (global context) and **same-region hard negatives**.

## Key Concepts & Components
- **Session-based vs traditional recommendation**: session-based models short-term, fast-evolving interests from recent browsing, not long-term profiles.
- **Search session**: a sequence of clicked listing IDs ending in a booked listing.
- **Training via sliding window + negative sampling**: positive pairs = central listing + context listings; negative pairs = central + random (or same-region) listings; label 1/0.
- **Loss**: sigmoid(dot product) → cross-entropy over positive and negative pair sets.
- **Two loss improvements**: add ⟨central, booked⟩ as positive (global context) to rank booked listings well; add same-region negatives to separate same-market listings that didn't co-occur.
- **Offline metric**: **average rank of the eventually-booked listing** across sessions.
- **Online metrics**: CTR, **session book rate** (sessions turning into bookings — maps directly to revenue).
- **Serving**: embedding fetcher (uses nearest-listing embedding for new listings) → nearest neighbor service (ANN) → re-ranking (user filters); index table precomputes embeddings.

## Trade-offs & Anti-patterns
- **Random negatives skew cross-region** — embeddings won't discriminate same-market listings; add same-region hard negatives.
- **Vanilla loss ignores the booked listing** — embeddings predict clicks but not bookings.
- **CTR doesn't measure bookings** — pair it with session book rate.

## Key Takeaways
1. Use session-based embeddings when recent interactions matter more than long-term history.
2. Add the eventually-booked listing as a global context and same-region negatives to align embeddings with business goals.
3. Handle new listings with a nearby-listing embedding heuristic until enough interaction data accrues.

## Connects To
- **01-visual-search-system**: same embedding + ANN retrieval pattern.
- **10-people-you-may-know**: co-occurrence/graph-based embedding learning analog.
