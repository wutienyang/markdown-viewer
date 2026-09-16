# Chapter 6: Data Flow Design Patterns

## Core Idea
Design and coordinate every step required to generate a dataset — chaining tasks in a pipeline, creating parallel or exclusive branches, and managing dependencies between physically separated pipelines — at two levels: data orchestration (across one or many pipelines) and data processing (inside a single job).

## Frameworks Introduced

- **Local Sequencer**: Orchestrates tasks within the same pipeline or data processing job, decoupling one big component into smaller connected steps run sequentially (one after another).
  - When to use: A monolithic job has grown too large to name, fails often, and must restart from scratch; or a single processing job writes to multiple places and you need to replay only one part.
  - How: Order tasks by dataset dependency (task B runs after A if B needs A's data). Decide between orchestration-layer dependencies (separate tasks) vs processing-layer dependencies (steps within one job) using three criteria: separation of concerns (naming difficulty), maintainability (backfill/retry cost — e.g. re-running paid API readiness checks), and implementation effort (leveraging orchestrator's built-in task abstractions). Draw boundaries at restart boundaries and transactional units.

- **Isolated Sequencer**: Combines physically separated pipelines (managed by different teams) where one provides data to another, without merging them into one process.
  - When to use: Two teams must collaborate on a dataset but organizational boundaries prevent a single pipeline (e.g. data prep team delivers cleansed data to a visualization team).
  - How: First identify boundaries (providers vs consumers, or producer/consumer within your own scope when merging gets unreadable). Then pick a triggering mechanism: **data-based** (producer writes a Readiness Marker file, consumer listens for it — loosely coupled) or **task-based** (producer directly triggers the consumer pipeline via ExternalTaskMarker/Sensor — tightly coupled). Align scheduling frequency across the two pipelines or add skip conditions.

- **Aligned Fan-In**: Merges multiple parallel parent branches into a single child task that runs only after **all** direct parents succeed.
  - When to use: A daily aggregate must be built from hour-partitioned data, and downstream consumers want only the full view but you want to avoid one big job.
  - How: Define N parallel branches (e.g. 24 hourly loaders) that merge into a common task. At the processing layer, merge with `UNION` (vertical alignment — more rows, same columns) or `JOIN` (horizontal alignment — fewer rows, more columns). Benefits: faster feedback loops and isolated replay (only fix/replay the failed hour).

- **Unaligned Fan-In**: Relaxes the Aligned Fan-In constraint so a child task can run even when some parents do **not** succeed.
  - When to use: You'd rather release a partial dataset and fill gaps later than block downstream consumers when an hour fails to process.
  - How: Configure the orchestrator's trigger condition (e.g. Airflow `trigger_rule=TriggerRule.ALL_DONE`, or evaluate parent outcomes manually in less declarative tools like AWS Step Functions). Two scenarios: partial success → run the child on partial input; all parents fail → schedule an error-handling/fallback task. Mark partial output (completeness table, metadata tags, or an `is_approximate` flag).

- **Parallel Split**: One parent task fans out to at least two child tasks that run in parallel; their logic is isolated and the single common point is the shared parent.
  - When to use: Migrating a legacy pipeline where you must write the processed dataset to two places (old and new) until consumers switch; or one dataset feeds multiple teams.
  - How: Declare multiple downstream tasks after a common parent (DSL or `for` loop). At the processing layer, read/transform the common input **once** and materialize it (`persist()` in Spark, temp table in SQL); keep branches free of shared mutable state; allocate dedicated compute or autoscaling for parallel workload.

- **Exclusive Choice**: A common parent routes to **only one** of several downstream branches (the fan-out analogue of if-else).
  - When to use: You need to switch job versions on a date boundary (new job from Jan 1, 2024; backfills run the old job) without creating a new pipeline and losing execution history.
  - How: Add a condition-evaluator task before branching (Airflow `BranchPythonOperator`, Azure Data Factory "if condition" activity, Step Functions Choice) that returns the branch to follow. At the processing layer, use if-else/switch, or push the condition into the orchestration layer to keep outcomes explicit. Prefer metadata-based conditions (schema, parameters) over data-based ones since they're faster.

- **Single Runner**: Ensures there is always **at most one** execution of a given pipeline at a time.
  - When to use: Incremental/sequential processing (e.g. sessionization) where the current run's logic depends on the previous run's output — running in parallel would produce wrong results.
  - How: Set concurrency to 1 (`max_active_runs=1` + `depends_on_past=True` in Airflow; Data Factory `Concurrency`; EMR `StepConcurrencyLevel`). If unsupported, gate with a Readiness Marker waiting for the previous run.

- **Concurrent Runner**: Relaxes the concurrency constraint to allow **multiple** instances of a pipeline to run in parallel.
  - When to use: Ingesting independent datasets where sequential execution needlessly delays deliveries, or accelerating backfills of isolated executions.
  - How: Set concurrency > 1 (`max_active_runs=5`, `depends_on_past=False`). Balance the level against other pipelines and infrastructure; in multi-tenant setups use workload management to cap per-team capacity.

## Key Concepts
- **DAG**: A directed acyclic graph of tasks/edges describing a pipeline's execution dependencies (implicit in Airflow).
- **Fan-in**: A flow structure where multiple parent branches merge into one downstream task.
- **Fan-out**: A flow structure where one parent task is the input to multiple downstream tasks.
- **Sequencing**: Coordinating steps that follow each other in a specific order, locally or across isolated pipelines.
- **Trigger condition / rule**: The orchestrator setting that decides when a downstream task may run (e.g. all-success, all-done).
- **Restart boundary**: The split point between tasks that should be able to fail and restart individually without recomputing others.
- **Data-based vs task-based dependency**: Triggering a consumer by a marker file (loose coupling) vs by a direct trigger call (tight coupling).
- **Scheduling skew**: When all completed branches wait for the slowest parent before the merge task can fire.
- **Resource starvation**: In multi-tenant orchestrators, high-concurrency backfills starving other pipelines of scheduler capacity.
- **Execution unit**: The grouping of operations that must run together (transactionally) vs those that can split.

## Mental Models
- Use the Local Sequencer when a single job is too big to name or restart cheaply; use the Isolated Sequencer when team boundaries force separate pipelines.
- Use Aligned Fan-In when every branch must succeed; use Unaligned Fan-In when partial results are acceptable and you'd rather backfill gaps later.
- Use Parallel Split when one output feeds many independent consumers; use Exclusive Choice when exactly one branch should run.
- Use Single Runner when current output depends on the previous run; use Concurrent Runner when datasets are independent and throughput matters more than order.

## Anti-patterns
- **One giant monolithic job**: forces full restart on any failure and hides separation of concerns — makes debugging and maintenance slow and expensive.
- **Task-based trigger where loose coupling is possible**: a consumer rename breaks the producer's trigger chain; prefer data-based (marker file) dependency to allow independent evolution.
- **Overly granular pipelines**: too many tiny tasks shift orchestrator resources to scheduling overhead and reduce readability.
- **Burying conditions inside data-processing code**: hidden branching produces multiple forgotten outcomes; surface Exclusive Choice in the orchestration layer.
- **Data-based conditions for heavy choices**: evaluating a condition on the full dataset slows the job; prefer metadata (schema, params) when possible.
- **Ignoring shared state under concurrency**: concurrent runs of a pipeline sharing state (e.g. Dynamic Late Data Integrator's state table) cause nondeterministic side effects or missed backfills.

## Code Examples

```python
# Local Sequencer (Example 6-1)
input_data_sensor >> load_data_to_table >> expose_new_table
```
- **What it demonstrates**: Airflow's `>>` operator expresses sequential dependency (left must succeed before right).

```python
# Isolated Sequencer — data-based (Example 6-4)
# devices_loader
@task
def load_new_devices_to_internal_storage():
    ctx = get_current_context()
    partitioned_dir = f'{devices_file_location}/{ctx["ds_nodash"]}'
    internal_file_location = f'{partitioned_dir}/dataset.csv'
    shutil.copyfile(input_devices_file, internal_file_location)

input_data_sensor >> load_new_devices_to_internal_storage()

# devices_aggregator
input_data_sensor = FileSensor(
    task_id='input_data_sensor',
    filepath=devices_file_location + '/{{ ds_nodash }}/dataset.csv',
)
```
- **What it demonstrates**: A consumer pipeline's `FileSensor` acts as a dependency enforcer waiting on the producer's marker file (loose, data-based coupling).

```python
# Aligned Fan-In (Example 6-6)
clear_context = PostgresOperator(...)
generate_trends = PostgresOperator(...)
for hour_to_load in [f"{hour:02d}" for hour in range(24)]:
    file_sensor = FileSensor(
        task_id=f'wait_for_{hour_to_load}',
        filepath=input_dir + '/date={{ ds_nodash }}/hour=' + hour_to_load + '/dataset.csv'
    )
    visits_loader = PostgresOperator(
        task_id=f'load_hourly_visits_{hour_to_load}',
        params={'hour': hour_to_load}
    )
    clear_context >> file_sensor >> visits_loader >> generate_trends
```
- **What it demonstrates**: A `for` loop declares 24 parallel branches that all merge into the common `generate_trends` task (dynamic fan-in).

```python
# Unaligned Fan-In (Example 6-9) — the only diff from Aligned is the trigger rule
generate_cube = PostgresOperator(
    # ...
    trigger_rule=TriggerRule.ALL_DONE
)
```
- **What it demonstrates**: `ALL_DONE` lets the merge task run regardless of parent outcomes; the rule stays hidden in code, not visible in the graph.

```python
# Parallel Split — cache the shared input once (Example 6-13)
input_dataset = (spark_session.read
    .schema('type STRING, full_name STRING, version STRING').format('json')
    .load(DemoConfiguration.INPUT_PATH))
input_dataset.persist(StorageLevel.MEMORY_ONLY)
input_dataset.write...
input_dataset.write...
```
- **What it demonstrates**: `persist()` materializes the read dataset once so parallel branches don't trigger separate reads.

```python
# Exclusive Choice — conditional router (Example 6-17)
def get_output_format_route(**context):
    migration_date = pendulum.datetime(2024, 2, 3)
    execution_date = context['execution_date']
    if execution_date >= migration_date:
        return 'load_job_trigger_delta'
    else:
        return 'load_job_trigger_csv'

format_router = BranchPythonOperator(
    task_id='format_router',
    python_callable=get_output_format_route,
    provide_context=True
)
```
- **What it demonstrates**: `BranchPythonOperator` routes execution to exactly one branch based on the execution date.

```python
# Single Runner vs Concurrent Runner (Examples 6-21 / 6-22)
with DAG('visits_trend_generator', max_active_runs=1, default_args={
    'depends_on_past': True,  # ...
with DAG('devices_loader', max_active_runs=5, default_args={
    'depends_on_past': False,  # ...
```
- **What it demonstrates**: `max_active_runs` controls concurrency (1 = sequential, 5 = parallel); `depends_on_past` enforces per-task prior-run success.

## Reference Tables

| Aspect | Local Sequencer | Isolated Sequencer |
|---|---|---|
| Scope | Within one pipeline or job | Across physically separate pipelines |
| Boundary driver | Restart boundaries, transactions, naming | Team/consumer-provider split |
| Coupling | Direct task chain (`>>`) | Loose (data-based) or tight (task-based) |
| Triggering | Sequential dependency (parent success) | Marker file vs direct task trigger |
| Main challenge | Finding right task boundaries | Keeping pipelines in sync + scheduling |

| Aspect | Aligned Fan-In | Unaligned Fan-In |
|---|---|---|
| Child trigger | All parents succeed | Any parents done (`ALL_DONE`) |
| Output | Full dataset only | Partial dataset possible |
| Failure handling | Replay the failed branch | Fallback/error task or partial release |
| Readability | Clear | Confusing (success + failure paths) |
| Merge operator | `UNION` (vertical) / `JOIN` (horizontal) | Same, plus completeness/approximate flag |

| Aspect | Parallel Split | Exclusive Choice |
|---|---|---|
| Downstream branches | All run in parallel | Only one runs |
| Common point | Shared parent (fan-out) | Condition evaluator before branch |
| Processing-layer concern | Read once, persist, isolate state | if-else/switch or factory + params |
| Main risk | Blocked execution, hardware mismatch | Complexity factory, hidden logic |

| Aspect | Single Runner | Concurrent Runner |
|---|---|---|
| Concurrency | 1 (`max_active_runs=1`, `depends_on_past=True`) | > 1 (`max_active_runs=5`, `depends_on_past=False`) |
| Use case | Incremental/sequential processing | Independent datasets, backfill |
| Trade-off | Slow backfill, straggler latency | Resource starvation, shared-state risks |
| Dependency on prior run | Required | Optional per task |

## Worked Example
A data-engineering team builds daily visit aggregates for a blog analytics platform. Raw visit events are partitioned by hour, so the pipeline uses **Aligned Fan-In**: 24 hourly `FileSensor` + `PostgresOperator` branches load each hour's `dataset.csv` and merge into a single `generate_trends` task that computes the daily output. When one hour's processing silently fails, the all-parents-must-succeed rule blocks the daily aggregate, starving dashboard consumers. The team evolves the pipeline to **Unaligned Fan-In** by changing only `generate_cube` to `trigger_rule=TriggerRule.ALL_DONE`, so the merge runs even with a missing hour. To keep consumers honest, the SQL insert adds an `is_approximate` flag computed by a subquery that counts distinct processed hour IDs and compares to 24 — true (approximate) when fewer than 24 hours succeeded. Downstream dashboards now get a partial-but-labeled cube immediately, with the failed hour backfilled later.

## Key Takeaways
1. Data flow patterns work at two levels: orchestration (coordinate pipelines/tasks) and processing (organize business logic inside a job).
2. Sequence patterns (Local/Isolated Sequencer) are about drawing restart and team boundaries; the triggering mechanism (data-based vs task-based) determines coupling.
3. Fan-in merges branches (Aligned = all succeed, Unaligned = allow partial), while fan-out creates them (Parallel Split = all run, Exclusive Choice = one runs).
4. Choose `UNION` for vertical (more rows) vs `JOIN` for horizontal (more columns) merges; prefer `unionByName` to avoid position-based errors.
5. Orchestration runners trade throughput against correctness: Single Runner protects incremental logic, Concurrent Runner accelerates independent/backfill work.
6. Decoupling aids replay and feedback but adds scheduling overhead, skew, and readability costs — there is no one-size-fits-all boundary.
7. Surface conditions and partial-data status explicitly (orchestration layer, completeness tables, metadata) rather than hiding them in code.

## Connects To
- **Ch 2**: Readiness Marker and Full Loader patterns underpin the data-based trigger and the ingestion example used by Local/Isolated Sequencer.
- **Ch 4**: Data idempotency patterns (txnVersion/txnAppId) protect retried writes in Parallel Split; Dynamic Late Data Integrator shows shared-state risk under concurrency.
- **Ch 5**: Incremental Sessionizer is the motivating case for the Single Runner pattern.
- **Ch 10**: Data lineage design patterns (e.g. OpenLineage) reveal which pipelines consume a producer's output — the visibility Isolated Sequencer lacks.
- **Data orchestration tools**: Apache Airflow (sensors, branch operators, trigger rules), AWS Step Functions (Choice/Catch/Map), Azure Data Factory (if-condition, Concurrency).
