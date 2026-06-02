#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const sourceDir = path.join(repoRoot, 'vsm', 'source')
const outputDir = path.join(repoRoot, 'assets', 'images', 'vsm-generated')

const extAllowed = new Set(['.yaml', '.yml'])

const layout = {
  paddingX: 50,
  paddingY: 44,
  titleBlockHeight: 82,
  boxWidth: 230,
  boxHeight: 136,
  queueWidth: 64,
  queueHeight: 54,
  queueGap: 28,
  stageGap: 80,
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

function normalizeStage(stage, index) {
  if (!stage || typeof stage !== 'object') {
    throw new Error(`Stage #${index + 1} is not an object`)
  }
  if (!stage.name) {
    throw new Error(`Stage #${index + 1} is missing required field: name`)
  }

  const qualityGate = stage.quality_gate ?? stage.qualityGate ?? null
  return {
    name: String(stage.name),
    ct: String(stage.ct ?? '?'),
    wt: String(stage.wt ?? '?'),
    queue: stage.queue === undefined || stage.queue === null ? null : String(stage.queue),
    queueLabel: String(stage.queue_label ?? stage.queueLabel ?? 'Queue'),
    qualityGate:
      qualityGate && typeof qualityGate === 'object'
        ? {
            passRate: qualityGate.pass_rate ?? qualityGate.passRate ?? null,
            rejectTo: qualityGate.reject_to ?? qualityGate.rejectTo ?? null,
          }
        : null,
  }
}

function modelFromDsl(dsl, fileBaseName) {
  if (!dsl || typeof dsl !== 'object') {
    throw new Error('Top-level document must be an object')
  }
  if (!Array.isArray(dsl.stages) || dsl.stages.length === 0) {
    throw new Error('Top-level field "stages" must be a non-empty array')
  }

  const stages = dsl.stages.map(normalizeStage)
  const title = String(dsl.title ?? fileBaseName)
  const subtitle = dsl.subtitle ? String(dsl.subtitle) : null
  const outputName = `${slugify(dsl.output ?? dsl.slug ?? fileBaseName) || fileBaseName}.svg`

  return { title, subtitle, stages, outputName }
}

function renderSvg(model, sourceName) {
  const stageWidths = model.stages.map((stage) => {
    const queueArea = stage.queue !== null ? layout.queueWidth + layout.queueGap : 0
    return queueArea + layout.boxWidth
  })

  const flowWidth =
    stageWidths.reduce((sum, width) => sum + width, 0) + layout.stageGap * (model.stages.length - 1)

  const width = layout.paddingX * 2 + flowWidth
  const contentTop = layout.paddingY + layout.titleBlockHeight
  const height = contentTop + layout.boxHeight + layout.paddingY + 10
  const boxTop = contentTop
  const boxMidY = boxTop + layout.boxHeight / 2

  let cursorX = layout.paddingX
  let previousBoxEndX = null
  const content = []

  for (const stage of model.stages) {
    const stageStartX = cursorX
    if (previousBoxEndX !== null) {
      content.push(
        `<line x1="${previousBoxEndX + 10}" y1="${boxMidY}" x2="${stageStartX - 10}" y2="${boxMidY}" class="flow-arrow" marker-end="url(#arrowhead)"/>`
      )
    }

    let boxX = stageStartX
    if (stage.queue !== null) {
      const queueTopY = boxTop + (layout.boxHeight - layout.queueHeight) / 2
      const queuePoints = [
        `${stageStartX + layout.queueWidth / 2},${queueTopY}`,
        `${stageStartX},${queueTopY + layout.queueHeight}`,
        `${stageStartX + layout.queueWidth},${queueTopY + layout.queueHeight}`,
      ].join(' ')

      content.push(`<polygon points="${queuePoints}" class="queue-triangle"/>`)
      content.push(
        `<text x="${stageStartX + layout.queueWidth / 2}" y="${queueTopY - 8}" text-anchor="middle" class="queue-label">${escapeXml(stage.queueLabel)}</text>`
      )
      content.push(
        `<text x="${stageStartX + layout.queueWidth / 2}" y="${queueTopY + layout.queueHeight - 17}" text-anchor="middle" class="queue-value">${escapeXml(stage.queue)}</text>`
      )

      boxX = stageStartX + layout.queueWidth + layout.queueGap
      content.push(
        `<line x1="${stageStartX + layout.queueWidth + 8}" y1="${boxMidY}" x2="${boxX - 8}" y2="${boxMidY}" class="connector"/>`
      )
    }

    content.push(
      `<rect x="${boxX}" y="${boxTop}" width="${layout.boxWidth}" height="${layout.boxHeight}" rx="12" class="stage-box"/>`
    )

    const nameLines = wrapText(stage.name, 18).slice(0, 2)
    let textY = boxTop + 30
    for (const line of nameLines) {
      content.push(
        `<text x="${boxX + layout.boxWidth / 2}" y="${textY}" text-anchor="middle" class="stage-name">${escapeXml(line)}</text>`
      )
      textY += 22
    }

    content.push(
      `<text x="${boxX + 18}" y="${boxTop + 82}" class="metric-text">CT: ${escapeXml(stage.ct)}</text>`
    )
    content.push(
      `<text x="${boxX + 18}" y="${boxTop + 104}" class="metric-text">WT: ${escapeXml(stage.wt)}</text>`
    )

    if (stage.qualityGate?.passRate || stage.qualityGate?.rejectTo) {
      if (stage.qualityGate.passRate) {
        content.push(
          `<text x="${boxX + 18}" y="${boxTop + 126}" class="gate-text">Pass: ${escapeXml(stage.qualityGate.passRate)}</text>`
        )
      }
      if (stage.qualityGate.rejectTo) {
        content.push(
          `<text x="${boxX + layout.boxWidth - 18}" y="${boxTop + 126}" text-anchor="end" class="gate-text">Reject → ${escapeXml(stage.qualityGate.rejectTo)}</text>`
        )
      }
    }

    previousBoxEndX = boxX + layout.boxWidth
    cursorX = previousBoxEndX + layout.stageGap
  }

  const subtitleBlock = model.subtitle
    ? `<text x="${layout.paddingX}" y="${layout.paddingY + 54}" class="subtitle-text">${escapeXml(model.subtitle)}</text>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(model.title)}</title>
  <desc id="desc">Generated from ${escapeXml(sourceName)} by scripts/generate-vsm-svgs.mjs</desc>
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#2c6da3"/>
    </marker>
    <style>
      .background { fill: #f7fbff; }
      .title-text { font: 700 32px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #143b5f; }
      .subtitle-text { font: 500 18px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #3a5f82; }
      .stage-box { fill: #ffffff; stroke: #2c6da3; stroke-width: 3; }
      .stage-name { font: 700 20px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #15324f; }
      .metric-text { font: 600 16px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #244a6e; }
      .gate-text { font: 600 13px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #3e5f7f; }
      .queue-triangle { fill: #e8f1f9; stroke: #d39a37; stroke-width: 3; }
      .queue-label { font: 600 12px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #6a5a40; }
      .queue-value { font: 700 21px Inter, Avenir Next, Helvetica Neue, Arial, sans-serif; fill: #503e22; }
      .connector { stroke: #8aa8c4; stroke-width: 2.5; }
      .flow-arrow { stroke: #2c6da3; stroke-width: 3; }
    </style>
  </defs>
  <rect class="background" x="0" y="0" width="${width}" height="${height}" rx="18"/>
  <text x="${layout.paddingX}" y="${layout.paddingY}" class="title-text">${escapeXml(model.title)}</text>
  ${subtitleBlock}
  ${content.join('\n  ')}
</svg>
`
}

async function main() {
  await fs.mkdir(sourceDir, { recursive: true })
  await fs.mkdir(outputDir, { recursive: true })

  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && extAllowed.has(path.extname(entry.name)))
    .map((entry) => entry.name)
    .sort()

  if (sourceFiles.length === 0) {
    console.log(`No DSL files found in ${sourceDir}`)
    return
  }

  const generated = []
  for (const fileName of sourceFiles) {
    const sourcePath = path.join(sourceDir, fileName)
    const raw = await fs.readFile(sourcePath, 'utf8')

    let dsl
    try {
      dsl = parseYaml(raw)
    } catch (error) {
      throw new Error(`Failed to parse ${fileName}: ${error.message}`)
    }

    const baseName = fileName.replace(path.extname(fileName), '')
    const model = modelFromDsl(dsl, baseName)
    const svg = renderSvg(model, fileName)
    const outPath = path.join(outputDir, model.outputName)
    await fs.writeFile(outPath, svg, 'utf8')
    generated.push(path.relative(repoRoot, outPath))
  }

  console.log(`Generated ${generated.length} SVG file(s):`)
  for (const file of generated) {
    console.log(`- ${file}`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
