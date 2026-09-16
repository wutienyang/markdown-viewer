# 11: Trees

## Core Idea
Use trees when data is hierarchical — nodes with one parent and zero or more children (binary tree = up to two children). Recognize this pattern when a problem involves any tree-shaped structure: filesystems, XML/JSON, parse trees, or when an interviewer hands you a root node. Choose your traversal by what must happen first: **preorder** (process node before children, e.g. serialize/clone), **inorder** (process left→node→right, yields BST nodes in sorted order), **postorder** (process children before node, e.g. heights), and **BFS/level-order** (process level by level, e.g. right-side view, width).

## Technique / Template
- **DFS** is recursive; space = call-stack height O(h). Use a stack to convert any recursive DFS to iterative (avoid stack overflow when `h` is large).
- **BFS/level-order** uses a queue; the current `len(queue)` is the size of the current level — capture it to process one level at a time.
- **BST** recurrences: a node's value is bounded by `(lower, upper)`; pass updated bounds down. Inorder traversal of a BST is sorted.
- Common postorder pattern: compute subtree result, return a single-path value, and update a global answer (`max`, `lca`).

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Invert Binary Tree | Swap left/right children of every node; any traversal works | O(n) time / O(n) space |
| Balanced Binary Tree Validation | Return subtree height, propagate `-1` to mark imbalance upward | O(n) / O(n) |
| Rightmost Nodes of a Binary Tree | Level-order traversal; record last node of each level | O(n) / O(n) |
| Widest Binary Tree Level | Assign array-style index (`left=2i+1`, `right=2i+2`); width = `right-left+1` | O(n) / O(n) |
| Binary Search Tree Validation | DFS passing (lower, upper) bounds; fail if `val` out of bounds | O(n) / O(n) |
| Lowest Common Ancestor | LCA when p/q found in exactly 2 of {node, left, right} | O(n) / O(n) |
| Build Binary Tree From Preorder and Inorder | Preorder[0] is root; inorder splits left/right; hash map for O(1) index lookup | O(n) / O(n) |
| Maximum Sum of a Continuous Path | Return single-branch gain `val+max(L,R)`; track `val+L+R` as global max, clamp negatives to 0 | O(n) / O(n) |
| Binary Tree Symmetry | Compare `left.left`↔`right.right` and `left.right`↔`right.left` | O(n) / O(n) |
| Binary Tree Columns | BFS assigning column id (`-1` left, `+1` right); group by column in hash map | O(n) / O(n) |
| Kth Smallest Number in a BST | Inorder traversal is sorted; iterative stack stops at kth node | O(n) / O(n) (or O(k+h)/O(h)) |
| Serialize and Deserialize a Binary Tree | Preorder + `#` for null markers makes reconstruction unambiguous | O(n) / O(n) |

## Anti-patterns
- **Forgetting null markers in serialization**: without explicit nulls, a preorder string is ambiguous and deserializes to the wrong tree.
- **Returning a branched path from recursion**: in max-path problems, returning a multi-branch sum to the parent creates an invalid split path — return only a single continuous path.
- **Not propagating imbalance**: returning only height hides a deeper imbalance; bubble up a sentinel (e.g. `-1`).
- **Modifying input without asking**: marking visited cells in-place (or on the tree) should be confirmed with the interviewer.

## Key Takeaways
1. Pick traversal by order of processing: preorder for root-first, inorder for sorted/BST, postorder for bottom-up values, BFS for level-based questions.
2. Convert recursion to iteration with an explicit stack whenever depth could exceed the recursion limit.
3. Use a `len(queue)` snapshot for level-order; assign indices for positional/width problems.
4. BST = bounded values (`lower`/`upper`) and sorted inorder — exploit both.

## Connects To
- **Graphs**: tree traversals (DFS/BFS) generalize to graph traversals; a tree is an acyclic connected graph.
- **Stacks**: iterative DFS and inorder traversal are stack-based.
- **Heaps**: a min/max-heap can replace sorting for "kth" queries on BST-like data.
- **Serialize/Deserialize**: pairs with **Backtracking** (recursive build) and **Graph Deep Copy** (clone via traversal).
