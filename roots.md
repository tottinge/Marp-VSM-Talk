This document captures the curated bibliography plus a compact summary of key concepts for the workshop.
## Principle lineage source

Authoritative principle lineage, primary sources, and Ottinger extensions are maintained in `Workshop-Principles-Sources.md`.

## Canonical source matrix

The source/type/why-it-matters matrix is maintained in `Source-Type-Whyitmatters.csv`. The table below mirrors that matrix with resolved links for workshop use.

| Source | Type | Why it matters |
|---|---|---|
| **Value Stream Mapping: a study about the problems and challenges for software development processes**  [doi](https://doi.org/10.1007/s00170-014-5712-z) | Academic paper | Directly about VSM in software development; good starting point for academic framing. |
| **Operationalization Of Lean Thinking Through Value Stream …**  [diva-portal](https://www.diva-portal.org/smash/get/diva2:833808/FULLTEXT01.pdf) | Thesis | Focuses on lean thinking, VSM, and process simulation modeling; useful for flow and waiting analysis. |
| **Providing value to customers in software development through lean principles**  [scholar.google](https://scholar.google.com/citations?user=faY_fa0AAAAJ&hl=en) | Academic work | Lean principles applied to software value delivery. |
| **A framework proposition to identify customer value through lean …**  [dx.doi](https://dx.doi.org/10.1108/JMTM-06-2019-0209) | Academic work | Connects lean customer value with VSM-style thinking. |
| **Value Stream Mapping in Product Development**  [lean](https://www.lean.org/the-lean-post/articles/why-value-stream-mapping-is-essential-to-product-and-process-development/) | Lean Enterprise Institute article | Strong conceptual bridge from manufacturing VSM to product/software development. |
| **Value stream mapping for software delivery**  [dora](https://dora.dev/guides/value-stream-management/) | DORA guide | Modern software-delivery framing; discusses bottlenecks, flow, and process visibility. |
| **Little’s Law and KanBan**  [capgemini.github](https://capgemini.github.io/agile/Littles-Law-and-KanBan/) | Practitioner explanation | Clear software-friendly explanation of queueing theory and \(L = \lambda W\). |
| **Little’s Law in software development**  [lostconsultants](https://www.lostconsultants.com/2019/11/20/littles-law-applied-in-agile-software-development/) | Practitioner article | Explicitly maps WIP, throughput, and lead time to Little’s Law. |
| **A Literature Review and Research Agenda of Value Stream Mapping**  [ijpsat](https://ijpsat.org/index.php/ijpsat/article/download/3981/2830) | Literature review | Good for finding additional primary studies via references. |

## Key concepts

- **Value stream mapping** is a way to visualize the full path from request to delivery so you can see where work waits, gets reworked, or stalls. [lean](https://www.lean.org/the-lean-post/articles/why-value-stream-mapping-is-essential-to-product-and-process-development/)
- In software, the map usually includes analysis, coding, code review, testing, release, and the handoffs between them; those handoffs often create the biggest delays. [dora](https://dora.dev/guides/value-stream-management/)
- **Queueing** matters because waiting time usually dominates total lead time; the more work-in-progress you have, the longer work tends to sit in queues. [capgemini.github](https://capgemini.github.io/agile/Littles-Law-and-KanBan/)
- **Little’s Law** states \(L = \lambda W\), where \(L\) is average WIP, \(\lambda\) is throughput, and \(W\) is average lead time or response time; in steady state, that gives a powerful way to reason about flow. [lostconsultants](https://www.lostconsultants.com/2019/11/20/littles-law-applied-in-agile-software-development/)
- **Shortening feedback loops** means getting signal sooner, so defects, misunderstandings, and bad assumptions are discovered earlier and cheaper to fix. [bignited](https://bignited.be/blog/shortening-the-feedback-loop:-how-fast-testing-leads-to-faster-decisions-in-software-development/)
- **Eliminating rejection loops** means reducing rework caused by late defect discovery, failed tests, unclear requirements, or approval cycles that bounce work back upstream; in lean terms, that is waste. [pmc.ncbi.nlm.nih](https://pmc.ncbi.nlm.nih.gov/articles/PMC10196511/)

## How these ideas connect

VSM helps you locate where work accumulates and where feedback is slow, while Little’s Law helps explain why reducing WIP often shortens lead time even when throughput stays similar. Lean development then provides the operational discipline: reduce batch sizes, make work visible, improve test and review automation, and remove unnecessary approval or rework loops. [pmc.ncbi.nlm.nih](https://pmc.ncbi.nlm.nih.gov/articles/PMC10196511/)

## Suggested reading order

1. **Little’s Law and KanBan** for the queueing foundation. [capgemini.github](https://capgemini.github.io/agile/Littles-Law-and-KanBan/)
2. **Value Stream Mapping in Product Development** for the conceptual model. [lean](https://www.lean.org/the-lean-post/articles/why-value-stream-mapping-is-essential-to-product-and-process-development/)
3. **Value Stream Mapping: a study about the problems and challenges for software development processes** for the academic software-specific angle. [doi](https://doi.org/10.1007/s00170-014-5712-z)
4. **Operationalization Of Lean Thinking Through Value Stream …** for simulation and process analysis. [diva-portal](https://www.diva-portal.org/smash/get/diva2:833808/FULLTEXT01.pdf)
5. **DORA’s value stream mapping guide** for a modern software-delivery application. [dora](https://dora.dev/guides/value-stream-management/)

The most useful lens is: map the flow, measure waiting, identify rework loops, then use Little’s Law to test whether lowering WIP should reduce lead time. [capgemini.github](https://capgemini.github.io/agile/Littles-Law-and-KanBan/)
