---
marp: true
math: katex
theme: otter-professional
paginate: true
size: 16:9
header: <img class="topbar-logo" src="../AgileOtter-Logo-Small.jpg" alt="Agile Otter logo" /><span class="topbar-text">Tim Ottinger · Agile Otter</span><img class="topbar-qr" src="../assets/images/agile-otter-qr.svg" alt="Agile Otter QR code" />
footer: Draft workshop scaffold
---

<!-- _class: title lead -->
# Faster and More Predictable
## Value Stream Mapping workshop
### Tim Ottinger

---
<!-- _class: workshop -->
# Outcomes by end of session

- Create and Read a Current State VSM.
- Use Custom Quality Gate Extensions
- Understand Flow Better
- Diagnose a delivery system.
- Predict and sketch improvements.

---
<!-- _class: workshop -->
# Working pattern (repeat each scenario)
- Observation
- Interpretation
- Prediction
- Reveal
- Theory


---

Value
---
What is it that the customer requires, desires, and pays for?

Begin with the value in mind (not your current process).

What (strictly) must happen to produce that?


![w:200](../assets/images/gold-bar.png)

---

# Value-Adding Steps

A value-adding step **materially** increases the value delivered to the user.

Reports may require 
- gathering data from various sources, 
- transforming, enriching, and querying it, 
- formatting an extract, 
- and delivering it.

---

# Non-Value-Adding Steps

Some steps may not add value materially but help ensure that we produce value efficiently or effectively.  We may call these ***hygenic*** steps. We *don't eliminate these* but make them effective.

- Metrics gathering and analysis
- Observability and monitoring
- Quality Control
- Good management
- Human Factors (breaks, lunches, enablement)


---
# Pure Waste

We try to eliminate these entirely if possible.

- **D**efects - Failing to meet customer needs
- **O**ver Producing - Making what isn't needed (yet)
- **W**aiting - Idle time due to queues, bottlenecks, supply delays, or approvals
- **N**on-use of human abilities - wasting human capability and ingenuity
- **T**ransportation - moving material (including tickets)
- **I**nventory - stockpiling unfinished work or unneeded finished products 
- **M**otion - excess effort by people are machines 
- **E**xtra processing - Doing more than is valued by the recipient ("gold plating")


---
<!-- _class: workshop -->
# Not Just Process Flow

Sometimes a simple visualisation of process steps is presented as a "VSM", but this is not accurate.

![w:940](../assets/images/not-a-vsm.png)

We will explore more deeply...


---
<!-- _class: workshop -->
# Stations

The main flow is a series of work "stations" or processes separated by queues.  
Queues are important to understanding the flow of work.


<div style="display: flex;">
<div style="width: 50%">

![w:220](../assets/images/vsm-generated/single-item.svg)

</div>
<div style="width: 50%;">
CT = Median cycle time 

Mean cycle time is okay, too.
</div>
</div>

Work has high variation, but median/mean times will help with the arithmetic.

---
# Connectedness

Every handoff is a queue, represented with a triangle.

Inside the triangle is the queue's population.

$$
WT = queued \times cycle time.
$$
![w:940](../assets/images/vsm-generated/simple-example.svg)


---

# Lead Time Ladder

![w:940](../assets/images/vsm-generated/simple-example.svg)

The raised part of the lead time ladder is wait time, and the lowered part is work time 

---
# Uses

1. To show the current state
2. To tweak the efficiency (work time / total time)
3. Build a map of the next desired change

For software orgs, efficiency is often less than 10%. 

---

# Process Efficiency

Consider one item travelling through the queue. 

How often and how long does the work wait?

$$
Efficiency = \frac{T(work)}{T(total)}
$$

The more time work is waiting in queues, the less efficient the VSM shows it to be.

---

# The PoV Shift

* Wait for 2 days to start, code/debug/test for 2 days
* Wait 5 hours for review, reviewed for 1/2 hour
* Wait 1 day for QA test, tested for 2 hours
* Wait 1 week for release

 **~3** work days processing over **~16**  = **19% efficient**

While all workers were 100% utilized. 

---

# Watch The Baton, Not The Runners

---


# Typical Inefficiencies

The "ideal" time for a given process is the sum of the cycle times. If there was no delay at all, this would be the time to delivery. 

Work can wait for:
* Integration (if task are dependent and partial)
* Batching (if the release is partial)
* Busy or Unavailable queue readers

---  
  
# Availability Magnifies Wait Time  
  
When a station is not available full-time, the queue does not move at the raw cycle time.  
  
$$  
Effective\ CT = \frac{Cycle\ Time}{Availability}  
$$
$$  
Wait\ Time = Queue\ Population \times Effective\ CT  
$$  
---

# Availability Example


<div style="  width: 60%;  margin: 0 auto;  text-align: left;">

Queue = 10 items

CT = 0.5 hr 

Avail = 20%

$Wait = 10 \times 0.5 / 0.2 = 25$

**5 hr effort ⇒ 25 hr delay**
</div>

---

# Look this over


![w:940](../assets/images/vsm-generated/limited-availability-review-and-test.svg)

If we can **double coding speed**, how much faster can we deliver to production?

---

# Answer: 6% ideally


![w:940](../assets/images/vsm-generated/limited-availability-review-and-test.svg)

Coding time is only 12% of the total time. 

---
# Answer: But, Actually...

![w:940](../assets/images/vsm-generated/doubled-coding-speed-after-10-days.svg)

The next item will take 55 days to travel the queue, due to increased inventory in downstream process steps.

---


# Unintended Consequences

Some consequences of ignoring these factors are:

* Late Deliveries
* Uncertain Completion Dates
* Uncertain Completion Status
* Uncertain Quality

---
<!-- _class: split -->
# What to inspect in any map
## Structural signals
- Every handoff is a queue.
- Scatter creates gather.
- Constraints govern throughput.
## Flow signals
- Inventory creates delay.
- Rework creates loops.
- First-time-through drives flow.

---
# POSIWID lens

> The purpose of a system is what it does.  - Stafford Beer \
> Every system is perfectly designed to get the result that it does. - W.E. Deming

The design as-is may be wholly comprised of unintended consequences. 


---
<!-- _class: workshop -->
# Diagnostic question set
- Where is work waiting?
- Where are scatters and gathers?
- What is the current constraint?
- What causes rework?
- Is this system optimized to start work or finish work?

---
<!-- _class: workshop -->
---
# Long Wait Time Causes


| Usually First    | Check Next          |
| ---------------- | ------------------- |
| Too much WIP     | Review bottleneck   |
| Large work items | Partial completion  |
| Rework           | Merge delays        |
| Dependencies     | Release constraints |


**Wait Time ≫ Cycle Time → investigate the system**


---
# Simple outline (today)
1. Read map signals: queue, CT, WT, and reject paths.
2. Diagnose common flow failures (Scenarios 1-4).
3. Diagnose system traps (Scenarios 5-7).
4. Compare with a high-performance pattern (Scenario 8).
5. Run a capstone redesign from evidence.


---
<!-- _class: practice -->
# Scenario 1 — The "Too Much WIP" Team
![w:900](../assets/images/vsm-generated/too-much-wip-team.svg)
- Backlog `△ 120`, Ready `△ 25`
- Lesson: Work isn't moving slowly. Too much work is started.
- Improvement: Reduce WIP.

---
<!-- _class: practice -->
# Scenario 2 — The Review Bottleneck
![w:940](../assets/images/vsm-generated/review-bottleneck.svg)
- Lesson: Review takes minutes. Waiting for review takes days.
- Improvement: Smaller PRs, more reviewers, earlier review.

---
<!-- _class: practice -->
# Scenario 3 — The Shift-Right Team
![w:840](../assets/images/vsm-generated/shift-right-team.svg)
- Rework loop: `30%` return to Development.
- Lesson: Testing isn't the bottleneck. Defects are.
- Improvement: Move quality practices into development.

---
<!-- _class: practice -->
# Scenario 4 — The Dependency Team
![w:940](../assets/images/vsm-generated/dependency-team.svg)
- Investigation: Why 9 days?
- Waiting on: Security Team, Database Team, Operations Team.
- Lesson: Dependencies dominate lead time.

---
<!-- _class: practice -->
# Scenario 5 — The Partial Completion Team
![w:740](../assets/images/vsm-generated/partial-completion-team.svg)
- Investigation: Frontend/backend complete but docs missing (or 4 of 5 stories complete).
- Lesson: Almost done is not done; synchronization effects dominate.

---
<!-- _class: practice -->
# Scenario 6 — The Merge Hell Team
![w:940](../assets/images/vsm-generated/merge-hell-team.svg)
- Additional metrics: Conflict Rate `25%`, Merge Failures `12%`.
- Lesson: Coding is not the constraint. Branching strategy is.
- Connects directly to Tornhill's work.

---
<!-- _class: practice -->
# Scenario 7 — The Release Train Team
![w:940](../assets/images/vsm-generated/release-train-team.svg)
- Lesson: Release batching destroys flow.
- Improvement: Smaller releases.

---
<!-- _class: practice -->
# Scenario 8 — The High-Performance Team
![w:940](../assets/images/vsm-generated/high-performance-team.svg)
- Quality gates: Static Analysis `98%`, Unit Tests `97%`, Integration `95%`.
- Lesson: Nothing magical.
- Small batches. Low WIP. Fast feedback. Strong quality practices.

---
<!-- _class: workshop -->
# Capstone diagnosis
- Identify the constraint.
- Identify gather points.
- Explain delays from evidence.
- Predict outcomes of one intervention.
- Sketch a revised map.

---
<!-- _class: workshop -->
# Capstone evidence pack
- VSM snapshot
- Flow metrics
- Quality metrics
- DORA metrics
- Optional AI metrics

---
<!-- _class: split -->
# Evidence roots
## Workshop backbone
- `Faster-and-More-Predictable-Workshop-Summary.md`
- `Workshop-Principles-Sources.md`
- `roots.md`
- `Source-Type-Whyitmatters.csv`
## Discussion anchors
- Queueing / Little’s Law
- Wait states and handoffs
- Rework loops and first-time-through

---
<!-- _class: workshop -->
# Final message
- The map is evidence.
- Principles explain evidence.
- Interventions should improve flow.

<div class="takeaway">Goal: explain current behavior, then change system design to produce better outcomes.</div>
