import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

import { modelFromDsl, renderSvg } from '../scripts/generate-vsm-svgs.mjs'

const fixtureDir = fileURLToPath(new URL('../vsm/source/', import.meta.url))

test('defaults apply queue=0, availability=100%, and derived WT when omitted', () => {
  const model = modelFromDsl(
    {
      title: 'Defaults Fixture',
      stages: [{ name: 'Only Stage', ct: '2d' }],
    },
    'defaults-fixture'
  )
  const svg = renderSvg(model, 'defaults-fixture.vsm.yaml')

  assert.match(svg, /class=\"queue-value\">0</, 'Expected default queue value to render as 0')
  assert.match(
    svg,
    /ECT: 2\.00d \(100%\)/,
    'Expected ECT line to use default availability when availability is omitted'
  )
  assert.match(svg, /class=\"timeline-work-text\">2\.00d</, 'Expected CT ladder label in day units')
  assert.match(
    svg,
    /class=\"timeline-wait-text\">0\.0d</,
    'Expected derived WT of 0.0d when queue defaults to 0'
  )
})

test('title and stage ct are required', () => {
  assert.throws(
    () =>
      modelFromDsl(
        {
          stages: [{ name: 'Stage A', ct: '1d' }],
        },
        'missing-title'
      ),
    /Top-level field \"title\" is required/
  )

  assert.throws(
    () =>
      modelFromDsl(
        {
          title: 'Missing CT',
          stages: [{ name: 'Stage A' }],
        },
        'missing-ct'
      ),
    /Stage #1 is missing required field: ct/
  )
})

test('reject_to must be a single destination and reference a prior stage', () => {
  assert.throws(
    () =>
      modelFromDsl(
        {
          title: 'Reject To List',
          stages: [
            { name: 'Coding', ct: '1d' },
            { name: 'Testing', ct: '1d', reject_to: ['Coding', 'Design'] },
          ],
        },
        'reject-list'
      ),
    /invalid reject_to value/
  )

  assert.throws(
    () =>
      modelFromDsl(
        {
          title: 'Reject To Future Stage',
          stages: [
            { name: 'Testing', ct: '1d', reject_to: 'Coding' },
            { name: 'Coding', ct: '1d' },
          ],
        },
        'reject-future'
      ),
    /reject_to must reference a prior stage name: Coding/
  )
})

test('quality gate fields render only when supplied and reject marker uses ↺', () => {
  const model = modelFromDsl(
    {
      title: 'Quality Gates',
      stages: [
        { name: 'Coding', ct: '1d' },
        { name: 'Testing', ct: '1d', pass_rate: '85%', reject_to: 'Coding' },
      ],
    },
    'quality-gates'
  )
  const svg = renderSvg(model, 'quality-gates.vsm.yaml')

  assert.match(svg, /Pass: 85%/, 'Expected pass rate label when pass_rate is provided')
  assert.match(svg, /↺ Coding/, 'Expected reject_to to render as loop-back marker')
  assert.doesNotMatch(svg, /Reject →/, 'Expected old reject rendering text to be removed')
})

test('overall metrics render efficiency and pass product at ladder right edge', () => {
  const model = modelFromDsl(
    {
      title: 'Overall Metrics',
      stages: [
        { name: 'Coding', ct: '1d', queue: 2, pass_rate: '90%' },
        { name: 'Testing', ct: '1d', queue: 3, pass_rate: '80%' },
        { name: 'Deploy', ct: '1d', queue: 0 },
      ],
    },
    'overall-metrics'
  )
  const svg = renderSvg(model, 'overall-metrics.vsm.yaml')

  assert.match(svg, /Efficiency: 37\.5%/, 'Expected efficiency from ΣCT / Σ\(CT\+WT\)')
  assert.match(svg, /Overall Pass: 72\.0%/, 'Expected pass product 0.9 × 0.8 = 72.0%')
})

test('overall pass is omitted when no stage supplies pass_rate', () => {
  const model = modelFromDsl(
    {
      title: 'No Pass Rates',
      stages: [
        { name: 'Coding', ct: '1d', queue: 2 },
        { name: 'Testing', ct: '1d', queue: 1 },
      ],
    },
    'no-pass-rates'
  )
  const svg = renderSvg(model, 'no-pass-rates.vsm.yaml')

  assert.match(svg, /Efficiency: /, 'Expected efficiency to always be rendered')
  assert.doesNotMatch(svg, /Overall Pass:/, 'Expected Overall Pass to be omitted with no pass_rate')
})

test('merge-hell-team source derives day-normalized CT/WT with stepped ladder geometry', async () => {
  const raw = await fs.readFile(`${fixtureDir}/merge-hell-team.vsm.yaml`, 'utf8')
  const dsl = parseYaml(raw)
  const model = modelFromDsl(dsl, 'merge-hell-team.vsm')
  const svg = renderSvg(model, 'merge-hell-team.vsm.yaml')

  assert.match(svg, /class=\"timeline-wait-text\">4\.0d</, 'Expected Development WT of 4.0d')
  assert.match(svg, /class=\"timeline-wait-text\">6\.0d</, 'Expected Merge WT of 6.0d')
  assert.match(svg, /class=\"timeline-wait-text\">1\.0d</, 'Expected Integration WT of 1.0d')
  assert.match(svg, /class=\"timeline-work-text\">2\.00d</, 'Expected Development CT of 2.00d')
  assert.match(svg, /class=\"timeline-work-text\">0\.40d</, 'Expected Merge CT of 0.40d')
  assert.match(svg, /class=\"timeline-work-text\">0\.33d</, 'Expected Integration CT of 0.33d')

  const waitLabelCount = (svg.match(/class=\"timeline-wait-text\"/g) ?? []).length
  assert.equal(waitLabelCount, 3, 'Expected one wait label per stage with defaulted queue handling')

  const timelineMatch = svg.match(/class=\"timeline-line\" data-wait-y=\"([^\"]+)\" data-work-y=\"([^\"]+)\"/)
  assert.ok(timelineMatch, 'Expected timeline metadata containing wait/work Y values')
  const waitY = Number.parseFloat(timelineMatch[1])
  const workY = Number.parseFloat(timelineMatch[2])
  assert.ok(workY - waitY >= 20, 'Expected visible wait/work separation >= 20px')
  assert.match(svg, / V /, 'Expected stepped ladder path with vertical transitions')
})

test('availability influences ECT and WT math, including explicit WT normalization', async () => {
  const raw = await fs.readFile(`${fixtureDir}/limited-availability-10days.vsm.yaml`, 'utf8')
  const dsl = parseYaml(raw)
  const model = modelFromDsl(dsl, 'limited-availability-10days.vsm')
  const svg = renderSvg(model, 'limited-availability-10days.vsm.yaml')

  assert.match(svg, /ECT: 0\.28d \(15%\)/, 'Expected Code Review ECT from 1h at 15% availability')
  assert.match(svg, /ECT: 3\.03d \(33%\)/, 'Expected Testing ECT from 1d at 33% availability')
  assert.match(
    svg,
    /class=\"timeline-wait-text\">5\.0d</,
    'Expected explicit WT 120h to normalize to 5.0d on ladder'
  )
  assert.match(svg, /class=\"timeline-wait-text\">39\.4d</, 'Expected explicit WT in days to stay 39.4d')
  assert.match(svg, /Efficiency: 4\.8%/, 'Expected efficiency derived from CT and WT totals')
})
