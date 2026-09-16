# 07: Stacks

## Core Idea
Use a stack for **LIFO** processing — when the most recent item must be handled first. Recognize it for **nested structures** (parentheses, expressions), **reversing order**, or replacing recursion. A **monotonic stack** keeps values in increasing/decreasing order by popping order-breakers, giving efficient "next larger/smaller" answers.

## Technique / Template
- **Matching pairs**: push openers, pop when a closer matches the top.
- **Monotonic stack**: before pushing, pop everything `<=` (or `>=`) the new value; the top is then the answer.
- **Save/resume state**: push intermediate results + signs to defer nested-expression evaluation.
- **Two-stack queue**: push into `enqueue_stack`, pop from `dequeue_stack`; refill by transferring when empty.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Valid Parenthesis Expression | Push openers; closer must match the top of stack | O(n) time / O(n) space |
| Next Largest Number to the Right | Monotonic decreasing stack scanned right-to-left | O(n) time / O(n) space |
| Evaluate Expression | Treat all ops as signed addition; push result+sign at `(` | O(n) time / O(n) space |
| Repeated Removal of Adjacent Duplicates | Pop top if equal to current char, else push | O(n) time / O(n) space |
| Implement a Queue using Stacks | Two stacks; amortized O(1) dequeue via lazy transfer | O(1) amortized / O(n) space |
| Maximums of Sliding Window | Monotonic decreasing deque storing (value, index) | O(n) time / O(k) space |

## Anti-patterns
- **Forgetting a final emptiness check**: after matching, a non-empty stack means unclosed openers (valid parens).
- **Using a stack where both ends are needed**: LIFO can't drop stale front items — reach for a deque (window max).
- **Wrong monotonic direction**: popping `<=` vs `<` changes whether you keep ties, affecting "next strictly larger."

## Key Takeaways
1. "Most recent first" is the signal for a stack.
2. Monotonic stacks turn "next greater/smaller" into O(n) via amortized pops.
3. Deques extend stacks to two-ended access when you must also remove from the front.

## Connects To
- **Linked Lists**: a stack-based queue mirrors FIFO vs LIFO access trade-offs.
- **Sliding Windows**: Maximums of Sliding Window sits between both chapters (deque).
- **Hash Maps And Sets**: paren matching uses a map from opener→closer.
