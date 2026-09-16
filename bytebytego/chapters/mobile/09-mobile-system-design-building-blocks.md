# 09: Mobile System Design Building Blocks

## Core Idea
A reference library of the concepts that recur across every MSD case study — architecture patterns, storage, networking, and feature-delivery operations. Use it as the vocabulary to justify design decisions, not as a checklist to exhaust.

## Design Framework / Approach
- **Architecture**: layered UI + data (+ optional domain) per Google's guide; Unidirectional Data Flow (UDF) + reactive programming; repository pattern; dependency injection over Service Locator.
- **Storage**: choose via a decision tree — secure storage for credentials/keys, relational DB for structured/queried data, key-value for preferences, non-relational (Realm/Firebase) for flexible schemas, files for binary.
- **Networking**: HTTP/REST conventions (verbs→CRUD, plural nouns, nested sub-resources, `/v1` versioning); JSON default, Protobuf/gRPC for performance; token-based auth (JWT access + refresh) with certificate pinning/MFA.
- **Pagination**: offset for stable moderate datasets; cursor-based for frequently-updated large datasets; tune `limit` (~20-50) or adapt dynamically.
- **Feature delivery**: gradual/staged rollouts, force upgrading (hard/soft/tiered), feature flags + remote config + A/B testing, observability, localization, privacy, accessibility, push, app size, CI/CD, security.
- **Device fragmentation**: modularize shared logic; adapt UI/navigation per form factor; manage min/target OS versions and API deprecation.

## Key Concepts & Components
- **Separation of concerns / SSOT / immutable state**: foundations of a predictable, testable data flow.
- **Repository + data sources**: repository centralizes business logic; each data source touches one backend/db/file.
- **CDN**: serve static content near users to cut latency and origin load (trade cost/freshness).
- **JWT auth flow**: access token (15-30 min) + refresh token stored in Keystore/Keychain; renew on 401.
- **Push notifications**: FCM/APNs as a supplementary channel — throttling, payload limits, and user opt-outs make it unreliable for critical delivery.

## Trade-offs & Anti-patterns
- **Service Locator over DI**: masks dependencies and complicates testing.
- **Offset pagination on live feeds**: performance degradation and duplicates.
- **Relational DB for everything**: overkill for tiny preference data; key-value is simpler.
- **Feature flags without cleanup**: accrue technical debt — retire after launch.
- **Push as primary delivery**: never guarantee delivery — design alternative mechanisms.

## Key Takeaways
1. Reach for relational DB + SSOT as the default data layer; deviate only with a stated reason.
2. Justify every storage/protocol/pagination choice by walking the decision tree aloud.
3. Treat ops concerns (rollouts, flags, observability, app size) as senior differentiators.

## Connects To
- **01-a-framework-for-mobile-sd-interviews**: the reference terms you invoke in steps 1-4.
- **02** through **08**: each case study instantiates a subset of these blocks.
- **10-quick-reference-cheat-sheet-for-msd-interview**: the condensed domain checklist.
