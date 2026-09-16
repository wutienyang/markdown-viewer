# Chapter 2: Branching Strategies

## Core Idea

Pick the lightest branching model that fits how you ship.

## Two models

### Trunk-based development

Everyone commits to `main` (or short-lived branches merged within a day).

- **When**: continuous delivery, small teams, frequent deploys.
- **Why**: minimizes merge pain; keeps everyone in sync.

### Git Flow

Long-lived `develop` plus `feature/`, `release/`, and `hotfix/` branches.

- **When**: versioned releases that need stabilization windows.
- **Why**: isolates unfinished work, but adds ceremony and merge overhead.

## Choosing

| Signal | Use |
|--------|-----|
| Deploy many times a day | Trunk-based |
| Ship versioned releases | Git Flow |
| Small team, shared codebase | Trunk-based |
| Large team, parallel streams | Trunk-based + feature flags |

## Mental model

Branches are cheap; long-lived branches are expensive. The cost is not the
branch, it's the *merge*.

## Key Takeaways

1. Prefer trunk-based development unless releases demand otherwise.
2. Keep branch lifetimes short; merge daily.
3. Use feature flags to decouple "merged" from "released".
