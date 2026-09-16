# 13: Graphs

## Core Idea
Use graph algorithms when the problem models **relationships between entities** — nodes connected by edges. Recognize this pattern with words like "network", "connections", "reachability", "dependencies", "path", or a grid/matrix of connected cells. Key axes: directed vs undirected, weighted vs unweighted, cyclic vs acyclic. Pick DFS/BFS for traversal (both O(n+e) time, O(n) space), BFS for shortest paths on unweighted graphs, Dijkstra for non-negative weighted shortest paths, Kahn's (topological sort) for dependency/cycle detection, and Union-Find (DSU) for connectivity/merging.

## Technique / Template
- Represent graphs as an **adjacency list** (hash map / list of neighbors) — preferred for sparse graphs and neighbor iteration; use an adjacency matrix only for dense graphs or frequent edge-existence checks.
- Always track **visited** nodes (hash set, or mark a grid cell in-place).
- Multi-source BFS: seed the queue with all sources; each level = one "second"/distance step.
- Union-Find: `find` with **path compression** + `union` with **union-by-size** → amortized O(1) operations.
- Topological sort (Kahn's): count in-degrees, queue nodes with in-degree 0, decrement neighbors; cycle exists if not all nodes are processed.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Graph Deep Copy | Clone via DFS; hash map maps original→clone to avoid re-cloning | O(n+e) time / O(n) space |
| Count Islands | DFS flood-fill each land cell, marking visited in-place; count components | O(m·n) / O(m·n) |
| Matrix Infection | Multi-source BFS from all infected cells; each level = 1 second | O(m·n) / O(m·n) |
| Bipartite Graph Validation | 2-coloring via DFS; adjacent nodes must differ, else not bipartite | O(n+e) / O(n) |
| Longest Increasing Path | Matrix = DAG (only move to larger cells); DFS + memoization | O(m·n) / O(m·n) |
| Shortest Transformation Sequence | Words as nodes, one-letter edits as edges; BFS/level-order (bidirectional BFS optional) | O(n·L²) / O(n·L) |
| Merging Communities | Union-Find with path compression + union-by-size | amortized O(1) ops / O(n) |
| Prerequisites | Kahn's topological sort; detect cycle (can't process all nodes) | O(n+e) / O(n+e) |
| Shortest Path | Dijkstra with min-heap; `curr_dist > dist[node]` skips stale entries | O((n+e)log n) / O(n+e) |
| Connect the Dots | Kruskal's MST: sort edges, union until n-1 edges, skip cycles | O(n² log n) / O(n²) |

## Anti-patterns
- **Applying Dijkstra to negative weights**: the greedy "settle nearest node" assumption breaks; use Bellman-Ford instead.
- **Forgetting visited tracking**: cycles cause infinite loops in DFS/BFS.
- **Building a full adjacency list when neighbors are generated on demand**: for transformation problems, generate neighbors per-node to save space.
- **Using BFS for weighted shortest paths**: BFS ignores weights; it only gives shortest paths on uniform weights.

## Key Takeaways
1. Classify the graph first (weighted? directed? cyclic? grid?) — the classification picks the algorithm.
2. BFS (and multi-source BFS) solves shortest-path/level problems on unweighted graphs; Dijkstra handles non-negative weights.
3. Union-Find (path compression + union-by-size) is the go-to for connectivity, cycle-skip in MST, and merging sets in near-constant time.
4. A matrix is a graph: cells are nodes, 4-directional adjacency are edges — use direction vectors.

## Connects To
- **Trees**: graphs generalize trees; tree BFS/DFS carry over (a tree is an acyclic connected graph).
- **Heaps**: Dijkstra and Kth-selection both leverage a min-heap for "next closest".
- **Greedy**: Dijkstra, Kruskal, and Prim are greedy algorithms (local optimal → global).
- **Backtracking**: grid word-search combines graph DFS with backtracking; **Tries** augment that search.
