import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

import { modelFromDsl, renderSvg } from '../scripts/generate-vsm-svgs.mjs'

const fixtureDir = fileURLToPath(new URL('../vsm/source/', import.meta.url))

test('queued stages without explicit WT render a visible wait/work ladder separation', () => {
  const model = modelFromDsl(
    {
      stages: [
        { name: 'Stage A', queue: 2, ct: '2d' },
        { name: 'Stage B', queue: 3, ct: '4h' },
        { name: 'Stage C', queue: 1, ct: '30m' },
      ],
    },
    'regression-fixture'
  )
  const svg = renderSvg(model, 'regression-fixture.vsm.yaml')

  const waitLabelCount = (svg.match(/class="timeline-wait-text"/g) ?? []).length
  assert.ok(waitLabelCount > 0, 'Expected wait labels for queued stages when WT is omitted')

  const timelineMatch = svg.match(/class="timeline-line" data-wait-y="([^"]+)" data-work-y="([^"]+)"/)
  assert.ok(timelineMatch, 'Expected timeline metadata containing wait/work Y values')

  const waitY = Number.parseFloat(timelineMatch[1])
  const workY = Number.parseFloat(timelineMatch[2])
  assert.ok(Number.isFinite(waitY), 'Expected wait Y value to be numeric')
  assert.ok(Number.isFinite(workY), 'Expected work Y value to be numeric')
  assert.ok(waitY < workY, `Expected wait row to be above work row (wait=${waitY}, work=${workY})`)

  const separation = workY - waitY
  assert.ok(separation >= 20, `Expected visible wait/work separation >= 20px, got ${separation}`)

  const endcapRegex = new RegExp(
    `<line x1="[^"]+" y1="${waitY}" x2="[^"]+" y2="${workY}" class="timeline-endcap"/>`
  )
  assert.match(
    svg,
    endcapRegex,
    'Expected timeline endcaps to span from wait row to work row for visible ladder contrast'
  )

  assert.match(svg, / V /, 'Expected timeline path to include vertical transitions (non-flat ladder)')
})

test('merge-hell-team source derives and renders WT values with stepped ladder geometry', async () => {
  const raw = await fs.readFile(`${fixtureDir}/merge-hell-team.vsm.yaml`, 'utf8')
  const dsl = parseYaml(raw)
  const model = modelFromDsl(dsl, 'merge-hell-team.vsm')
  const svg = renderSvg(model, 'merge-hell-team.vsm.yaml')

  assert.match(svg, /WT: 4d/, 'Expected derived WT for Development queue')
  assert.match(svg, /WT: 144h/, 'Expected derived WT for Merge queue with decimal-hour CT')
  assert.match(svg, /WT: 24h/, 'Expected derived WT for Integration queue')

  const waitLabelCount = (svg.match(/class="timeline-wait-text"/g) ?? []).length
  assert.equal(waitLabelCount, 3, 'Expected one wait label per queued stage')

  const timelineMatch = svg.match(/class="timeline-line" data-wait-y="([^"]+)" data-work-y="([^"]+)"/)
  assert.ok(timelineMatch, 'Expected timeline metadata containing wait/work Y values')
  const waitY = Number.parseFloat(timelineMatch[1])
  const workY = Number.parseFloat(timelineMatch[2])
  assert.ok(workY - waitY >= 20, 'Expected at least 20px wait/work separation')
  assert.match(svg, / V /, 'Expected ladder path to include vertical transitions')
})

test('omitted optional fields do not render visible entries', () => {
  const model = modelFromDsl(
    {
      stages: [{ name: 'Only Stage', ct: '2d' }],
    },
    'minimal-fixture'
  )
  const svg = renderSvg(model, 'minimal-fixture.vsm.yaml')

  assert.doesNotMatch(svg, /class="title-text"/, 'Expected no visible title text when title is omitted')
  assert.doesNotMatch(
    svg,
    /class="subtitle-text"/,
    'Expected no visible subtitle text when subtitle is omitted'
  )
  assert.doesNotMatch(svg, /WT:/, 'Expected no WT metric when wt and queue are omitted')
  assert.doesNotMatch(svg, /class="queue-triangle"/, 'Expected no queue triangle when queue is omitted')
  assert.doesNotMatch(svg, /class="queue-label"/, 'Expected no queue label when queue is omitted')
  assert.doesNotMatch(svg, /class="queue-value"/, 'Expected no queue value when queue is omitted')
  assert.doesNotMatch(
    svg,
    /class="timeline-wait-text"/,
    'Expected no wait timeline labels when queue/wt are omitted'
  )
  assert.doesNotMatch(svg, /Pass:/, 'Expected no pass-rate gate text when quality gate is omitted')
  assert.doesNotMatch(svg, /Reject →/, 'Expected no reject-to gate text when quality gate is omitted')
  assert.match(svg, /class="timeline-work-text">2d</, 'Expected CT timeline entry to still render')
})

test('quality gate renders only supplied subfields', () => {
  const model = modelFromDsl(
    {
      stages: [
        { name: 'Pass Only', ct: '1d', quality_gate: { pass_rate: '98%' } },
        { name: 'Reject Only', ct: '1d', quality_gate: { reject_to: 'Development' } },
      ],
    },
    'quality-gate-fixture'
  )
  const svg = renderSvg(model, 'quality-gate-fixture.vsm.yaml')

  const passMatches = svg.match(/Pass:/g) ?? []
  const rejectMatches = svg.match(/Reject →/g) ?? []
  assert.equal(passMatches.length, 1, 'Expected one pass-rate entry for the stage that supplies pass_rate')
  assert.equal(
    rejectMatches.length,
    1,
    'Expected one reject-to entry for the stage that supplies reject_to'
  )
})
