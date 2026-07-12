// Central data layer. Merges the model manifest with the bilingual terminology
// (curated > auto-composed) and builds fast lookup + search indexes.
import type { SystemId } from './systems'
import manifestRaw from './manifest.json'
import autoTerms from './terms_auto.json'
import curatedTerms from './terms_curated.json'

type ManifestEntry = { k: string; n: string[]; s: string; f: number }
const manifest = manifestRaw as Record<string, ManifestEntry[]>
const auto = autoTerms as Record<string, string>
const curated = curatedTerms as Record<string, { ar: string; la?: string; d?: string }>

export interface Structure {
  id: string
  key: string
  en: string
  ar: string
  la?: string
  arVerified: boolean
  system: SystemId
  sides: string // 'rl' | 'r' | 'l' | ''
  feature: boolean
  nodes: string[]
  descAr?: string
}

const stripParens = (s: string) => s.replace(/^\((.*)\)$/, '$1').trim()

export const STRUCTURES: Structure[] = []
export const BY_ID = new Map<string, Structure>()
export const NODE_TO_ID = new Map<string, string>()
export const BY_SYSTEM = new Map<SystemId, Structure[]>()

for (const sys of Object.keys(manifest) as SystemId[]) {
  const list: Structure[] = []
  manifest[sys].forEach((e, i) => {
    const key = e.k
    const cur = curated[key]
    const ar = cur?.ar || auto[key] || ''
    const st: Structure = {
      id: `${sys}#${i}`,
      key,
      en: stripParens(key),
      ar,
      la: cur?.la,
      arVerified: !!cur,
      system: sys,
      sides: e.s || '',
      feature: e.f === 1,
      nodes: e.n,
      descAr: cur?.d,
    }
    STRUCTURES.push(st)
    BY_ID.set(st.id, st)
    for (const n of e.n) NODE_TO_ID.set(n, st.id)
    list.push(st)
  })
  BY_SYSTEM.set(sys, list)
}

// ---- Arabic / Latin search normalization ----------------------------------
export function normAr(s: string): string {
  return s
    .replace(/[ً-ْٰـ]/g, '') // tashkeel + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim()
}
const normEn = (s: string) => s.toLowerCase().replace(/[().,]/g, ' ').replace(/\s+/g, ' ').trim()

interface SearchRow { id: string; ar: string; en: string; feature: boolean }
const SEARCH_ROWS: SearchRow[] = STRUCTURES.map((s) => ({
  id: s.id,
  ar: normAr(s.ar),
  en: normEn(s.en + ' ' + (s.la || '')),
  feature: s.feature,
}))

// Lay-term synonyms so common searches reach structures named by sub-parts
// (e.g. the heart is modelled as its chambers, not a "Heart" mesh).
const ALIASES: Record<string, string[]> = {
  'قلب': ['بطين', 'اذين', 'صمام', 'تاجي', 'قلب'],
  'heart': ['ventricle', 'atrium', 'valve', 'coronary', 'cardiac', 'heart', 'aortic'],
  'مخ': ['دماغ', 'مخ', 'تلفيف', 'فص', 'مهاد', 'قشر'],
  'دماغ': ['دماغ', 'مخ', 'مخيخ', 'تلفيف', 'جسر', 'نخاع'],
  'brain': ['cerebrum', 'cerebral', 'brain', 'gyrus', 'thalamus', 'cortex'],
  'عمود فقري': ['فقر', 'عجز', 'عصعص', 'قطني', 'رقبي', 'صدري'],
  'spine': ['vertebra', 'sacrum', 'coccyx', 'lumbar', 'cervical'],
  'رئه': ['رئه', 'قصب', 'فص', 'شعب'],
  'lung': ['lung', 'bronch', 'lobe', 'pulmonary'],
}

function matchRows(needles: string[], isAr: boolean): SearchRow[] {
  const starts: SearchRow[] = []
  const contains: SearchRow[] = []
  const seen = new Set<string>()
  for (const row of SEARCH_ROWS) {
    const hay = isAr ? row.ar : row.en
    if (!hay || seen.has(row.id)) continue
    let bestStart = false, any = false
    for (const nq of needles) {
      const idx = hay.indexOf(nq)
      if (idx === 0 || hay.includes(' ' + nq)) { bestStart = true; any = true; break }
      if (idx > 0) any = true
    }
    if (bestStart) { starts.push(row); seen.add(row.id) }
    else if (any) { contains.push(row); seen.add(row.id) }
  }
  const rank = (a: SearchRow, b: SearchRow) => Number(a.feature) - Number(b.feature)
  starts.sort(rank)
  contains.sort(rank)
  return [...starts, ...contains]
}

export function search(query: string, limit = 40): Structure[] {
  const q = query.trim()
  if (!q) return []
  const isAr = /[؀-ۿ]/.test(q)
  const nq = isAr ? normAr(q) : normEn(q)
  if (!nq) return []
  const alias = ALIASES[nq]
  const needles = alias ? [nq, ...alias.map((a) => (isAr ? normAr(a) : a.toLowerCase()))] : [nq]
  return matchRows(needles, isAr).slice(0, limit).map((r) => BY_ID.get(r.id)!)
}

// English descriptions are large; loaded on demand.
let descEn: Record<string, string> | null = null
let descEnPromise: Promise<Record<string, string>> | null = null
export function loadDescriptionsEn(base: string): Promise<Record<string, string>> {
  if (descEn) return Promise.resolve(descEn)
  if (!descEnPromise) {
    descEnPromise = fetch(`${base}data/descriptions_en.json`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => (descEn = d))
      .catch(() => (descEn = {}))
  }
  return descEnPromise
}
export function getDescriptionEn(key: string): string | undefined {
  return descEn?.[key]
}

export const STATS = {
  structures: STRUCTURES.length,
  arabic: STRUCTURES.filter((s) => s.ar).length,
  verified: STRUCTURES.filter((s) => s.arVerified).length,
}
