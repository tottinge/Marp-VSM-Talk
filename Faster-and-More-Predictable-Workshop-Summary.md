# Faster and More Predictable Workshop Design Notes

## Purpose

This workshop is not primarily about teaching Value Stream Mapping
notation.
The true subject is flow in software delivery systems.

Participants should learn to:

1.  Read a VSM.
2.  Draw a VSM.
3.  Diagnose a delivery system using a VSM.
4.  Improve a delivery system using evidence from a VSM.
5.  Detect hidden rework.
6.  Shift quality activities earlier.
7.  Evaluate AI-assisted development through a flow lens.
8.  Redesign delivery systems to improve first-pass success.

The VSM is a diagnostic instrument, not the subject of study.
Participants should leave able to diagram, understand, measure, and
improve real software delivery systems.

------------------------------------------------------------------------

# Core Thesis

Flow is the movement of knowledge through a delivery system.

Quality gates measure whether that knowledge is usable.

Rework occurs when knowledge is incomplete, ambiguous, inconsistent, or
incorrect.

Shift-left improves flow because it improves information quality earlier.

AI amplifies both good and bad information.

Therefore, the highest-leverage improvement is usually not faster
coding. It is better knowledge representation and earlier validation.

------------------------------------------------------------------------
# Core Learning Objectives

By the end of the workshop participants should be able to:

-   Recognize their own delivery system in example VSMs.
-   Analyze queues, waiting, gathers, constraints, and quality loops.
-   Explain why a system behaves the way it does.
-   Predict likely effects of proposed changes.
-   Sketch an improved VSM.
-   Improve flow rather than local efficiency.

The workshop must avoid blame and recrimination.

The examples should feel familiar and understandable.

The message is:

> Systems produce the outcomes they are designed to produce.

------------------------------------------------------------------------

# Teaching Style

Do NOT lead the witness.

Avoid presenting theory first.

Preferred pattern:

1.  Observation
2.  Interpretation
3.  Prediction
4.  Reveal
5.  Theory

Participants should discover the principles from evidence.

------------------------------------------------------------------------

# Role of POSIWID

Stafford Beer:

> The purpose of a system is what it does.

Use POSIWID as a foundational lens.

The workshop should repeatedly ask:

> What is this system actually optimized for?

Not:

> What was it intended to do?

Examples:

-   Quarterly releases
-   Long approval chains
-   Large review queues
-   Large gathers

These are evidence of the system as-built.

A provocative framing:

> Many software delivery systems are better understood as systems that
> prevent delivery rather than systems that enable delivery.

The VSM provides evidence.

------------------------------------------------------------------------

# Core Principles

## Every Handoff Is a Queue

A transfer of responsibility creates waiting.

The queue is not separate from the handoff.

The handoff creates the queue.

------------------------------------------------------------------------

## Scatter Creates Gather

Every decomposition creates a future synchronization requirement.

Parallel work is not free.

Gathering is the cost of scattering.

------------------------------------------------------------------------

## Constraints Govern Throughput

Theory of Constraints.

Throughput is governed by the current constraint.

Improving non-constraints often has little effect.

------------------------------------------------------------------------

## Inventory Creates Delay

Little's Law.

More unfinished work means longer lead times.

------------------------------------------------------------------------

## The Serial Fraction Limits Improvement

Amdahl's Law.

Parallelization cannot eliminate serial coordination and
synchronization.

------------------------------------------------------------------------

## Quality Failures Create Queues

Defects create:

-   Rework
-   Additional handoffs
-   Additional synchronization
-   Additional waiting

Quality is a flow concern.

------------------------------------------------------------------------

## First-Time-Through Drives Flow

High first-time-through reduces:

-   Rework
-   Gathers
-   Queues
-   Lead time

------------------------------------------------------------------------

## Additional Principle Emphases

### Quality Is Throughput Protection

Quality is not decoration or compliance; it protects throughput by
reducing rework, waiting, coordination cost, and defect amplification.

### Collaboration Is a Throughput Optimization Strategy

Pairing, ensemble work, shared ownership, and continuous integration are
not just cultural preferences; they improve first-pass yield, knowledge
distribution, integration success, and predictability.

### Local Efficiency Is Not System Throughput

Utilization is not throughput.

Activity is not delivery.

More coding can increase inventory unless quality and integration stay
high.

### Most Delay Is Waiting

Flow efficiency is usually low in software delivery systems.

Participants should experience small amounts of active work and large
amounts of waiting/rework so this becomes concrete rather than abstract.

### Slow Coding Can Accelerate Delivery

Shift-left practices such as TDD, pairing, ensemble work, story
refinement, CI, and better prompt/spec quality can reduce raw coding
speed while improving throughput, predictability, quality, and delivery
frequency.

------------------------------------------------------------------------

# Theory Sources

## Faster and More Predictable

Primary language of the course.

Focus:

-   Waits
-   Queues
-   Loops
-   Rework
-   Flow

------------------------------------------------------------------------

## Why Isn't It Faster?

Amdahl's Law applied to delivery systems.

Important insight:

The serial fraction dominates.

Handoffs, approvals, reviews, integration, coordination, and
synchronization frequently become the serial portion.

------------------------------------------------------------------------

## Scatter-Gather

Critical concept.

Most organizations optimize for scatter while ignoring gather.

Gather points frequently dominate lead time.

------------------------------------------------------------------------

## Pitfalls of Solo Work

Important supporting concept.

Solo work tends to require:

-   Up-front decomposition
-   Assignment
-   Independent execution
-   Synchronization
-   Integration
-   Verification

This naturally creates Scatter-Gather dynamics.

------------------------------------------------------------------------

# Solo Work vs Teaming

Do not present this as:

> Pairing is good.

Present it as a system effect.

Solo ownership tends to create:

-   More decomposition
-   More dependencies
-   More queues
-   More gathers
-   More integration work
-   More WIP

Teaming tends to:

-   Reduce scatter
-   Increase shared understanding
-   Increase first-time-through
-   Reduce integration effort
-   Reduce rework

Key insight:

Teaming is a flow intervention.

------------------------------------------------------------------------

# AI Discussion

Treat AI as a flow topic, not only a coding topic.

AI changes:

-   Code production rate
-   Integration load
-   Review load
-   Knowledge representation requirements

Do not assume local productivity gains create system throughput gains.

Use Faros AI Whiplash findings to illustrate that increased output can
increase:

-   Rework
-   Review burden
-   Integration failures
-   Knowledge debt

Use Tornhill's merge-conflict bottleneck framing to show likely
constraint migration toward:

-   Integration
-   Merge conflict resolution
-   Code review
-   Knowledge transfer and understanding

Prompt quality should be treated as an upstream quality gate.

Poor prompt quality creates downstream rework.

------------------------------------------------------------------------

# Value Stream Map Style

Use standard VSM iconography.

## Queue

Inventory triangle.

Show queue population inside the triangle.

Example:

△ 14

Meaning:

14 items waiting.

Do NOT label this WIP.

Waiting work is not work in progress.

------------------------------------------------------------------------

## Process Box

Show process name.

Under the box:

-   CT = Cycle Time
-   WT = Wait Time

Example:

Development

CT: 5d WT: 70d

Participants should infer causes from evidence.

------------------------------------------------------------------------

## Early Scenarios

Only show:

-   Queue population
-   CT
-   WT

Focus:

-   Waiting
-   Handoffs
-   Constraints
-   Inventory

------------------------------------------------------------------------

## Later Scenarios

Introduce:

-   First-Time-Through
-   Quality Gates
-   Pass Rate
-   Reject To

Only after participants begin asking about rework.

------------------------------------------------------------------------

# Ottinger Extensions

Use these as first-class elements once participants are reading maps with
confidence.

1.  Queue population shown explicitly in inventory triangles.
2.  Wait time shown at each station, and derived from queue population +
    cycle time when needed.
3.  Quality gates with pass rates.
4.  Explicit Reject-To destinations.
5.  Rework topology represented as a network, not just a linear chain.

Quality Gate notation includes:

-   Pass Rate
-   Reject To

Example:

Code Review

Pass: 82% Reject → Development

Purpose:

Make rework loops visible.

------------------------------------------------------------------------

# Quality Gate Calculator

Use the AgileOtter Quality Gate Calculator.

Purpose:

Show cumulative effect of multiple quality gates.

Participants often underestimate the impact of seemingly good pass
rates.

Key insight:

Several "pretty good" gates can combine into poor end-to-end yield.

------------------------------------------------------------------------
# Quality Gate Thinking

Treat gates as information filters.

At each gate ask:

-   What enters?
-   What leaves?
-   What passes?
-   What gets rejected?
-   Where does rejected work go?

Metrics to emphasize:

-   First Pass Yield (FPY)
-   Rolled Throughput Yield (RTY)
-   Percent Complete and Accurate
-   Defect amplification
-   Rework load

------------------------------------------------------------------------

# VSM Interpretation Questions

Participants should learn to ask:

-   Where is work waiting?
-   Why is inventory accumulating?
-   Where are the gathers?
-   What is the current constraint?
-   What is being optimized?
-   What is the first-time-through rate?
-   What is causing rework?
-   Is the system optimized for starting work or finishing work?
-   What does POSIWID suggest about this system?

------------------------------------------------------------------------

# Scenario Structure

Each scenario should include:

1.  Business context
2.  VSM
3.  Metrics
4.  Diagnostic questions

Avoid immediately presenting theory.

------------------------------------------------------------------------

# Candidate Scenario Sequence

1.  Too Much WIP Team
2.  Review Bottleneck
3.  Shift-Right Team
4.  Dependency Team
5.  Partial Completion Team
6.  Merge Hell Team
7.  Release Train Team
8.  High-Performance Team

------------------------------------------------------------------------

# Workshop Structure (No Theory-Practice Split)

Every hour should include brief framing, hands-on exercise, and debrief.

## 10:00-11:00 Why Is Delivery Slow?

Run simulation first so participants experience queues, delays, and
rework before terminology.

Then create a first VSM and introduce queue populations, wait times,
quality gates, pass rates, and Reject-To paths.

## 11:00-12:00 Flow Math and Quality Economics

Use Quality Gate Calculator, yield math, and throughput math.

Demonstrate First Pass Yield, Rolled Throughput Yield, and defect
amplification.

## 12:00-13:00 Shift Left Through Collaborative Development

Introduce TDD, pairing, ensemble work, CI, and story slicing.

Teams redesign flow with the constraint of no additional people.

## 13:00-14:00 Lunch

Optional challenge: map a real delivery system.

## 14:00-15:00 AI-Assisted Development

Compare weak/strong prompts and weak/strong requirements.

Analyze pass rates, reject paths, rework, and integration burden.

Discuss AI Whiplash and bottleneck migration.

## 15:00-15:45 Future-State Design

Create current-state and future-state maps optimized for flow,
predictability, yield, and quality.

Require explicit shift-left changes, AI practices, and quality-gate
improvements.

## 15:45-16:00 Commitments

Each participant identifies one queue to reduce, one quality gate to
improve, one feedback loop to shorten, one AI practice to improve, and
one shift-left practice to adopt.

------------------------------------------------------------------------

# Additional Exercises

## Defect Routing Simulation

Defects physically travel backward through the map so rework is visible
and tangible.

## Pass-Rate Dice Game

Assign pass probabilities per gate and observe throughput collapse from
modest defect rates.

## AI Merge Storm Simulation

Round 1: normal development baseline.

Round 2: AI triples code production and participants observe merge,
review, and integration strain.

Round 3: apply trunk-friendly integration, smaller slices, better
prompts, CI, and TDD, then recalculate throughput.

------------------------------------------------------------------------

# References to Weave Through Delivery

-   Tim Ottinger / Agile Otter
-   Industrial Logic
-   Continuous Delivery (Humble and Farley)
-   Adam Tornhill ("Why Merge Conflicts Became the New Bottleneck")
-   Faros AI Whiplash report

------------------------------------------------------------------------

# Capstone Goal

Participants receive:

-   VSM
-   Flow metrics
-   Quality metrics
-   DORA metrics
-   AI metrics (optional)

They must:

1.  Identify constraints.
2.  Identify gathers.
3.  Explain delays.
4.  Predict outcomes.
5.  Redesign the system.

------------------------------------------------------------------------

# Final Message

Delivery performance is governed primarily by:

-   Knowledge quality
-   Feedback quality
-   Rework topology
-   Collaboration structure
-   Integration capability
-   Quality gates

Not typing speed.

Participants should leave able to explain:

-   Why delivery behaves as it does.
-   What evidence supports that conclusion.
-   What changes are likely to improve flow.

The VSM is evidence.

The principles explain the evidence.

The purpose of Value Stream Mapping is to make flow visible so systems
can be improved.
