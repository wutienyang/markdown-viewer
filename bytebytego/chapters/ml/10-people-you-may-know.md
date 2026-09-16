# 10: People You May Know

## Core Idea
Design a LinkedIn-style PYMK system that recommends connections, framed as **edge prediction** on the social graph using a **Graph Neural Network (GNN)**.

## Design Framework / Approach
Frame as edge prediction: the model takes the full social graph and predicts the probability of an edge between two users (vs pointwise LTR, which ignores social context). Use a **GNN** to produce node embeddings, then rank potential connections by dot-product similarity. Optimize serving with **friends-of-friends (FoF)** narrowing and **batch pre-computation**.

## Key Concepts & Components
- **Pointwise LTR vs edge prediction**: LTR predicts pair probability from user features only; edge prediction adds graph structure (one/two-hop neighborhoods) for more accurate predictions.
- **Graph prediction tasks**: graph-level (classify compound), node-level (detect spammer), **edge-level** (predict connection).
- **GNN**: learns node embeddings from graph + node/edge attributes; architectures include GCN, GraphSAGE, GAT, GIN.
- **Feature engineering**: user demographics, connection/follower counts, account age, reactions received; **user-user affinities** — education/work affinity (schools in common, same major/industry) and social affinity (profile visits, mutual connections, **time-discounted mutual connections**).
- **Training data**: snapshot graph at time t, predict edges formed by t+1 (positive = connects, negative = otherwise).
- **Offline metrics**: ROC-AUC (GNN model), **mAP** (PYMK ranking); online: connection requests sent / accepted in last X days.
- **Serving efficiency**: **FoF** narrows 1B→1M candidates (92% of new friendships come via FoF); **batch pre-compute** PYMK for active users and cache for days.

## Trade-offs & Anti-patterns
- **Requests-sent metric** overstates growth — requests only form connections when accepted; track accepted requests.
- **Online prediction** is too slow at 300M DAU — prefer batch pre-computation since the graph evolves slowly.
- **Frequent users dominate training data** — bias toward popular users compounds; be deliberate about equity.

## Key Takeaways
1. Prefer edge prediction over pointwise LTR when social context (mutual connections) matters.
2. Narrow candidates with FoF, then score with a GNN; batch pre-compute to hide latency.
3. Weight mutual connections by recency (time-discounted) to reflect a growing vs stagnant network.

## Connects To
- **06-event-recommendation-system** / **09-personalized-news-feed**: social/affinity features and ranking patterns recur.
- **08-similar-listings**: co-occurrence/graph-based embedding learning analog.
