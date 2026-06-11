# VSM DSL
This project uses YAML as a DSL for value-stream map scenarios.
## Directory layout
- Source DSL files: `vsm/source/`
- Generated SVG output: `assets/images/vsm-generated/`
- Generator script: `scripts/generate-vsm-svgs.mjs`
Generated SVG files are ignored by git and should be regenerated locally.
## Command
```bash
npm run vsm:generate
```
## Basic DSL shape
```yaml
title: Testing Flow
subtitle: Example snapshot
slug: testing-flow
stages:
  - name: Coding
    ct: 1.25d
    queue: 3
    availability: 100%
  - name: Testing
    ct: 1d
    queue: 13
    availability: 33%
    pass_rate: 85%
    reject_to: Coding
```
## Required fields
- `title` (required): chart title.
- `stages` (required): ordered non-empty list of stages.
- `stage.name` (required): stage/station label.
- `stage.ct` (required): cycle time.
## Defaults
- `stage.queue`: defaults to `0`.
- `stage.availability`: defaults to `100%`.
- `stage.pass_rate`: omitted by default.
- `stage.reject_to`: omitted by default.
- `stage.wt`: calculated when omitted.
## Stage fields
- `name`: stage name.
- `ct`: cycle time input.
  - Duration form (time per item): `2d`, `4h`, `30m`, `1w`.
  - Rate form (items per time): `2/day`, `3/h`, `10/week`.
- `queue`: queue population shown in the queue triangle.
- `queue_label` (optional): label above queue triangle (default `Queue`).
- `availability` (optional): station availability.
  - Fraction form: `0.33`.
  - Percent form: `33%`.
- `wt` (optional): explicit wait time duration. If omitted, it is calculated.
- `pass_rate` (optional): pass percentage/fraction shown as `Pass: ...`.
- `reject_to` (optional): single destination stage name rendered as `↺ <stage>`.
## Quality gate rules
- `pass_rate`: display only when provided.
- `reject_to`: display only when provided.
- `reject_to` must reference the name of a prior stage.
- `reject_to` accepts one destination only.
## Calculated values
- `ECT = CT ÷ Availability`
- `WT = Queue × CT ÷ Availability` (when `wt` is omitted)
- `Efficiency = Σ(CT) / Σ(CT + WT)`
- `OverallPassRate = Π(pass_rate)` using only stages that explicitly define `pass_rate`
If no stage defines `pass_rate`, `Overall Pass` is not rendered.
## Rendering behavior
- Stage box content:
  - Stage name
  - `ECT: <value> (<availability>)`
  - Optional `Pass: ...`
  - Optional `↺ <prior stage>`
- Lead-time ladder:
  - Wait row (`WT`) and work row (`CT`) are both rendered.
  - CT and WT labels are rendered in day units (`d`) for cross-stage comparability.
  - Overall metrics appear at far right:
    - `Efficiency: ...`
    - `Overall Pass: ...` (only when pass rates exist)
## Marp linking
After generation, embed generated SVGs directly in slides:
```markdown
![w:940](../assets/images/vsm-generated/testing-flow.svg)
```
