# Chapter 3: Rewriting History

## Core Idea

Rewrite history only when it is *yours* (not yet shared). Once pushed and pulled
by others, treat it as immutable.

## Tools

| Tool | Effect |
|------|--------|
| `git commit --amend` | edit the last commit |
| `git rebase -i` | reorder, squash, reword commits |
| `git reset --soft HEAD~1` | undo last commit, keep changes staged |

## Squash before merge

```bash
git rebase -i main
# mark the fixup commits as "s" (squash)
```

This collapses a branch's noise into one or two meaningful commits.

## The force-push rule

Never `git push --force`. Use:

```bash
git push --force-with-lease
```

`--force-with-lease` aborts if someone else pushed since you last fetched,
protecting you from silently clobbering their work.

## Anti-patterns

- **Rebasing shared branches** — rewrites commits others have based work on.
- **Force-pushing to `main`** — the fastest way to break the team.

## Key Takeaways

1. Rewrite only unpushed history.
2. Squash noisy fixup commits before merging.
3. Prefer `--force-with-lease` and never force-push `main`.
