#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const defaultHtmlPath = path.join(repoRoot, 'output', '_check.html')
const minClearancePx = Number.parseFloat(process.env.FOOTER_CLEARANCE_PX ?? '6')

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function resolveChromeExecutable() {
  const envCandidates = [process.env.PUPPETEER_EXECUTABLE_PATH, process.env.CHROME_PATH].filter(Boolean)

  const platformCandidates = process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
      ]
    : process.platform === 'linux'
      ? ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium']
      : []

  const candidates = [...envCandidates, ...platformCandidates]
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate
  }
  return null
}

function formatViolation(violation) {
  if (violation.type === 'overflow') {
    return `slide ${violation.slide}: section overflow (${violation.scrollHeight}px content > ${violation.clientHeight}px viewport)`
  }
  return `slide ${violation.slide}: <${violation.tag.toLowerCase()}> crosses footer clearance (${violation.elementBottom}px > ${violation.footerTopMinusClearance}px, heading: "${violation.heading}")`
}

async function main() {
  const htmlPathArg = process.argv[2]
  const htmlPath = path.resolve(htmlPathArg ?? defaultHtmlPath)

  if (!(await fileExists(htmlPath))) {
    throw new Error(`Cannot run footer-overlap check: HTML file not found at ${htmlPath}`)
  }

  if (!Number.isFinite(minClearancePx) || minClearancePx < 0) {
    throw new Error(`Invalid FOOTER_CLEARANCE_PX value: ${process.env.FOOTER_CLEARANCE_PX}`)
  }

  const executablePath = await resolveChromeExecutable()
  if (!executablePath) {
    throw new Error(
      'Could not find a Chrome/Chromium executable for footer-overlap checks. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH.'
    )
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox'],
  })

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('section[id]')

    const violations = await page.evaluate((clearance) => {
      const ignoredTags = new Set(['HEADER', 'FOOTER', 'STYLE', 'SCRIPT'])
      const round = (value) => Math.round(value * 100) / 100
      const sections = [...document.querySelectorAll('section[id]')]
      const found = []

      for (const section of sections) {
        const footer = section.querySelector(':scope > footer')
        if (!footer) continue

        const heading =
          section.querySelector(':scope > h1, :scope > h2, :scope > h3')?.textContent?.trim() ?? '(untitled)'
        const footerTop = footer.getBoundingClientRect().top
        const footerTopMinusClearance = footerTop - clearance

        if (section.scrollHeight > section.clientHeight + 1) {
          found.push({
            type: 'overflow',
            slide: section.id,
            heading,
            scrollHeight: round(section.scrollHeight),
            clientHeight: round(section.clientHeight),
          })
        }

        for (const child of section.children) {
          if (ignoredTags.has(child.tagName)) continue
          const style = window.getComputedStyle(child)
          if (style.display === 'none' || style.visibility === 'hidden') continue

          const rect = child.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) continue

          if (rect.bottom > footerTopMinusClearance) {
            found.push({
              type: 'collision',
              slide: section.id,
              heading,
              tag: child.tagName,
              elementBottom: round(rect.bottom),
              footerTopMinusClearance: round(footerTopMinusClearance),
            })
          }
        }
      }

      return found
    }, minClearancePx)

    if (violations.length > 0) {
      console.error(`Footer overlap check failed (${violations.length} issue${violations.length === 1 ? '' : 's'}):`)
      for (const violation of violations) {
        console.error(`- ${formatViolation(violation)}`)
      }
      process.exitCode = 1
      return
    }

    console.log(`Footer overlap check passed (${minClearancePx}px clearance).`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
