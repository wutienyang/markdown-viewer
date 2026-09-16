# 10: Quick Reference Cheat Sheet for MSD Interview

## Core Idea
A recall checklist organized by domain (network, data management, feature development, performance, team/org) to consult mid-interview. Strategic selection matters more than covering every item.

## Design Framework / Approach
Scan the relevant domain before each interview step; pick topics that map to the specific design, then justify why they matter.

- **Network**: REST/GraphQL/gRPC/Protobuf; real-time via polling/SSE/WebSocket; idempotency keys, priority queuing, rate limiting, throttling; offset vs cursor pagination; offline-first + optimistic UI + conflict resolution; connectivity + exponential backoff; token lifecycle, biometric auth, encryption in transit/at rest, certificate pinning.
- **Data management**: storage options (key-value/relational/non-relational/secure), in-memory vs disk caching, eviction (TTL/size/priority), PII/GDPR, sync + delta sync, pre-fetching, background processing, UI states (loading/empty/error/content), input validation, local vs server search + typo tolerance.
- **Feature development**: force upgrade (soft/hard), safe rollout + feature flags + rollback, CI/CD, remote config, A/B testing, analytics, modularization, dependency injection, third-party lib evaluation, localization, accessibility, crash reporting.
- **Performance**: pre-fetching, app startup, stability, battery/CPU, network efficiency, app size, caching, lazy loading, concurrency, hardware acceleration, observability, business metrics.
- **Team & Organization**: design system, dev efficiency, code quality, risk management, developer experience, onboarding, infra constraints, business priorities, outage handling, tech stack.

## Key Concepts & Components
- **Real-time protocol pick**: polling → long polling → SSE → WebSocket, increasing in complexity and capability.
- **Eviction policies**: TTL (time), size-based, priority-based.
- **Auth**: token lifecycle, biometrics, recovery flows, certificate pinning.
- **Dynamic config**: remote config + feature flags decouple release from deploy.
- **Observability**: performance metrics, alerting, traces, business funnels.

## Trade-offs & Anti-patterns
- **Checkbox-exercise coverage**: attempting every item reads weaker than choosing a few with clear reasoning.
- **Ignoring scale signals**: DAU and geography should drive protocol/storage/performance choices.
- **Neglecting non-functional requirements**: reliability, battery, data usage, and privacy are core MSD signals.

## Key Takeaways
1. Treat this as a prompt sheet, not a scoring rubric.
2. Always tie a chosen consideration back to the system's unique constraints.
3. Prioritize the deep dive over breadth; two to three strong discussions beat surface coverage.

## Connects To
- **01-a-framework-for-mobile-sd-interviews**: consult during scope and deep-dive steps.
- **09-mobile-system-design-building-blocks**: the full definitions behind each checklist item.
- **00-introduction**: seniority rubrics these topics signal toward.
