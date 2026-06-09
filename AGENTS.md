# Agent Guidance for VSM Workshop Work

## Canonical content sources
- `Faster-and-More-Predictable-Workshop-Summary.md`
- `Workshop-Principles-Sources.md`
- `roots.md`
- `Source-Type-Whyitmatters.csv`

When content conflicts, prefer workshop intent and flow diagnostics over notation trivia.

## Workshop intent
- Build **skill transfer** more than lecture delivery.
- Teach participants to **read, draw, diagnose, and improve** delivery systems using VSM.
- Keep tone practical, informative, and serious-with-light-whimsy.
- Avoid sales framing and blame language.

## Slide design constraints
- No wall-of-text slides.
- Keep each slide focused on one practical move.
- Use sparse bullets and facilitator prompts.
- Put detail in speaker narrative, not on-slide paragraphs.

## Facilitation pattern
Use this sequence repeatedly:
1. Observation
2. Interpretation
3. Prediction
4. Reveal
5. Theory

Ask: “What is this system actually optimized for?” (POSIWID lens)

## Operational checklist for edits
When updating workshop materials:
1. Reflect `Faster-and-More-Predictable-Workshop-Summary.md` in structure and prompts.
2. Preserve principle lineage and source mapping from `Workshop-Principles-Sources.md`.
3. Preserve evidence roots from `roots.md`.
4. Keep `roots.md` aligned with `Source-Type-Whyitmatters.csv`.
5. Prefer flow/system effects over individual-performance framing.
6. Keep queue, gather, constraint, and rework visibility central.
7. Run `./run_tests`.
8. If cleanup/formatting is needed, run `./tidy`.

## Script-first workflow
- For testing and validation, use `./run_tests` (not direct `npm test` / `npm run check`).
- For cleanup and formatting, use `./tidy` (not ad-hoc cleanup commands).
- If dependencies change or new upstream changes are pulled, run `./prepare` to refresh the environment.

## VSM generator non-regression guardrails
- Preserve stepped lead-time ladder behavior: wait row above work row, with visible vertical separation.
- For queued stages, do not silently drop wait points/ticks; queues must still render a wait-side ladder step.
- When `wt` is omitted and `queue` + `ct` are present, keep automatic wait-time derivation enabled.
- Any edits to `scripts/generate-vsm-svgs.mjs` must keep `tests/generate-vsm-svgs.test.mjs` passing and should add/adjust tests for new ladder behaviors.

## Upcoming-session focus
Upcoming sessions should focus on generating VSM graphics and behavior visuals:
- VSM graphics suitable for Marp embedding.
- Visual motifs similar to “Faster and More Predictable” (queues, loops, waits, handoffs, human behavior behind flow outcomes).

Keep graphics-oriented work separate from notation debates.
