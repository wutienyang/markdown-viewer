# Chapter 1: Writing Good Commits

## Core Idea

A commit message is documentation that never goes out of date. Write the *why*,
because the diff already shows the *what*.

## The format

```
type(scope): subject

body
```

- **Subject** — under ~50 characters, imperative mood ("add", not "added").
- **Body** — the motivation and any non-obvious context.

## Good vs bad

**Bad:**

```
fix stuff
```

**Good:**

```
fix(parser): handle empty CSV rows without crashing

The upstream feed occasionally emits a trailing empty line; the split
helper assumed at least one column and threw on index 0.
```

## Mental models

- Think of `git log` as your changelog; write for the person reading it in six months.
- A commit should do **one** thing. If you write "and", split it.

## Anti-patterns

- **Vague subjects** ("update", "changes", "fix") — they communicate nothing.
- **Mixing unrelated changes** — makes `git revert` and review harder.

## Key Takeaways

1. Write the *why*, not the *what*.
2. Keep the subject imperative and short.
3. One logical change per commit.
