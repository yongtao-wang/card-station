import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const HOST = 'www.cardstation.games'
const ORIGIN = `https://${HOST}`

const PAGE_PATHS = {
  home: '',
  about: '/about',
  games: '/games',
  contact: '/contact',
}

export function parseGameUpdatedAt(source) {
  const dates = new Map()
  const pattern = /slug:\s*'([^']+)'[\s\S]*?updatedAt:\s*'([^']+)'/g
  for (const match of source.matchAll(pattern)) {
    dates.set(match[1], match[2])
  }
  return dates
}

export function parsePageUpdatedAt(source) {
  const block = source.match(/pageUpdatedAt\s*=\s*\{([\s\S]*?)\}/)
  const dates = new Map()
  if (!block) return dates
  for (const match of block[1].matchAll(/(\w+):\s*'([^']+)'/g)) {
    dates.set(match[1], match[2])
  }
  return dates
}

export function changedUrls(beforeGames, afterGames, beforePages, afterPages) {
  const urls = []
  for (const [slug, date] of afterGames) {
    if (beforeGames.get(slug) !== date) {
      urls.push(`${ORIGIN}/games/${slug}`)
    }
  }
  for (const [page, date] of afterPages) {
    if (beforePages.get(page) !== date && page in PAGE_PATHS) {
      urls.push(`${ORIGIN}${PAGE_PATHS[page]}`)
    }
  }
  return urls
}

function gitShow(rev, filePath) {
  return execFileSync('git', ['show', `${rev}:${filePath}`], { encoding: 'utf8' })
}

function readKey() {
  const files = readdirSync('public').filter((name) => /^[a-f0-9]{8,128}\.txt$/.test(name))
  if (files.length !== 1) {
    throw new Error(`expected one IndexNow key file in public/, found ${files.length}`)
  }
  const key = files[0].slice(0, -4)
  const body = readFileSync(`public/${files[0]}`, 'utf8').trim()
  if (body !== key) {
    throw new Error('IndexNow key file body does not match its name')
  }
  return key
}

async function submit(key, urls) {
  const body = JSON.stringify({
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList: urls,
  })
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
    })
    if (response.status === 403 && attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      continue
    }
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`IndexNow ${response.status}: ${await response.text()}`)
    }
    console.log(`IndexNow ${response.status}`)
    return
  }
}

async function main() {
  const beforeGames = parseGameUpdatedAt(gitShow('HEAD~1', 'games/index.ts'))
  const afterGames = parseGameUpdatedAt(gitShow('HEAD', 'games/index.ts'))
  const beforePages = parsePageUpdatedAt(gitShow('HEAD~1', 'app/sitemap.ts'))
  const afterPages = parsePageUpdatedAt(gitShow('HEAD', 'app/sitemap.ts'))
  const urls = changedUrls(beforeGames, afterGames, beforePages, afterPages)

  if (urls.length === 0) {
    console.log('No changed URLs')
    return
  }
  for (const url of urls) console.log(url)
  if (process.argv.includes('--submit')) await submit(readKey(), urls)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
