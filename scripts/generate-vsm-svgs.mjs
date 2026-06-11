#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse as parseYaml } from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const sourceDir = path.join(repoRoot, 'vsm', 'source')
const outputDir = path.join(repoRoot, 'assets', 'images', 'vsm-generated')

const extAllowed = new Set(['.yaml', '.yml'])

async function clearGeneratedSvgs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const svgFiles = entries.filter(
    (entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.svg'
  )

  await Promise.all(svgFiles.map((entry) => fs.unlink(path.join(dir, entry.name))))
  return svgFiles.length
}

const layout = {
  paddingX: 50,
  paddingY: 44,
  boxWidth: 230,
  boxHeight: 136,
  queueWidth: 64,
  queueHeight: 54,
  queueGap: 28,
  stageGap: 80,
  timelineTopGap: 26,
  timelineRowGap: 32,
  timelineLabelToLineGap: 8,
  timelineWorkTextGap: 14,
  overallMetricsTopGap: 28,
  overallMetricsRowGap: 22,
  overallMetricsBottomPadding: 16,
  timelineMinSeparation: 20,
}

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}

function optionalDisplayText(value) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text === '' ? null : text
}
function resolveSourceSlug(dsl, fileBaseName) {
  if (!dsl || typeof dsl !== 'object') return fileBaseName
  const explicitSlug = optionalDisplayText(dsl.slug ?? dsl.output)
  return explicitSlug ?? fileBaseName
}
function formatScopedFileError(fileName, slugName, message) {
  return `[file: ${fileName}] [slug: ${slugName}] ${message}`
}

function wrapText(text, maxChars) {
  const words = String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return ['']

  const lines = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxChars) {
      current = next
      continue
    }
    if (current) lines.push(current)
    current = word
  }
  if (current) lines.push(current)
  return lines
}

const durationUnitAliasMap = new Map([
  ['m', 'm'],
  ['min', 'm'],
  ['mins', 'm'],
  ['minute', 'm'],
  ['minutes', 'm'],
  ['h', 'h'],
  ['hr', 'h'],
  ['hrs', 'h'],
  ['hour', 'h'],
  ['hours', 'h'],
  ['d', 'd'],
  ['day', 'd'],
  ['days', 'd'],
  ['w', 'w'],
  ['wk', 'w'],
  ['wks', 'w'],
  ['week', 'w'],
  ['weeks', 'w'],
])

const durationUnitToDaysMap = new Map([
  ['m', 1 / 1440],
  ['h', 1 / 24],
  ['d', 1],
  ['w', 7],
])

function normalizeDurationUnit(rawUnit) {
  if (!rawUnit) return null
  return durationUnitAliasMap.get(String(rawUnit).toLowerCase().trim()) ?? null
}

function durationUnitToDays(unit) {
  return durationUnitToDaysMap.get(unit) ?? null
}

function parseStrictNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  const text = String(value ?? '').trim()
  if (!text) return null
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(text)) return null
  const numeric = Number.parseFloat(text)
  return Number.isFinite(numeric) ? numeric : null
}

function parseCtAsDuration(ctRaw) {
  const text = String(ctRaw ?? '').trim()
  const match = text.match(/^([-+]?(?:\d+\.?\d*|\.\d+))\s*([a-zA-Z]+)$/)
  if (!match) return null

  const value = Number.parseFloat(match[1])
  const unit = normalizeDurationUnit(match[2])
  if (!Number.isFinite(value) || value < 0 || unit === null) return null

  return { value, unit }
}

function parseCtAsRate(ctRaw) {
  const text = String(ctRaw ?? '').trim()
  const match = text.match(/^([-+]?(?:\d+\.?\d*|\.\d+))\s*(?:\/|per)\s*([a-zA-Z]+)$/i)
  if (!match) return null

  const value = Number.parseFloat(match[1])
  const unit = normalizeDurationUnit(match[2])
  if (!Number.isFinite(value) || value <= 0 || unit === null) return null

  return { value, unit }
}

function formatMetricNumber(value) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(2).replace(/\.?0+$/, '')
}

function parseFraction(value, { allowZero = false } = {}) {
  if (value === undefined || value === null) return null

  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return null

    if (text.endsWith('%')) {
      const pct = parseStrictNumber(text.slice(0, -1))
      if (pct === null || pct < 0 || pct > 100) return null
      if (!allowZero && pct === 0) return null
      return pct / 100
    }

    const numeric = parseStrictNumber(text)
    if (numeric === null || numeric < 0) return null
    if (!allowZero && numeric === 0) return null
    if (numeric <= 1) return numeric
    if (numeric <= 100) return numeric / 100
    return null
  }

  const numeric = parseStrictNumber(value)
  if (numeric === null || numeric < 0) return null
  if (!allowZero && numeric === 0) return null
  if (numeric <= 1) return numeric
  if (numeric <= 100) return numeric / 100
  return null
}

function parseAvailabilityFraction(value) {
  return parseFraction(value, { allowZero: false })
}

function parsePassRateFraction(value) {
  return parseFraction(value, { allowZero: true })
}

function formatAvailabilityPercent(value) {
  if (!Number.isFinite(value) || value <= 0) return null
  return `${formatMetricNumber(value * 100)}%`
}

function formatPercentCompact(value) {
  if (!Number.isFinite(value) || value < 0) return null
  return `${formatMetricNumber(value * 100)}%`
}

function formatPercentFixed(value, digits = 1) {
  if (!Number.isFinite(value) || value < 0) return null
  return `${(value * 100).toFixed(digits)}%`
}

function formatDurationDays(value, fractionDigits) {
  if (!Number.isFinite(value) || value < 0) return null
  return `${value.toFixed(fractionDigits)}d`
}

function parseDurationToDays(raw) {
  const duration = parseCtAsDuration(raw)
  if (duration === null) return null
  const dayFactor = durationUnitToDays(duration.unit)
  if (dayFactor === null) return null
  return duration.value * dayFactor
}

function parseCtToDays(raw) {
  const durationDays = parseDurationToDays(raw)
  if (durationDays !== null) return durationDays

  const rate = parseCtAsRate(raw)
  if (rate === null) return null
  const dayFactor = durationUnitToDays(rate.unit)
  if (dayFactor === null || rate.value <= 0) return null
  return dayFactor / rate.value
}

function parseQueueValue(raw) {
  if (raw === undefined || raw === null) return 0
  const queueValue = parseStrictNumber(raw)
  if (queueValue === null || queueValue < 0) return null
  return queueValue
}

function deriveWaitDays(queueValue, ctDays, availability) {
  if (!Number.isFinite(queueValue) || queueValue < 0) return null
  if (!Number.isFinite(ctDays) || ctDays < 0) return null
  if (!Number.isFinite(availability) || availability <= 0) return null
  return (queueValue * ctDays) / availability
}

function parseRejectTo(raw) {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'string') return null
  const text = raw.trim()
  return text === '' ? null : text
}

function normalizeStage(stage, index) {
  if (!stage || typeof stage !== 'object') {
    throw new Error(`Stage #${index + 1} is not an object`)
  }
  if (!stage.name) {
    throw new Error(`Stage #${index + 1} is missing required field: name`)
  }
  if (stage.ct === undefined || stage.ct === null || String(stage.ct).trim() === '') {
    throw new Error(`Stage #${index + 1} is missing required field: ct`)
  }

  const qualityGate = stage.quality_gate ?? stage.qualityGate ?? null
  const passRateRaw =
    stage.pass_rate ??
    stage.passRate ??
    (qualityGate && typeof qualityGate === 'object'
      ? qualityGate.pass_rate ?? qualityGate.passRate ?? null
      : null)
  const rejectToRaw =
    stage.reject_to ??
    stage.rejectTo ??
    (qualityGate && typeof qualityGate === 'object'
      ? qualityGate.reject_to ?? qualityGate.rejectTo ?? null
      : null)

  const passRate = passRateRaw === null || passRateRaw === undefined ? null : parsePassRateFraction(passRateRaw)
  if (passRateRaw !== undefined && passRateRaw !== null && passRate === null) {
    throw new Error(`Stage #${index + 1} has invalid pass_rate value: ${passRateRaw}`)
  }
  const rejectTo = rejectToRaw === null || rejectToRaw === undefined ? null : parseRejectTo(rejectToRaw)
  if (rejectToRaw !== undefined && rejectToRaw !== null && rejectTo === null) {
    throw new Error(`Stage #${index + 1} has invalid reject_to value: ${rejectToRaw}`)
  }

  const queueValue = parseQueueValue(stage.queue)
  if (queueValue === null) {
    throw new Error(`Stage #${index + 1} has invalid queue value: ${stage.queue}`)
  }

  const availabilityRaw = stage.availability ?? stage.station_availability ?? stage.stationAvailability
  const parsedAvailability = parseAvailabilityFraction(availabilityRaw)
  if (availabilityRaw !== undefined && availabilityRaw !== null && parsedAvailability === null) {
    throw new Error(`Stage #${index + 1} has invalid availability value: ${availabilityRaw}`)
  }
  const availability = parsedAvailability ?? 1
  const availabilityLabel = formatAvailabilityPercent(availability)

  const ctDays = parseCtToDays(stage.ct)
  if (ctDays === null || ctDays <= 0) {
    throw new Error(`Stage #${index + 1} has invalid ct value: ${stage.ct}`)
  }

  const explicitWt = optionalDisplayText(stage.wt)
  const wtDays = explicitWt === null ? deriveWaitDays(queueValue, ctDays, availability) : parseDurationToDays(explicitWt)
  if (wtDays === null) {
    throw new Error(`Stage #${index + 1} has invalid wt value: ${stage.wt}`)
  }

  const ectDays = ctDays / availability
  return {
    name: String(stage.name),
    ctDays,
    ctLabel: formatDurationDays(ctDays, 2),
    wtDays,
    wtLabel: formatDurationDays(wtDays, 1),
    availability,
    availabilityLabel,
    ectDays,
    ectLabel: formatDurationDays(ectDays, 2),
    queueValue,
    queue: formatMetricNumber(queueValue),
    queueLabel: String(stage.queue_label ?? stage.queueLabel ?? 'Queue'),
    passRate,
    passRateLabel: passRate === null ? null : formatPercentCompact(passRate),
    rejectTo,
  }
}

export function modelFromDsl(dsl, fileBaseName) {
  if (!dsl || typeof dsl !== 'object') {
    throw new Error('Top-level document must be an object')
  }
  if (!Array.isArray(dsl.stages) || dsl.stages.length === 0) {
    throw new Error('Top-level field \"stages\" must be a non-empty array')
  }

  const title = optionalDisplayText(dsl.title)
  if (title === null) {
    throw new Error('Top-level field \"title\" is required')
  }
  const subtitle = optionalDisplayText(dsl.subtitle)
  const stages = dsl.stages.map(normalizeStage)

  const priorStageNames = new Set()
  for (const [index, stage] of stages.entries()) {
    if (priorStageNames.has(stage.name)) {
      throw new Error(`Stage #${index + 1} has duplicate name: ${stage.name}`)
    }
    if (stage.rejectTo !== null && !priorStageNames.has(stage.rejectTo)) {
      throw new Error(
        `Stage #${index + 1} reject_to must reference a prior stage name: ${stage.rejectTo}`
      )
    }
    priorStageNames.add(stage.name)
  }

  const totalCtDays = stages.reduce((sum, stage) => sum + stage.ctDays, 0)
  const totalLeadDays = stages.reduce((sum, stage) => sum + stage.ctDays + stage.wtDays, 0)
  const efficiency = totalLeadDays > 0 ? totalCtDays / totalLeadDays : 0
  const passRates = stages.filter((stage) => stage.passRate !== null).map((stage) => stage.passRate)
  const overallPassRate =
    passRates.length === 0 ? null : passRates.reduce((product, passRate) => product * passRate, 1)

  const outputName = `${slugify(dsl.output ?? dsl.slug ?? fileBaseName) || fileBaseName}.svg`
  return {
    title,
    subtitle,
    stages,
    outputName,
    efficiencyLabel: formatPercentFixed(efficiency, 1),
    overallPassLabel: overallPassRate === null ? null : formatPercentFixed(overallPassRate, 1),
  }
}

export function renderSvg(model, sourceName) {
  const stageWidths = model.stages.map((stage) => {
    const queueArea = stage.queue !== null ? layout.queueWidth + layout.queueGap : 0
    return queueArea + layout.boxWidth
  })

  const flowWidth =
    stageWidths.reduce((sum, width) => sum + width, 0) + layout.stageGap * (model.stages.length - 1)
  const hasTitle = model.title !== null
  const hasSubtitle = model.subtitle !== null
  const titleBaselineY = layout.paddingY
  const subtitleBaselineY = hasTitle ? layout.paddingY + 54 : layout.paddingY + 22
  const titleBlockHeight =
    (hasTitle ? 46 : 0) + (hasSubtitle ? (hasTitle ? 36 : 30) : 0)

  const overallMetricLines = [`Efficiency: ${model.efficiencyLabel}`]
  if (model.overallPassLabel !== null) {
    overallMetricLines.push(`Overall Pass: ${model.overallPassLabel}`)
  }
  const overallMetricsHeight =
    layout.overallMetricsTopGap +
    Math.max(overallMetricLines.length - 1, 0) * layout.overallMetricsRowGap +
    layout.overallMetricsBottomPadding

  const width = layout.paddingX * 2 + flowWidth
  const contentTop = layout.paddingY + titleBlockHeight
  const boxTop = contentTop
  const boxMidY = boxTop + layout.boxHeight / 2
  const waitRowY = boxTop + layout.boxHeight + layout.timelineTopGap
  const restLineY = waitRowY + layout.timelineLabelToLineGap
  const workLineY = restLineY + layout.timelineRowGap
  const workRowY = workLineY + layout.timelineWorkTextGap
  const height = workRowY + overallMetricsHeight

  let cursorX = layout.paddingX
  let previousBoxEndX = null
  const content = []
  const timelineEntries = []

  for (const stage of model.stages) {
    const stageStartX = cursorX
    if (previousBoxEndX !== null) {
      content.push(
        `<line x1=\"${previousBoxEndX + 10}\" y1=\"${boxMidY}\" x2=\"${stageStartX - 10}\" y2=\"${boxMidY}\" class=\"flow-arrow\" marker-end=\"url(#arrowhead)\"/>`
      )
    }

    let boxX = stageStartX
    let queueCenterX = null
    if (stage.queue !== null) {
      const queueTopY = boxTop + (layout.boxHeight - layout.queueHeight) / 2
      const queuePoints = [
        `${stageStartX + layout.queueWidth / 2},${queueTopY}`,
        `${stageStartX},${queueTopY + layout.queueHeight}`,
        `${stageStartX + layout.queueWidth},${queueTopY + layout.queueHeight}`,
      ].join(' ')

      content.push(`<polygon points=\"${queuePoints}\" class=\"queue-triangle\"/>`)
      content.push(
        `<text x=\"${stageStartX + layout.queueWidth / 2}\" y=\"${queueTopY - 8}\" text-anchor=\"middle\" class=\"queue-label\">${escapeXml(stage.queueLabel)}</text>`
      )
      content.push(
        `<text x=\"${stageStartX + layout.queueWidth / 2}\" y=\"${queueTopY + layout.queueHeight - 17}\" text-anchor=\"middle\" class=\"queue-value\">${escapeXml(stage.queue)}</text>`
      )
      queueCenterX = stageStartX + layout.queueWidth / 2

      boxX = stageStartX + layout.queueWidth + layout.queueGap
      content.push(
        `<line x1=\"${stageStartX + layout.queueWidth + 8}\" y1=\"${boxMidY}\" x2=\"${boxX - 8}\" y2=\"${boxMidY}\" class=\"connector\"/>`
      )
    }

    content.push(
      `<rect x=\"${boxX}\" y=\"${boxTop}\" width=\"${layout.boxWidth}\" height=\"${layout.boxHeight}\" rx=\"12\" class=\"stage-box\"/>`
    )

    const nameLines = wrapText(stage.name, 18).slice(0, 2)
    let textY = boxTop + 30
    for (const line of nameLines) {
      content.push(
        `<text x=\"${boxX + layout.boxWidth / 2}\" y=\"${textY}\" text-anchor=\"middle\" class=\"stage-name\">${escapeXml(line)}</text>`
      )
      textY += 22
    }

    let metricY = boxTop + 82
    content.push(
      `<text x=\"${boxX + 18}\" y=\"${metricY}\" class=\"metric-text\">ECT: ${escapeXml(stage.ectLabel)} (${escapeXml(stage.availabilityLabel)})</text>`
    )
    metricY += 22
    if (stage.passRateLabel !== null) {
      content.push(
        `<text x=\"${boxX + 18}\" y=\"${metricY}\" class=\"gate-text\">Pass: ${escapeXml(stage.passRateLabel)}</text>`
      )
      metricY += 22
    }
    if (stage.rejectTo !== null) {
      content.push(
        `<text x=\"${boxX + 18}\" y=\"${metricY}\" class=\"rework-text\">↺ ${escapeXml(stage.rejectTo)}</text>`
      )
    }

    timelineEntries.push({
      waitX: queueCenterX,
      wt: stage.wtLabel,
      workX: boxX + layout.boxWidth / 2,
      ct: stage.ctLabel,
    })

    previousBoxEndX = boxX + layout.boxWidth
    cursorX = previousBoxEndX + layout.stageGap
  }

  const timelineStartX = layout.paddingX + 8
  const timelineEndX = layout.paddingX + flowWidth - 8
  const timelinePoints = []
  for (const entry of timelineEntries) {
    if (entry.waitX !== null && entry.wt !== null) {
      timelinePoints.push({ x: entry.waitX, type: 'wait', label: entry.wt })
    }
    timelinePoints.push({ x: entry.workX, type: 'work', label: entry.ct })
  }

  const timelineLevelY = (type) => (type === 'wait' ? restLineY : workLineY)
  const sortedTimelinePoints = [...timelinePoints].sort((left, right) => left.x - right.x)
  if (sortedTimelinePoints.length > 0) {
    const timelineSeparation = workLineY - restLineY
    if (timelineSeparation < layout.timelineMinSeparation) {
      throw new Error(
        `Timeline Y-level separation too small in ${sourceName}: wait (${restLineY}) and work (${workLineY}) differ by ${timelineSeparation}px; minimum is ${layout.timelineMinSeparation}px`
      )
    }
    if (restLineY === workLineY) {
      throw new Error(
        `Timeline Y-levels collapsed in ${sourceName}: wait (${restLineY}) and work (${workLineY}) must differ`
      )
    }

    const timelineSegments = sortedTimelinePoints.map((point, index, points) => {
      const startX = index === 0 ? timelineStartX : (points[index - 1].x + point.x) / 2
      const endX =
        index === points.length - 1 ? timelineEndX : (point.x + points[index + 1].x) / 2
      return {
        ...point,
        startX,
        endX,
        y: timelineLevelY(point.type),
      }
    })

    let timelinePath = `M ${timelineSegments[0].startX} ${timelineSegments[0].y}`
    for (let i = 0; i < timelineSegments.length; i += 1) {
      const segment = timelineSegments[i]
      timelinePath += ` H ${segment.endX}`
      const nextSegment = timelineSegments[i + 1]
      if (nextSegment && segment.y !== nextSegment.y) {
        timelinePath += ` V ${nextSegment.y}`
      }
    }

    content.push(
      `<path d=\"${timelinePath}\" class=\"timeline-line\" data-wait-y=\"${restLineY}\" data-work-y=\"${workLineY}\"/>`
    )
    const expectedWaitPointCount = timelineEntries.filter((entry) => entry.waitX !== null).length
    const hasWaitPoints = sortedTimelinePoints.some((point) => point.type === 'wait')
    if (expectedWaitPointCount > 0 && !hasWaitPoints) {
      throw new Error(
        `Timeline wait points missing in ${sourceName}: ${expectedWaitPointCount} queued stage(s) but no wait-time points rendered`
      )
    }
    if (hasWaitPoints) {
      content.push(
        `<line x1=\"${timelineStartX}\" y1=\"${restLineY}\" x2=\"${timelineStartX}\" y2=\"${workLineY}\" class=\"timeline-endcap\"/>`
      )
      content.push(
        `<line x1=\"${timelineEndX}\" y1=\"${restLineY}\" x2=\"${timelineEndX}\" y2=\"${workLineY}\" class=\"timeline-endcap\"/>`
      )
    } else {
      content.push(
        `<line x1=\"${timelineStartX}\" y1=\"${workLineY - 5}\" x2=\"${timelineStartX}\" y2=\"${workLineY + 5}\" class=\"timeline-endcap\"/>`
      )
      content.push(
        `<line x1=\"${timelineEndX}\" y1=\"${workLineY - 5}\" x2=\"${timelineEndX}\" y2=\"${workLineY + 5}\" class=\"timeline-endcap\"/>`
      )
    }

    for (const point of sortedTimelinePoints) {
      if (point.type === 'wait') {
        content.push(
          `<line x1=\"${point.x}\" y1=\"${restLineY}\" x2=\"${point.x}\" y2=\"${waitRowY + 4}\" class=\"timeline-tick\"/>`
        )
        content.push(
          `<text x=\"${point.x}\" y=\"${waitRowY}\" text-anchor=\"middle\" class=\"timeline-wait-text\">${escapeXml(point.label)}</text>`
        )
      } else {
        content.push(
          `<line x1=\"${point.x}\" y1=\"${workLineY}\" x2=\"${point.x}\" y2=\"${workRowY - 6}\" class=\"timeline-tick\"/>`
        )
        content.push(
          `<text x=\"${point.x}\" y=\"${workRowY}\" text-anchor=\"middle\" class=\"timeline-work-text\">${escapeXml(point.label)}</text>`
        )
      }
    }
  }

  const overallMetricsStartY = workRowY + layout.overallMetricsTopGap
  for (const [index, metricLine] of overallMetricLines.entries()) {
    content.push(
      `<text x=\"${timelineEndX}\" y=\"${overallMetricsStartY + index * layout.overallMetricsRowGap}\" text-anchor=\"end\" class=\"overall-metric-text\">${escapeXml(metricLine)}</text>`
    )
  }

  const titleBlock = model.title
    ? `<text x=\"${layout.paddingX}\" y=\"${titleBaselineY}\" class=\"title-text\">${escapeXml(model.title)}</text>`
    : ''
  const subtitleBlock = model.subtitle
    ? `<text x=\"${layout.paddingX}\" y=\"${subtitleBaselineY}\" class=\"subtitle-text\">${escapeXml(model.subtitle)}</text>`
    : ''
  const svgTitle = model.title ?? 'Value stream map'

  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\" role=\"img\" aria-labelledby=\"title desc\">
  <title id=\"title\">${escapeXml(svgTitle)}</title>
  <desc id=\"desc\">Generated from ${escapeXml(sourceName)} by scripts/generate-vsm-svgs.mjs</desc>
  <defs>
    <marker id=\"arrowhead\" markerWidth=\"10\" markerHeight=\"7\" refX=\"8\" refY=\"3.5\" orient=\"auto\">
      <polygon points=\"0 0, 10 3.5, 0 7\" fill=\"#2c6da3\"/>
    </marker>
    <style>
      .background { fill: #f7fbff; }
      .title-text { font: 700 32px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #143b5f; }
      .subtitle-text { font: 500 18px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #3a5f82; }
      .stage-box { fill: #ffffff; stroke: #2c6da3; stroke-width: 3; }
      .stage-name { font: 700 20px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #15324f; }
      .metric-text { font: 600 16px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #244a6e; }
      .gate-text { font: 600 13px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #3e5f7f; }
      .rework-text { font: 700 14px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #8a1f1f; }
      .queue-triangle { fill: #e8f1f9; stroke: #d39a37; stroke-width: 3; }
      .queue-label { font: 600 12px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #6a5a40; }
      .queue-value { font: 700 21px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #503e22; }
      .connector { stroke: #8aa8c4; stroke-width: 2.5; }
      .flow-arrow { stroke: #2c6da3; stroke-width: 3; }
      .timeline-line { fill: none; stroke: #5f7388; stroke-width: 2; stroke-linecap: square; stroke-linejoin: miter; }
      .timeline-endcap { stroke: #5f7388; stroke-width: 2; }
      .timeline-tick { stroke: #8da0b4; stroke-width: 1.8; }
      .timeline-wait-text { font: 700 15px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #7a3f18; }
      .timeline-work-text { font: 500 12px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #6e7f90; }
      .overall-metric-text { font: 700 15px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #1f486f; }
    </style>
  </defs>
  <rect class=\"background\" x=\"0\" y=\"0\" width=\"${width}\" height=\"${height}\" rx=\"18\"/>
  ${titleBlock}
  ${subtitleBlock}
  ${content.join('\n  ')}
</svg>
`
}

async function main() {
  await fs.mkdir(sourceDir, { recursive: true })
  await fs.mkdir(outputDir, { recursive: true })
  const clearedSvgCount = await clearGeneratedSvgs(outputDir)

  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && extAllowed.has(path.extname(entry.name)))
    .map((entry) => entry.name)
    .sort()

  if (sourceFiles.length === 0) {
    if (clearedSvgCount > 0) {
      console.log(`Removed ${clearedSvgCount} stale SVG file(s) from ${outputDir}`)
    }
    console.log(`No DSL files found in ${sourceDir}`)
    return
  }

  const generated = []
  const errors = []
  for (const fileName of sourceFiles) {
    const sourcePath = path.join(sourceDir, fileName)
    const raw = await fs.readFile(sourcePath, 'utf8')

    const baseName = fileName.replace(path.extname(fileName), '')
    let slugName = baseName
    try {
      const dsl = parseYaml(raw)
      slugName = resolveSourceSlug(dsl, baseName)
      const model = modelFromDsl(dsl, baseName)
      const svg = renderSvg(model, fileName)
      const outPath = path.join(outputDir, model.outputName)
      await fs.writeFile(outPath, svg, 'utf8')
      generated.push(path.relative(repoRoot, outPath))
    } catch (error) {
      errors.push(formatScopedFileError(fileName, slugName, error.message))
    }
  }

  console.log(`Generated ${generated.length} SVG file(s):`)
  for (const file of generated) {
    console.log(`- ${file}`)
  }
  if (clearedSvgCount > 0) {
    console.log(`Removed ${clearedSvgCount} stale SVG file(s) from ${outputDir}`)
  }
  if (errors.length > 0) {
    throw new Error(`Generation completed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`)
  }
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isDirectExecution) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
