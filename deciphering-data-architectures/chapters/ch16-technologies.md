# Chapter 16: Technologies

## Core Idea
Choosing a platform is a trade-off between open source (cheap, flexible, but self-supported) and cloud (managed, scalable, but a vendor dependency), layered on the IaaS/PaaS/SaaS abstraction model. The author's defaults: prefer cloud over on-prem, prefer PaaS for data warehouses, and prefer a single cloud over multi-cloud.

## Frameworks Introduced
- **Open source vs. cloud provider**: OSS is free, customizable, transparent, and vendor-independent; cloud is supported, scalable, secure, and easier to hire for.
  - When to use OSS: budget constraints, need for customization/transparency, avoiding lock-in.
  - When to use cloud: want SLAs, managed services, fast deployment, and the ability to fail cheaply.
- **Cloud service models**: IaaS (manage OS/app), PaaS (CSP manages platform, no VMs), SaaS (fully managed).
  - When to use: IaaS for portability/control; PaaS for data warehouses (the author's preference); SaaS for ease.
  - How: pick by how much abstraction you want vs. control you need.
- **Single cloud over multi-cloud**: the author's default — pick one CSP and go deep.
  - When to use multi-cloud: data sovereignty gaps, or leveraging a genuine per-region strength.
  - How: stick to one CSP for volume discounts, ecosystem, and simpler ops; fail over to another *region*, not another *cloud*.

## Key Concepts
- **Hadoop**: OSS framework (HDFS + MapReduce) for distributed batch processing; waning as cloud replaces clusters and HDFS.
- **HDFS**: splits data into blocks across nodes — high throughput, fault tolerance.
- **MapReduce**: Map() filters/sorts, Reduce() summarizes, across a cluster.
- **Databricks**: managed Spark platform + Delta Lake; the force behind the lakehouse.
- **Snowflake**: cloud data warehouse that separates compute and storage and can also act as a data lake.
- **IaaS / PaaS / SaaS**: increasing abstraction, decreasing control (and portability).
- **Egress fees / ELAs / reserved instances**: the hidden costs and volume discounts that make multi-cloud less attractive.
- **Top OSS projects**: MySQL, PostgreSQL, MongoDB, Hadoop, Spark, Kafka, Presto, Airflow.

## Mental Models
- "If you run your own datacenter, you're in the air-conditioning business" — on-prem means managing hardware, cooling, power, not analyzing data.
- The cloud's killer feature is *cheap failure*: build fast, and if it doesn't work, delete the resources.
- "A Lamborghini in first gear" (from Ch 15) applies to tools too — go deep on one CSP's PaaS/SaaS rather than shallow on two.

## Anti-patterns
- **Multi-cloud for outage protection**: CSPs isolate regions; your DR should fail over to another region in the same cloud, not another cloud.
- **Multi-cloud to force price competition**: mostly a myth — volume/commitment discounts favor one cloud.
- **Using Hadoop for real-time**: MapReduce is batch-only; use Kafka/Flink for streaming.
- **Keeping data on-prem by default**: the remaining on-prem cases are rare (no internet, millisecond performance, locked leases, constrained pipelines).
- **Using IaaS just for portability**: you forfeit the higher-value PaaS services for a move you'll probably never make.

## Reference Tables
The big three CSPs:

| | Azure | AWS | GCP |
|---|---|---|---|
| Announced | 2008 | 2006 | 2008 |
| Market share | 23% | 32% | 10% |
| Analytic product | Azure Synapse, Microsoft Fabric | Amazon Redshift | Google BigQuery |
| Strength | Microsoft integration | Broadest services/instances | Data analytics & ML, ease of use |

## Worked Example
**TechTreasures' multi-cloud.** A global ecommerce company runs Azure for North America (low-latency network), GCP for Europe (analytics + regional presence), and AWS for Asia (including a Taiwan region for data-sovereignty compliance). This is the *legitimate* multi-cloud use case: real regional/sovereignty gaps, not outage hedging. But the author notes the trade-offs — egress fees, re-engineering, more staff, and administrative duplication — which is why most companies should still pick one cloud.

## Key Takeaways
1. Default to the cloud; keep on-prem only for the rare cases (no internet, millisecond needs, locked leases).
2. Prefer PaaS for data warehouses: no VMs to manage, automatic patching/backups, one-click DR.
3. OSS wins on cost/flexibility/transparency; cloud wins on support, SLAs, and hiring.
4. Pick one cloud and go deep — volume discounts and the PaaS ecosystem beat multi-cloud hedging.
5. Hadoop's principles survive, but Spark/Databricks and Snowflake are the modern engines.

## Connects To
- **Ch 5**: Hadoop/HDFS was the original data lake storage.
- **Ch 10–12**: Azure Synapse/Redshift/BigQuery/Snowflake power the MDW; Databricks/Delta Lake power the lakehouse.
- **Ch 13**: Snowflake and Databricks can underpin per-domain mesh infrastructure.
- **Ch 15**: the people and roles who choose and run these technologies.
