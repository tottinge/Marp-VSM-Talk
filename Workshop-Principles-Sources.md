# Authoritative Sources for Workshop Principles

# Foundational Theories

## POSIWID

### Principle

> The purpose of a system is what it does.

### Primary Source

Stafford Beer

Most commonly associated with *The Heart of Enterprise* (1979) and
Beer's work in management cybernetics.

### Workshop Use

Evaluate systems by outcomes rather than stated intentions.

------------------------------------------------------------------------

## Little's Law

### Principle

> Inventory creates delay.

### Primary Source

John D. C. Little

"A Proof for the Queuing Formula: L = λW" (1961)

Published in *Operations Research*.

### Workshop Use

More unfinished work means longer lead times.

------------------------------------------------------------------------

## Amdahl's Law

### Principle

> The serial fraction limits improvement.

### Primary Source

Gene Amdahl

"Validity of the Single Processor Approach to Achieving Large Scale
Computing Capabilities" (1967)

### Workshop Use

Parallelization cannot eliminate serial coordination and synchronization
costs.

------------------------------------------------------------------------

## Theory of Constraints

### Principle

> Constraints govern throughput.

### Primary Source

Eliyahu M. Goldratt

*The Goal*

### Workshop Use

System throughput is governed by the current constraint.

------------------------------------------------------------------------

## First-Time-Through and Quality Engineering

### Principle

> Rework destroys flow.

### Primary Sources

Quality engineering traditions including:

-   W. Edwards Deming
-   Philip Crosby
-   Statistical Process Control
-   Lean Manufacturing

### Workshop Use

Improving first-time-through reduces rework, queues, and lead time.

------------------------------------------------------------------------

# Ottinger Extensions and Syntheses

## Every Handoff Is a Queue

### Principle

> A transfer of responsibility creates waiting.

### Primary Source

Tim Ottinger

*Faster and More Predictable*

### Notes

Appears to be an original software-delivery synthesis.

------------------------------------------------------------------------

## Scatter Creates Gather

### Principle

> Every decomposition creates a future synchronization requirement.

### Primary Source

Tim Ottinger

*Scatter-Gather*

### Notes

Related to Amdahl, Brooks, and coordination-cost theory, but expressed
as an Ottinger principle.

------------------------------------------------------------------------

## Solo Work Creates Scatter

### Principle

> Ticket ownership tends to increase decomposition, synchronization, and
> integration burden.

### Primary Source

Tim Ottinger

*Pitfalls of Solo Work*

### Notes

Explains how organizational structure creates flow problems.

------------------------------------------------------------------------

## Quality Gates Visualization

### Principle

Quality gates can be represented explicitly as pass/fail decision points
in a VSM.

### Primary Source

Tim Ottinger

Quality Gate Calculator

AgileOtter.blogspot.com

### Notes

Used to demonstrate cumulative effects of rejection and rework.

------------------------------------------------------------------------

## Quality Failures Create Queues

### Principle

> Defects create additional waiting, coordination, and synchronization.

### Source

Ottinger synthesis drawing from:

-   Theory of Constraints
-   Lean
-   Quality Engineering
-   Flow Theory

### Notes

Treat defects as flow problems, not merely quality problems.

------------------------------------------------------------------------

# Suggested Reference Sheet Structure

## Foundational Theories

  Principle                       Primary Source
  ------------------------------- ------------------------------
  POSIWID                         Stafford Beer
  Little's Law                    John Little
  Amdahl's Law                    Gene Amdahl
  Constraints Govern Throughput   Eliyahu Goldratt
  First-Time-Through              Deming / Quality Engineering

------------------------------------------------------------------------

## Ottinger Principles

  Principle                        Source
  -------------------------------- -----------------------------
  Every Handoff Is a Queue         Faster and More Predictable
  Scatter Creates Gather           Scatter-Gather
  Solo Work Creates Scatter        Pitfalls of Solo Work
  Quality Gates Visualization      Quality Gate Calculator
  Quality Failures Create Queues   Ottinger Synthesis

------------------------------------------------------------------------

# Intellectual Lineage

The workshop combines:

-   Systems Thinking (Beer)
-   Queueing Theory (Little)
-   Parallelization Limits (Amdahl)
-   Theory of Constraints (Goldratt)
-   Quality Engineering (Deming and others)

with software-delivery-specific interpretations and extensions developed
by Tim Ottinger.

The Ottinger principles act as a translation layer connecting classical
systems theory, quality engineering, and flow-based software delivery.
