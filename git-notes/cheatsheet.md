# Cheatsheet

## Everyday commands

| Task | Command |
|------|---------|
| Stage everything | `git add -A` |
| Commit with message | `git commit -m "type(scope): subject"` |
| See status | `git status -s` |
| See history | `git log --oneline --graph` |
| Undo last commit (keep changes) | `git reset --soft HEAD~1` |

## Commit message format

```
type(scope): subject

body — the "why", not the "what"
```

| Type | Use |
|------|-----|
| `feat` | new feature |
| `fix` | bug fix |
| `docs` | documentation only |
| `refactor` | no behavior change |
| `chore` | maintenance |

## Branching

- **Trunk-based** — short-lived branches merged into `main` daily.
- **Git Flow** — long-lived `develop` + release branches; use only when you ship versioned releases.

## Dangerous commands

| Command | Risk |
|---------|------|
| `git push --force` | overwrites remote history |
| `git reset --hard` | discards working changes |
| `git clean -fd` | deletes untracked files |

Prefer `--force-with-lease` over `--force`.
