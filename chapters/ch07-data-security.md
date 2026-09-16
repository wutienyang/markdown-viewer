# Chapter 7: Data Security Design Patterns

## Core Idea
Protect data confidentiality, integrity, and privacy across storage and transit by addressing four security concerns: compliance-driven data removal, fine-grained access control, data protection (encryption/anonymization), and secure connectivity.

## Frameworks Introduced
- **Vertical Partitioner**: split each row into a mutable part and an immutable/PII part written to separate storage, so removal targets a small, deduplicated table.
  - When to use: when starting a new project or migrating workloads and you need an efficient "right to be forgotten" pipeline.
  - How: identify split columns plus a merge key (e.g. `user_id`); adapt ingestion to project columns into two datasets; deduplicate the immutable side; delete via `DELETE`/tombstone on the small table.
- **In-Place Overwriter**: delete personal data directly in place, overwriting storage without reorganizing it.
  - When to use: when you inherit a legacy system (terabytes, time-partitioned) with no personal-data strategy and no budget to refactor.
  - How: run `DELETE ... WHERE` if the store supports it (plus vacuum/compaction); otherwise simulate by filtering the whole dataset into a staging area and promoting it atomically.
- **Fine-Grained Accessor for Tables**: restrict access to specific columns and rows of a table.
  - When to use: when authorized table users must still not read every column/row (warehouses, lakehouses).
  - How: column-level via `GRANT`, catalog policy tags, or masking functions; row-level via `ROW FILTER`/row access policies/RLS, or a view with `WHERE col = current_user`.
- **Fine-Grained Accessor for Resources**: scope cloud permissions to the minimum resources each job/identity needs (least privilege).
  - When to use: after an audit flags overly broad permissions (e.g. a job that can overwrite all datasets).
  - How: resource-based policies (attach to the bucket/stream) or identity-based policies (attach to the role/identity), optionally with prefix or tag/condition scoping.
- **Encryptor**: encrypt data at rest and in transit so stolen/intercepted data is unusable without keys.
  - When to use: when you must protect data even if access controls or the physical layer are compromised.
  - How: server-side (KMS/Key Vault) or client-side encryption for at-rest; enforce TLS protocol versions for in-transit.
- **Anonymizer**: remove or alter sensitive data so rows become unidentifiable.
  - When to use: when sharing a PII dataset with partners who lack consent to see personal values.
  - How: data removal (drop columns), perturbation (add noise), or synthetic data replacement (generator/model substitutes values).
- **Pseudo-Anonymizer**: replace PII with usable but reversible/derivable substitutes.
  - When to use: when shared data must hide real values yet retain business meaning for analytics.
  - How: masking (`XXX-XX-1040`), tokenization (vault-mapped substitutes), hashing (SHA-256, irreversible), or encryption (key-reversible).
- **Secrets Pointer**: store credentials in a secrets manager and reference them by name instead of hardcoding values.
  - When to use: when login/password or API keys must never live in the Git repository.
  - How: retrieve secret values at runtime via the secrets-manager client; optionally cache with a refresh/fail-restart strategy.
- **Secretless Connector**: authenticate with no credentials at all, via cloud IAM or certificates.
  - When to use: when a small team wants to avoid managing any API keys for cloud-managed resources.
  - How: IAM-based (assign a role/service account with an access policy) or certificate-based authentication via a CA.

## Key Concepts
- **PII / PHI / IP**: Personally identifiable information, protected health information, and intellectual property — the data classes that drive removal, access, and anonymization requirements.
- **Right to be forgotten**: the GDPR/CCPA obligation to delete a user's data on request, which the removal patterns satisfy.
- **Vertical vs. horizontal partitioning**: vertical splits columns of a row across stores; horizontal groups related rows (e.g. date partitions).
- **Tombstone message**: a record with the removed key and a null value that Kafka compaction uses to delete prior keyed records.
- **Deletion vector vs. rewrite**: two delete strategies in table formats — mark removed rows in a side file (reader drops them) vs. rewrite all-but-removed rows (writer-heavy).
- **Column-level vs. row-level security**: GRANT/tags/masking limit columns; dynamic `WHERE` conditions limit rows.
- **Least privilege**: grant each user/role only the resources it needs right now (the "at-least privilege" principle).
- **Anonymization vs. pseudo-anonymization**: anonymized data stays unidentifiable even when combined; pseudo-anonymized data can become identifiable when joined with other datasets.
- **Secrets manager**: a central service (AWS Secrets Manager, GCP Secret Manager) storing credentials, enabling monitoring and rotation without code changes.

## Mental Models
- Use the Vertical Partitioner when you design a new pipeline and want removal to touch one deduplicated row instead of thousands.
- Use the In-Place Overwriter when you must retrofit compliance onto an untouched legacy store.
- Use the Anonymizer when the consumer must never re-identify a user; use the Pseudo-Anonymizer when the consumer still needs business-meaningful values.
- Use the Secretless Connector when there are no credentials to manage at all, and the Secrets Pointer when you still must use a login/password.

## Anti-patterns
- **Storing credentials in the Git repository**: a single accidental push leaks them and, for request-billed APIs, raises billing.
- **Replacing a dataset in place without a staging area**: a retried or failed overwrite job leaves partially valid data or destroys the original with no rollback.
- **Treating pseudo-anonymization as full anonymization**: combining masked datasets (e.g. country + role) can re-identify individuals — a false sense of security.
- **Over-relying on wildcard prefixes for policies**: `visits*` simplifies maintenance but violates least privilege for future resources.
- **Leaking secrets through logs**: even with a secrets manager, printing credentials to logs defeats the pointer.

## Code Examples
```python
def split_visit_attributes(visits_to_save: DataFrame, batch_number: int):
    visits_to_save.persist()
    visits_without_user_context = (visits_to_save
        .filter('user_id IS NOT NULL AND context.user.login IS NOT NULL')
        .withColumn('context', F.col('context').dropFields('user'))
        .select(F.col('visit_id').alias('key'), F.to_json(F.struct('*')).alias('value')))
    user_context_to_save = (visits_to_save.selectExpr('context.user.*', 'user_id')
        .select(F.col('user_id').alias('key'), F.to_json(F.struct('*')).alias('value')))
    visits_to_save.unpersist()
```
- **What it demonstrates**: Vertical Partitioner splitting a row into two Kafka topics (visit events vs. deduplicated user context) in Spark Structured Streaming's `foreachBatch`.

```sql
GRANT SELECT(id, login, registered_datetime) ON dedp.users TO user_a;

ALTER TABLE dedp.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_row_access ON dedp.users USING (login = current_user);
```
- **What it demonstrates**: column-level (`GRANT`) and row-level (RLS policy) fine-grained access in PostgreSQL.

```python
secretsmanager_client = boto3.client('secretsmanager')
db_user = secretsmanager_client.get_secret_value(SecretId='user')['SecretString']
db_password = secretsmanager_client.get_secret_value(SecretId='pwd')['SecretString']
spark_session.read.option('driver', 'org.postgresql.Driver').jdbc(
    url='jdbc:postgresql:dedp', table='dedp.devices',
    properties={'user': db_user, 'password': db_password})
```
- **What it demonstrates**: the Secrets Pointer — the Spark job references secret names, resolving values at runtime from AWS Secrets Manager.

## Reference Tables

| | Anonymizer | Pseudo-Anonymizer |
|---|---|---|
| Goal | Make rows unidentifiable | Hide values but keep business meaning |
| Techniques | removal, perturbation, synthetic replacement | masking, tokenization, hashing, encryption |
| Re-identification risk | None, even when combined with other data | Possible when joined with other datasets |
| Data utility | Low (information loss, altered values) | Higher (values stay recognizable) |
| Key management | None | Token vault / encryption keys (if used) |

| Approach | Level | Examples |
|---|---|---|
| Column-level | GRANT on columns | Redshift, PostgreSQL |
| Column-level | Catalog policy tags | GCP BigQuery |
| Column-level | Masking functions | Databricks Unity Catalog, Snowflake |
| Row-level | Dynamic WHERE / ROW FILTER / row access policy | Databricks, Redshift, BigQuery, Snowflake |
| Row-level | View with `current_user` guard | Any relational DB |
| Row-level (NoSQL) | IAM condition on `dynamodb:LeadingKeys` | AWS DynamoDB |

## Worked Example
The blog data analytics platform enriches real-time visits with geolocation from an external login/password API. To stop a repeat of a past credential leak that spiked billing, the team applies the Secrets Pointer pattern: they store the API login and password in AWS Secrets Manager and change the enrichment job to fetch `get_secret_value(SecretId='user')` and `SecretId='pwd'` at runtime instead of hardcoding them. The job now protects access on two levels — it must first be authorized to read the secrets manager, and then the API validates the credentials themselves. Because the same secret names are generated by the Terraform stack in every environment, the code carries no per-environment credential files.

## Key Takeaways
1. Data removal is a compliance feature (GDPR/CCPA), and its cost depends on data layout: the Vertical Partitioner deletes one deduplicated row, the In-Place Overwriter rewrites everything.
2. Fine-grained access splits into two worlds: logical tables (column/row-level security in the warehouse) and physical cloud resources (IAM least-privilege policies).
3. Encryption covers two layers: at rest (KMS/Key Vault, client- or server-side) and in transit (TLS), each with its own overhead and maintenance.
4. Anonymization destroys value to guarantee non-identification; pseudo-anonymization preserves value but only weakens identification — combined datasets can re-identify users.
5. Access control + encryption are not enough: connectivity must be secured by moving credentials to a secrets manager (pointer) or eliminating them via IAM/certificates (secretless).
6. Overwriting data is irreversible and failure-prone — stage first, promote atomically, and enable versioning or a Proxy for rollback.

## Connects To
- **Ch 6**: data flow patterns create the continuously flowing datasets that security must protect in transit and at rest.
- **Ch 8**: vertical/horizontal partitioning and table formats (Delta, Iceberg, Parquet metadata) are the storage foundations the removal and access patterns rely on.
- **Ch 4**: idempotency patterns (e.g. Fast Metadata Cleaner) pair with Secrets Pointer cache-refresh and removal-job retries.
- **Ch N (Dataset Tracker)**: exposing lineage/documentation mitigates the querying complexity that vertical partitioning introduces.
- **GDPR / CCPA**: the regulatory drivers for the "right to be forgotten" and data-sharing consent.
- **Phil Karlton's proverb**: "two hard things — cache invalidation and naming things" — directly applies to credential caching in the Secrets Pointer.
