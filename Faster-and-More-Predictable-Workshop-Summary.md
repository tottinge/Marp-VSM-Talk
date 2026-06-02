# Faster and More Predictable Workshop Design Notes

## Purpose

This workshop is not primarily about teaching Value Stream Mapping
notation.

Participants should learn to:

1.  Read a VSM.
2.  Draw a VSM.
3.  Diagnose a delivery system using a VSM.
4.  Improve a delivery system using evidence from a VSM.

The VSM is a diagnostic instrument, not the subject of study.

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

Avoid claiming:

> AI moved the constraint.

Evidence does not prove coding was generally the system constraint.

Prefer:

> AI accelerates work entering the system.

AI appears to amplify existing system dynamics.

The Faros findings are useful because they show:

-   More work started
-   More PRs
-   More review burden
-   More waiting
-   Longer lead times

Interpretation:

AI often amplifies Scatter-Gather and increases demand on existing
coordination mechanisms.

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

Introduce later.

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

1.  Healthy Team
2.  Specialist Organization
3.  High Inventory Organization
4.  Scatter-Gather
5.  Shift Left / Higher First-Time-Through
6.  AI Amplification
7.  Constraint Migration
8.  Capstone Diagnosis

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

The workshop is about understanding systems.

Not drawing diagrams.

Not following Agile rituals.

Not increasing utilization.

Participants should leave able to explain:

-   Why delivery behaves as it does.
-   What evidence supports that conclusion.
-   What changes are likely to improve flow.

The VSM is evidence.

The principles explain the evidence.
