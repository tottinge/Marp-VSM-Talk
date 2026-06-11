import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

import { modelFromDsl, renderSvg } from '../scripts/generate-vsm-svgs.mjs'

const fixtureDir = fileURLToPath(new URL('../vsm/source/', import.meta.url))
function approxEqual(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `Expected ${expected} (±${epsilon}), got ${actual}`
  )
}

function buildDsl(stages, overrides = {}) {
  return {
    title: 'Test Flow',
    stages,
    ...overrides,
  }
}

function buildModel(stages, overrides = {}, fileBaseName = 'fixture') {
  return modelFromDsl(buildDsl(stages, overrides), fileBaseName)
}

function renderFromDsl(dsl, sourceName = 'fixture.vsm.yaml', fileBaseName = 'fixture') {
  return renderSvg(modelFromDsl(dsl, fileBaseName), sourceName)
}

function countMatches(text, regex) {
  return (text.match(regex) ?? []).length
}

function textByClass(svg, className) {
  const matcher = new RegExp(`class=\\\"${className}\\\">([^<]+)<`, 'g')
  const collected = []
  let match = matcher.exec(svg)
  while (match !== null) {
    collected.push(match[1])
    match = matcher.exec(svg)
  }
  return collected
}

async function loadFixtureDsl(fileName) {
  const raw = await fs.readFile(path.join(fixtureDir, fileName), 'utf8')
  return parseYaml(raw)
}

test('validates top-level document shape and stages collection', () => {
  assert.throws(() => modelFromDsl(null, 'invalid-top-level'), /Top-level document must be an object/)
  assert.throws(
    () => modelFromDsl([], 'invalid-top-level'),
    /Top-level field \"stages\" must be a non-empty array/
  )
  assert.throws(
    () => modelFromDsl({ title: 'Missing stages' }, 'missing-stages'),
    /Top-level field \"stages\" must be a non-empty array/
  )
  assert.throws(
    () => modelFromDsl({ title: 'Empty stages', stages: [] }, 'empty-stages'),
    /Top-level field \"stages\" must be a non-empty array/
  )
})

test('requires title, stage object, stage name, and stage ct', () => {
  assert.throws(
    () => modelFromDsl({ stages: [{ name: 'A', ct: '1d' }] }, 'missing-title'),
    /Top-level field \"title\" is required/
  )
  assert.throws(() => buildModel([null]), /Stage #1 is not an object/)
  assert.throws(() => buildModel([{ ct: '1d' }]), /Stage #1 is missing required field: name/)
  assert.throws(() => buildModel([{ name: 'A' }]), /Stage #1 is missing required field: ct/)
})

test('rejects duplicate stage names', () => {
  assert.throws(
    () =>
      buildModel([
        { name: 'A', ct: '1d' },
        { name: 'A', ct: '2d' },
      ]),
    /Stage #2 has duplicate name: A/
  )
})

test('validates ct syntax and positivity', () => {
  for (const invalidCt of ['abc', '1fortnight', '0d', '-1d', '0/day']) {
    assert.throws(
      () => buildModel([{ name: 'A', ct: invalidCt }]),
      /Stage #1 has invalid ct value/,
      `Expected invalid ct to fail: ${invalidCt}`
    )
  }
})

test('validates queue values', () => {
  for (const invalidQueue of [-1, '-3', 'bad']) {
    assert.throws(
      () => buildModel([{ name: 'A', ct: '1d', queue: invalidQueue }]),
      /Stage #1 has invalid queue value/,
      `Expected invalid queue to fail: ${invalidQueue}`
    )
  }
})

test('validates availability values', () => {
  for (const invalidAvailability of [0, '0%', -1, '101%', 'bad']) {
    assert.throws(
      () => buildModel([{ name: 'A', ct: '1d', availability: invalidAvailability }]),
      /Stage #1 has invalid availability value/,
      `Expected invalid availability to fail: ${invalidAvailability}`
    )
  }
})

test('validates pass_rate values', () => {
  for (const invalidPassRate of [-1, '101%', 'bad']) {
    assert.throws(
      () => buildModel([{ name: 'A', ct: '1d', pass_rate: invalidPassRate }]),
      /Stage #1 has invalid pass_rate value/,
      `Expected invalid pass_rate to fail: ${invalidPassRate}`
    )
  }
})

test('validates reject_to shape and prior-stage constraint', () => {
  assert.throws(
    () => buildModel([{ name: 'A', ct: '1d', reject_to: ['B'] }]),
    /Stage #1 has invalid reject_to value/
  )
  assert.throws(
    () => buildModel([{ name: 'A', ct: '1d', reject_to: '' }]),
    /Stage #1 has invalid reject_to value/
  )
  assert.throws(
    () =>
      buildModel([
        { name: 'Review', ct: '1d', reject_to: 'Build' },
        { name: 'Build', ct: '1d' },
      ]),
    /Stage #1 reject_to must reference a prior stage name: Build/
  )
})

test('validates explicit wt duration format', () => {
  assert.throws(
    () => buildModel([{ name: 'A', ct: '1d', queue: 4, wt: 'bogus' }]),
    /Stage #1 has invalid wt value/
  )
  assert.throws(
    () => buildModel([{ name: 'A', ct: '1d', queue: 4, wt: '3/day' }]),
    /Stage #1 has invalid wt value/
  )
})

test('applies defaults for queue, availability, and derived wait time', () => {
  const stage = buildModel([{ name: 'A', ct: '2d' }]).stages[0]
  assert.equal(stage.queue, '0')
  assert.equal(stage.availability, 1)
  assert.equal(stage.availabilityLabel, '100%')
  approxEqual(stage.ctDays, 2)
  approxEqual(stage.wtDays, 0)
  approxEqual(stage.ectDays, 2)
  assert.equal(stage.ctLabel, '2.00d')
  assert.equal(stage.wtLabel, '0.0d')
  assert.equal(stage.ectLabel, '2.00d')
})

test('parses duration ct aliases into normalized day units', () => {
  const cases = [
    { ct: '60m', expectedDays: 1 / 24 },
    { ct: '1hr', expectedDays: 1 / 24 },
    { ct: '24h', expectedDays: 1 },
    { ct: '1day', expectedDays: 1 },
    { ct: '1wk', expectedDays: 7 },
  ]
  for (const { ct, expectedDays } of cases) {
    const stage = buildModel([{ name: 'A', ct }]).stages[0]
    approxEqual(stage.ctDays, expectedDays)
  }
})

test('parses rate ct forms into day units', () => {
  const cases = [
    { ct: '2/day', expectedDays: 0.5 },
    { ct: '2 per day', expectedDays: 0.5 },
    { ct: '4/h', expectedDays: 1 / 96 },
    { ct: '1/wk', expectedDays: 7 },
  ]
  for (const { ct, expectedDays } of cases) {
    const stage = buildModel([{ name: 'A', ct }]).stages[0]
    approxEqual(stage.ctDays, expectedDays)
  }
})

test('normalizes availability inputs from fraction and percent forms', () => {
  const cases = ['33%', 33, '0.33', 0.33]
  for (const availability of cases) {
    const stage = buildModel([{ name: 'A', ct: '1d', availability }]).stages[0]
    approxEqual(stage.availability, 0.33)
    assert.equal(stage.availabilityLabel, '33%')
    assert.equal(stage.ectLabel, '3.03d')
  }
})

test('normalizes pass_rate inputs from fraction and percent forms', () => {
  const cases = ['80%', 80, '0.8', 0.8]
  for (const passRate of cases) {
    const stage = buildModel([{ name: 'A', ct: '1d', pass_rate: passRate }]).stages[0]
    approxEqual(stage.passRate, 0.8)
    assert.equal(stage.passRateLabel, '80%')
  }
})

test('supports quality gate aliases in snake_case and camelCase', () => {
  const fromSnakeCase = buildModel([
    { name: 'Build', ct: '1d' },
    { name: 'Review', ct: '1d', quality_gate: { pass_rate: '85%', reject_to: 'Build' } },
  ]).stages[1]
  assert.equal(fromSnakeCase.passRateLabel, '85%')
  assert.equal(fromSnakeCase.rejectTo, 'Build')

  const fromCamelCase = buildModel([
    { name: 'Build', ct: '1d' },
    { name: 'Review', ct: '1d', qualityGate: { passRate: 0.9, rejectTo: 'Build' } },
  ]).stages[1]
  assert.equal(fromCamelCase.passRateLabel, '90%')
  assert.equal(fromCamelCase.rejectTo, 'Build')
})

test('supports availability aliases station_availability and stationAvailability', () => {
  const withSnake = buildModel([{ name: 'A', ct: '1d', station_availability: '25%' }]).stages[0]
  const withCamel = buildModel([{ name: 'A', ct: '1d', stationAvailability: 25 }]).stages[0]
  approxEqual(withSnake.availability, 0.25)
  approxEqual(withCamel.availability, 0.25)
  assert.equal(withSnake.ectLabel, '4.00d')
  assert.equal(withCamel.ectLabel, '4.00d')
})

test('uses output naming precedence: output, then slug, then file base name fallback', () => {
  const fromOutput = buildModel([{ name: 'A', ct: '1d' }], { output: 'My Output', slug: 'ignored' })
  const fromSlug = buildModel([{ name: 'A', ct: '1d' }], { slug: 'My Slug' })
  const fallbackBase = buildModel([{ name: 'A', ct: '1d' }], { slug: '!!!' }, 'fallback-base')
  assert.equal(fromOutput.outputName, 'my-output.svg')
  assert.equal(fromSlug.outputName, 'my-slug.svg')
  assert.equal(fallbackBase.outputName, 'fallback-base.svg')
})

test('computes ECT and derived WT from CT, queue, and availability', () => {
  const stage = buildModel([{ name: 'A', ct: '2d', queue: 4, availability: '50%' }]).stages[0]
  approxEqual(stage.ctDays, 2)
  approxEqual(stage.ectDays, 4)
  approxEqual(stage.wtDays, 16)
  assert.equal(stage.ectLabel, '4.00d')
  assert.equal(stage.wtLabel, '16.0d')
})

test('uses explicit WT instead of derived WT when provided', () => {
  const stage = buildModel([{ name: 'A', ct: '2d', queue: 4, availability: '50%', wt: '3d' }]).stages[0]
  approxEqual(stage.wtDays, 3)
  assert.equal(stage.wtLabel, '3.0d')
})

test('computes efficiency as ΣCT / Σ(CT+WT)', () => {
  const model = buildModel([
    { name: 'A', ct: '1d', queue: 1 },
    { name: 'B', ct: '2d', queue: 0 },
  ])
  assert.equal(model.efficiencyLabel, '75.0%')
})

test('computes overall pass as product of stages that explicitly define pass_rate', () => {
  const model = buildModel([
    { name: 'A', ct: '1d', pass_rate: '80%' },
    { name: 'B', ct: '1d' },
    { name: 'C', ct: '1d', pass_rate: 0.5 },
  ])
  assert.equal(model.overallPassLabel, '40.0%')
})

test('allows pass_rate of zero and reports overall pass as 0.0%', () => {
  const model = buildModel([
    { name: 'A', ct: '1d', pass_rate: '100%' },
    { name: 'B', ct: '1d', pass_rate: 0 },
  ])
  assert.equal(model.overallPassLabel, '0.0%')
})

test('omits Overall Pass metric when no stage provides pass_rate', () => {
  const svg = renderFromDsl(
    buildDsl([
      { name: 'A', ct: '1d', queue: 2 },
      { name: 'B', ct: '1d', queue: 1 },
    ]),
    'no-pass.vsm.yaml'
  )
  assert.match(svg, /Efficiency: /)
  assert.doesNotMatch(svg, /Overall Pass:/)
})

test('renders default and custom queue labels', () => {
  const svg = renderFromDsl(
    buildDsl([
      { name: 'A', ct: '1d', queue: 1 },
      { name: 'B', ct: '1d', queue: 2, queue_label: 'Input Buffer' },
    ]),
    'queue-labels.vsm.yaml'
  )
  const labels = textByClass(svg, 'queue-label')
  assert.deepEqual(labels, ['Queue', 'Input Buffer'])
})

test('renders pass and rework lines only when provided', () => {
  const svg = renderFromDsl(
    buildDsl([
      { name: 'Build', ct: '1d' },
      { name: 'Test', ct: '1d', pass_rate: '85%', reject_to: 'Build' },
    ]),
    'quality-gate-lines.vsm.yaml'
  )
  assert.equal(countMatches(svg, /class=\"gate-text\">Pass: /g), 1)
  assert.equal(countMatches(svg, /↺ /g), 1)
  assert.doesNotMatch(svg, /Reject →/)
})

test('renders stepped timeline path with explicit wait/work metadata', () => {
  const svg = renderFromDsl(
    buildDsl([
      { name: 'A', ct: '1d', queue: 1 },
      { name: 'B', ct: '1d', queue: 2 },
    ]),
    'timeline-metadata.vsm.yaml'
  )
  const timelineMatch = svg.match(/class=\"timeline-line\" data-wait-y=\"([^\"]+)\" data-work-y=\"([^\"]+)\"/)
  assert.ok(timelineMatch)
  const waitY = Number.parseFloat(timelineMatch[1])
  const workY = Number.parseFloat(timelineMatch[2])
  assert.ok(workY - waitY >= 20)
  assert.match(svg, / V /)
})

test('renders CT and WT ladder labels in normalized day units', () => {
  const svg = renderFromDsl(
    buildDsl([{ name: 'A', ct: '12h', queue: 2, availability: '100%' }]),
    'day-normalized-labels.vsm.yaml'
  )
  assert.match(svg, /class=\"timeline-work-text\">0\.50d</)
  assert.match(svg, /class=\"timeline-wait-text\">1\.0d</)
})

test('renders overall metrics using overall-metric-text style class', () => {
  const svg = renderFromDsl(
    buildDsl([
      { name: 'A', ct: '1d', queue: 1, pass_rate: '90%' },
      { name: 'B', ct: '1d', queue: 1, pass_rate: '80%' },
    ]),
    'overall-metric-style.vsm.yaml'
  )
  assert.match(svg, /class=\"overall-metric-text\">Efficiency: /)
  assert.match(svg, /class=\"overall-metric-text\">Overall Pass: 72\.0%/)
})

test('escapes XML-sensitive characters in title and stage text', () => {
  const svg = renderFromDsl(
    buildDsl(
      [
        { name: 'Build <Core> & Verify', ct: '1d' },
        { name: 'Test', ct: '1d', reject_to: 'Build <Core> & Verify' },
      ],
      { title: 'A & B <Flow>' }
    ),
    'xml-escaping.vsm.yaml'
  )
  assert.match(svg, /A &amp; B &lt;Flow&gt;/)
  assert.match(svg, /Build &lt;Core&gt; &amp; Verify/)
  assert.match(svg, /↺ Build &lt;Core&gt; &amp; Verify/)
})

test('merge-hell fixture keeps day-normalized labels and stepped ladder geometry', async () => {
  const dsl = await loadFixtureDsl('merge-hell-team.vsm.yaml')
  const model = modelFromDsl(dsl, 'merge-hell-team')
  const svg = renderSvg(model, 'merge-hell-team.vsm.yaml')

  assert.match(svg, /class=\"timeline-wait-text\">4\.0d</)
  assert.match(svg, /class=\"timeline-wait-text\">6\.0d</)
  assert.match(svg, /class=\"timeline-wait-text\">1\.0d</)
  assert.match(svg, /class=\"timeline-work-text\">2\.00d</)
  assert.match(svg, /class=\"timeline-work-text\">0\.40d</)
  assert.match(svg, /class=\"timeline-work-text\">0\.33d</)
  assert.equal(countMatches(svg, /class=\"timeline-wait-text\"/g), model.stages.length)

  const timelineMatch = svg.match(/class=\"timeline-line\" data-wait-y=\"([^\"]+)\" data-work-y=\"([^\"]+)\"/)
  assert.ok(timelineMatch)
  const waitY = Number.parseFloat(timelineMatch[1])
  const workY = Number.parseFloat(timelineMatch[2])
  assert.ok(workY - waitY >= 20)
  assert.match(svg, / V /)
})

test('limited-availability fixture keeps ECT and explicit WT normalization behavior', async () => {
  const dsl = await loadFixtureDsl('limited-availability-10days.vsm.yaml')
  const model = modelFromDsl(dsl, 'limited-availability-10days')
  const svg = renderSvg(model, 'limited-availability-10days.vsm.yaml')

  assert.match(svg, /ECT: 0\.28d \(15%\)/)
  assert.match(svg, /ECT: 3\.03d \(33%\)/)
  assert.match(svg, /class=\"timeline-wait-text\">5\.0d</)
  assert.match(svg, /class=\"timeline-wait-text\">39\.4d</)
  assert.equal(model.efficiencyLabel, '4.8%')
})

test('shift-right fixture renders nested quality gate data', async () => {
  const dsl = await loadFixtureDsl('shift-right-team.vsm.yaml')
  const model = modelFromDsl(dsl, 'shift-right-team')
  const svg = renderSvg(model, 'shift-right-team.vsm.yaml')
  assert.equal(model.overallPassLabel, '70.0%')
  assert.match(svg, /Pass: 70%/)
  assert.match(svg, /↺ Development/)
})

test('specialist-organization fixture remains invalid because reject_to must target prior stage', async () => {
  const dsl = await loadFixtureDsl('specialist-organization.vsm.yaml')
  assert.throws(
    () => modelFromDsl(dsl, 'specialist-organization'),
    /reject_to must reference a prior stage name: Development/
  )
})
