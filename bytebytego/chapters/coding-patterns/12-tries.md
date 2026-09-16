# 12: Tries

## Core Idea
Use a trie (prefix tree) when you need **efficient prefix search** or word validation across many strings that share prefixes. Recognize this pattern when the problem asks: "find all words starting with X", autocomplete/typeahead, dictionary lookup, or wildcard (`.`) matching. Each node holds a children map (char → node) and an end-of-word marker (`is_word` bool, or `word` string to recover the matched word). All operations on a word of length `k` are O(k).

## Technique / Template
- Node = `{children: dict, is_word: bool}` (or `word: str` at terminal nodes).
- `insert`: walk characters, creating missing child nodes; mark the last node as end-of-word.
- `search`: walk characters; fail early if a child is missing; return `is_word` of the final node.
- `has_prefix`: same as search but return `True` without checking `is_word`.
- Wildcards: on `.`, recurse into **all** child branches for the remainder (use an index, not substrings, to avoid O(k) copies).
- For board/DFS problems, store the full `word` at terminal nodes and mark it visited-in-place to avoid duplicate output.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Design a Trie | Shared prefixes save space; separate `search` vs `has_prefix` by checking `is_word` | insert O(k); search/prefix O(k) |
| Insert and Search Words with Wildcards | On `.` recurse over every child; backtrack to try all branches | insert O(k); search O(26^k) worst |
| Find All Words on a Board | Insert words into trie, DFS the board following trie children; backtrack visited cells with `#` | O(N·L + m·n·3^L) time / O(N·L) space |

## Anti-patterns
- **Using an array of size 26 without knowing the alphabet**: fine for lowercase-only, but a hash map handles arbitrary characters.
- **Re-checking `is_word` for prefix queries**: `has_prefix` must not require an end-of-word marker.
- **Adding duplicate words from a board**: a word can be found in multiple locations — null out the terminal `word` after recording it.
- **Copying substrings in recursive wildcard search**: pass an index, not `word[i:]`, to keep each call O(1) of slicing overhead.

## Key Takeaways
1. Tries trade space for O(k) prefix/insert/search independent of the number of stored words.
2. Pair a trie with DFS/backtracking for grid word-search to share prefix work across many words.
3. Choose the terminal marker by need: `is_word` for existence, `word` string when you must return the matched word.

## Connects To
- **Backtracking**: word-search problems combine trie traversal with DFS + undo (visited marking).
- **Graphs**: trie nodes form a DAG; DFS/BFS over children mirrors graph traversal.
- **Hash Maps And Sets**: the children map is a hash map; a bare set gives membership but not prefix structure.
- **Dynamic Programming**: wildcard search's "explore all branches" resembles DP state exploration.
