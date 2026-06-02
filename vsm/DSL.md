# VSM DSL v0 (planning + first implementation)

This project uses YAML as a human-readable DSL for value-stream map scenarios.

## Directory layout

- Source DSL files: `vsm/source/`
- Generated SVG output: `assets/images/vsm-generated/`
- Generator script: `scripts/generate-vsm-svgs.mjs`

Generated SVG files are ignored by git, so they can be regenerated locally.

## Commands

```bash
npm run vsm:generate
```

## Basic DSL shape

```yaml
title: Healthy Team
subtitle: Baseline flow snapshot
slug: healthy-team
stages:
  - name: Analysis
    queue: 9
    ct: 2d
    wt: 18d
  - name: Design
    queue: 11
    ct: 1d
    wt: 11d
```

## Fields

Top-level:

- `title` (optional): chart title
- `subtitle` (optional): second title line
- `slug` or `output` (optional): output filename stem
- `stages` (required): ordered list of process stages

Stage:

- `name` (required): process/station name
- `queue` (optional): queue count shown in an inventory triangle before the stage
- `queue_label` (optional): text label above queue triangle (default: `Queue`)
- `ct` (optional): cycle-time input used for display and wait-time math
  - Duration form (time per item): `2d`, `4h`, `30m`, `1w`
  - Rate form (items per time): `2/day`, `3/h`, `10/week`
- `wt` (optional): wait time value; if omitted, generator auto-derives from `queue` + `ct`
  - Duration CT form uses `wt = queue × ct` (for example, `queue: 10`, `ct: 0.5d` gives `wt: 5d`)
  - Rate CT form uses `wt = queue ÷ ct` (for example, `queue: 10`, `ct: 2/day` gives `wt: 5d`)
- `quality_gate` (optional): gate details shown in stage box footer
  - `pass_rate`
  - `reject_to`

## Marp linking

After generation, use the SVG directly in slides:

```markdown
![w:940](../assets/images/vsm-generated/healthy-team.svg)
```

## Planned extensions (next slices)

- Explicit gather nodes and fan-in/fan-out links
- Rework loop arrows between arbitrary stages
- Optional role/ownership overlays (for behavior maps)
- Theme presets for scenario variants
