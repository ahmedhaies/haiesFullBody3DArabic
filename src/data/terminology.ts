// Central data layer. Merges the model manifest with the bilingual terminology
// (curated > auto-composed) and builds fast lookup + search indexes.
import { SYSTEM_BY_ID, type SystemId } from './systems'
import manifestRaw from './manifest.json'
import autoTerms from './terms_auto.json'
import curatedTerms from './terms_curated.json'
import { arabize } from './arabize'
import { CHAKRAS } from './chakras'

type ManifestEntry = { k: string; n: string[]; s: string; f: number; v?: number }
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
  sex?: 'm' | 'f' // sex-specific structure (open dataset ships male genitalia only)
}

// The open Z-Anatomy / BodyParts3D dataset is a single male-based body, so the
// only sex-specific geometry present is the male reproductive set. We tag it so
// the male/female selector can hide it in female mode.
const MALE_RE = /\b(penis|penile|testis|testic|prostat|epididym|ductus deferens|seminal|glans|scrot|spermatic|cremaster)\b|corpus (cavernosum|spongiosum)/i
const FEMALE_RE = /\b(uterus|uterine tube|ovary|ovarian|vagina|vaginal|clitoris|clitoral|fallopian|myometrium|endometrium)\b/i
function sexOf(key: string): 'm' | 'f' | undefined {
  if (MALE_RE.test(key)) return 'm'
  if (FEMALE_RE.test(key)) return 'f'
  return undefined
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
    // priority: curated (verified) > auto dictionary > rule-based composer
    const ar = cur?.ar || auto[key] || arabize(key) || ''
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
      sex: sexOf(key),
    }
    STRUCTURES.push(st)
    BY_ID.set(st.id, st)
    for (const n of e.n) NODE_TO_ID.set(n, st.id)
    list.push(st)
  })
  BY_SYSTEM.set(sys, list)
}

// ---- injected female reproductive set --------------------------------------
// The open male-based mesh set ships no female genitalia, so the uterus, tubes,
// ovaries and vagina are added here as first-class (searchable, selectable)
// structures. Their geometry is generated procedurally in <FemaleReproductive/>
// and shown only in female mode. They live under the viscera group.
export interface FemaleOrgan { id: string; en: string; ar: string; la: string; sides: string; descAr: string }
export const FEMALE_REPRO: FemaleOrgan[] = [
  { id: 'visceral#f_uterus', en: 'Uterus', ar: 'الرَّحِم', la: 'Uterus', sides: '',
    descAr: 'العضو العضلي الأجوف الكُمّثري في حوض الأنثى، حيث تنغرس البويضة المُلقّحة وينمو الجنين طوال الحمل.' },
  { id: 'visceral#f_cervix', en: 'Cervix of uterus', ar: 'عُنق الرَّحِم', la: 'Cervix uteri', sides: '',
    descAr: 'الجزء السفلي الضيّق من الرحم الذي يصله بالمهبل.' },
  { id: 'visceral#f_vagina', en: 'Vagina', ar: 'المِهبَل', la: 'Vagina', sides: '',
    descAr: 'قناة عضلية مرنة تصل عنق الرحم بالخارج، وهي مجرى الولادة.' },
  { id: 'visceral#f_ovary_r', en: 'Right ovary', ar: 'المَبيض الأيمن', la: 'Ovarium dextrum', sides: 'r',
    descAr: 'الغدة التناسلية الأنثوية التي تُنتج البويضات والهرمونات الجنسية (الإستروجين والبروجستيرون).' },
  { id: 'visceral#f_ovary_l', en: 'Left ovary', ar: 'المَبيض الأيسر', la: 'Ovarium sinistrum', sides: 'l',
    descAr: 'الغدة التناسلية الأنثوية التي تُنتج البويضات والهرمونات الجنسية (الإستروجين والبروجستيرون).' },
  { id: 'visceral#f_tube_r', en: 'Right uterine (fallopian) tube', ar: 'البُوق الأيمن (قناة فالوب اليمنى)', la: 'Tuba uterina dextra', sides: 'r',
    descAr: 'قناة تنقل البويضة من المبيض إلى الرحم، وفيها يحدث الإخصاب عادةً.' },
  { id: 'visceral#f_tube_l', en: 'Left uterine (fallopian) tube', ar: 'البُوق الأيسر (قناة فالوب اليسرى)', la: 'Tuba uterina sinistra', sides: 'l',
    descAr: 'قناة تنقل البويضة من المبيض إلى الرحم، وفيها يحدث الإخصاب عادةً.' },
]
for (const o of FEMALE_REPRO) {
  const st: Structure = {
    id: o.id, key: o.en, en: o.en, ar: o.ar, la: o.la, arVerified: true,
    system: 'visceral', sides: o.sides, feature: false, nodes: [], descAr: o.descAr, sex: 'f',
  }
  STRUCTURES.push(st)
  BY_ID.set(st.id, st)
  BY_SYSTEM.get('visceral')!.push(st)
}

// ---- injected chakra overlay (procedural geometry in <ChakraLayer/>) --------
const chakraList: Structure[] = []
for (const c of CHAKRAS) {
  const st: Structure = {
    id: c.id, key: c.en, en: c.en, ar: c.ar, la: c.sanskrit, arVerified: true,
    system: 'chakras', sides: '', feature: false, nodes: [], descAr: c.descAr,
  }
  STRUCTURES.push(st)
  BY_ID.set(st.id, st)
  chakraList.push(st)
}
BY_SYSTEM.set('chakras', chakraList)

// ---- bilingual auto-descriptions ------------------------------------------
// Every structure gets a short description in BOTH languages: curated Arabic /
// authoritative English when available, otherwise a correct generated sentence
// from the structure's type + system + laterality.
const TYPE_TABLE: [RegExp, string, string][] = [
  [/muscle|belly of|\b(abductor|adductor|flexor|extensor|levator|depressor)\b/i, 'عضلة', 'muscle'],
  [/ligament/i, 'رباط', 'ligament'],
  [/tendon|aponeurosis/i, 'وتر', 'tendon'],
  [/artery|arterial|arteriole/i, 'شريان', 'artery'],
  [/\bvein\b|venous|venule/i, 'وريد', 'vein'],
  [/nerve|plexus|ganglion/i, 'عصب', 'nerve'],
  [/\bnodes?\b/i, 'عقدة لمفية', 'lymph node'],
  [/cartilage/i, 'غضروف', 'cartilage'],
  [/\bbone\b|phalanx|metacarpal|metatarsal|malleus|incus|stapes/i, 'عظم', 'bone'],
  [/vertebra/i, 'فقرة', 'vertebra'],
  [/\bdisc\b|pulposus/i, 'قرص بين فقري', 'intervertebral disc'],
  [/gyrus|sulcus|nucleus|cortex|gyri|thalam|cerebell|tract|fasciculus|medulla oblongata/i, 'تركيب دماغي', 'brain structure'],
  [/gland/i, 'غدة', 'gland'],
  [/bronch/i, 'قصبة هوائية', 'bronchus'],
  [/\blobe\b|lobule/i, 'فص', 'lobe'],
  [/joint|articulation|capsule/i, 'مفصل', 'joint'],
  [/bursa/i, 'جِراب زليلي', 'bursa'],
  [/\bsinus\b/i, 'جيب', 'sinus'],
  [/region|triangle|trigone/i, 'منطقة تشريحية', 'anatomical region'],
  [/fossa|fovea/i, 'حفرة', 'fossa'],
  [/process|tubercle|tuberosity|crest|trochanter|epicondyle|condyle/i, 'ناتئ عظمي', 'bony landmark'],
  [/ventricle|atrium|valve|papillary|myocardium/i, 'جزء من القلب', 'part of the heart'],
  [/vessel/i, 'وعاء دموي', 'blood vessel'],
  [/fascia|sheath|retinaculum/i, 'لفافة', 'fascia'],
]
function classify(en: string): { ar: string; en: string } {
  for (const [re, ar, en2] of TYPE_TABLE) if (re.test(en)) return { ar, en: en2 }
  return { ar: 'تركيب تشريحي', en: 'anatomical structure' }
}
export function describeAr(s: Structure): string {
  if (s.descAr) return s.descAr
  const { ar } = classify(s.en)
  const sys = SYSTEM_BY_ID[s.system].ar
  const side =
    s.sides === 'r' ? ' يقع في الجانب الأيمن من الجسم'
    : s.sides === 'l' ? ' يقع في الجانب الأيسر من الجسم'
    : s.sides === 'rl' ? ' موجود على الجانبين الأيمن والأيسر'
    : ''
  return `${ar} ضمن ${sys}.${side ? '' + side + '.' : ''}`.trim()
}
// naturalistic per-structure tint (overrides the flat system colour) so organs
// read like real tissue and vessels are colour-coded artery/vein.
const ORGAN_COLORS: [RegExp, string][] = [
  [/liver|hepatic/i, '#7d3f34'],
  [/gallbladder|bile|cystic duct/i, '#5f7f43'],
  [/spleen|splenic/i, '#6f3a54'],
  [/pancrea/i, '#c7a666'],
  [/kidney|renal|suprarenal|adrenal/i, '#8f4a39'],
  [/stomach|gastric/i, '#c67e6b'],
  [/colon|jejunum|ileum|cecum|caecum|duoden|intestin|rectum|append|omentum|mesenter/i, '#cf9f7c'],
  [/lung|pulmonary|bronch|pleura|alveol|lingula/i, '#c99a96'],
  [/trachea|larynx|laryng|pharynx|epiglot|esophag|oesophag|vocal/i, '#d3b7a2'],
  [/heart|ventricle|atrium|myocard|cardiac|valve|papillary|aorta|aortic|pericard/i, '#a5322f'],
  [/bladder|ureter|urethra/i, '#d3bd83'],
  [/prostat|testis|testic|penis|penile|scrot|epididym|seminal|glans|deferens|corpus/i, '#c58a79'],
  [/thyroid|thymus|parathyroid|pituitary|pineal|hypophysis|gland/i, '#b56a5a'],
]
export function organColor(s: Structure): string | null {
  if (s.system === 'cardiovascular') {
    if (/\bvein\b|venous|venule|venae/i.test(s.en)) return '#43619c'
    if (/artery|arterial|aorta|arteriole|arteries/i.test(s.en)) return '#b3272b'
    if (/ventricle|atrium|heart|myocard|valve|papillary/i.test(s.en)) return '#9c2f2c'
    return null
  }
  if (s.system === 'visceral') {
    for (const [re, c] of ORGAN_COLORS) if (re.test(s.en)) return c
    return null
  }
  return null
}
export function describeEn(s: Structure): string {
  const { en } = classify(s.en)
  const sys = SYSTEM_BY_ID[s.system].en.toLowerCase()
  const side =
    s.sides === 'r' ? ', located on the right side of the body'
    : s.sides === 'l' ? ', located on the left side of the body'
    : s.sides === 'rl' ? ', present on both sides of the body'
    : ''
  const art = /^[aeiou]/i.test(en) ? 'an' : 'a'
  return `${s.en} is ${art} ${en} of the ${sys}${side}.`
}

// ---- smart search ---------------------------------------------------------
export function normAr(s: string): string {
  return s
    .replace(/[ً-ْٰـ]/g, '') // tashkeel + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
}
const normEn = (s: string) => s.toLowerCase().replace(/[().,'’\-/]/g, ' ').replace(/\s+/g, ' ').trim()

interface SearchRow {
  id: string
  ar: string; en: string
  arToks: string[]; enToks: string[]
  feature: boolean
}
const SEARCH_ROWS: SearchRow[] = STRUCTURES.map((s) => {
  const ar = normAr(s.ar)
  const en = normEn(s.en + ' ' + (s.la || ''))
  return {
    id: s.id, ar, en,
    arToks: ar.split(' ').filter(Boolean),
    enToks: en.split(' ').filter(Boolean),
    feature: s.feature,
  }
})

// bounded Levenshtein (returns max+1 once the budget is exceeded)
function lev(a: string, b: string, max: number): number {
  const al = a.length, bl = b.length
  if (Math.abs(al - bl) > max) return max + 1
  let prev = new Array(bl + 1)
  for (let j = 0; j <= bl; j++) prev[j] = j
  for (let i = 1; i <= al; i++) {
    const cur = new Array(bl + 1)
    cur[0] = i
    let best = i
    const ac = a.charCodeAt(i - 1)
    for (let j = 1; j <= bl; j++) {
      const cost = ac === b.charCodeAt(j - 1) ? 0 : 1
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      cur[j] = v
      if (v < best) best = v
    }
    if (best > max) return max + 1
    prev = cur
  }
  return prev[bl]
}

// score one query token against a target's token list (typo tolerant)
function tokScore(q: string, toks: string[]): number {
  let best = 0
  for (const t of toks) {
    if (t === q) return 100
    if (t.startsWith(q)) { best = Math.max(best, 82); continue }
    if (q.length >= 3 && t.includes(q)) { best = Math.max(best, 58); continue }
    if (q.length >= 4) {
      const d = lev(q, t, 2)
      if (d <= 2) best = Math.max(best, 64 - d * 20)
      else {
        // light Arabic stemming so singular↔plural/derived forms connect
        // (فقرة ↔ فقرات, قطنية ↔ قطني): shared 3+ char root
        const stem = q.slice(0, Math.max(3, q.length - 2))
        if (stem.length >= 3 && t.includes(stem)) best = Math.max(best, 46)
      }
    }
  }
  return best
}

function scoreRow(row: SearchRow, qToks: string[], phrase: string, isAr: boolean): number {
  const toks = isAr ? row.arToks : row.enToks
  const hay = isAr ? row.ar : row.en
  if (!hay) return 0
  let total = 0
  for (const q of qToks) {
    const sc = tokScore(q, toks)
    if (sc === 0) return 0 // every query token must land somewhere
    total += sc
  }
  if (hay === phrase) total += 500
  else if (hay.startsWith(phrase)) total += 160
  else if (hay.includes(phrase)) total += 70
  if (!row.feature) total += 18 // prefer real (visible) geometry over label pins
  return total
}

// Lay-term synonyms so common searches reach structures modelled by sub-parts
// (the heart is its chambers, the brain its gyri, …).
const ALIASES: Record<string, string[]> = {
  'قلب': ['بطين', 'اذين', 'صمام', 'تاجي', 'ابهر', 'قلب'],
  'heart': ['ventricle', 'atrium', 'valve', 'coronary', 'cardiac', 'aortic'],
  'مخ': ['دماغ', 'تلفيف', 'فص', 'مهاد', 'قشر', 'نواه'],
  'دماغ': ['مخ', 'مخيخ', 'تلفيف', 'جسر', 'نخاع', 'مهاد'],
  'brain': ['cerebrum', 'cerebral', 'gyrus', 'thalamus', 'cortex', 'cerebellum'],
  'عمود فقري': ['فقره', 'عجز', 'عصعص', 'قطني', 'رقبي', 'صدري'],
  'spine': ['vertebra', 'sacrum', 'coccyx', 'lumbar', 'cervical'],
  'رئه': ['رئه', 'قصبه', 'فص', 'شعب'],
  'lung': ['lung', 'bronch', 'lobe', 'pulmonary'],
  'كليه': ['كلوي', 'كليه', 'حالب'],
  'kidney': ['renal', 'kidney', 'ureter'],
  'معده': ['معدي', 'معده', 'بواب', 'فؤاد'],
}
const ALIAS_N: Record<string, string[]> = {}
for (const [k, v] of Object.entries(ALIASES)) {
  const nk = /[؀-ۿ]/.test(k) ? normAr(k) : k.toLowerCase()
  ALIAS_N[nk] = v
}

export function search(query: string, limit = 30): Structure[] {
  const q = query.trim()
  if (!q) return []
  const isAr = /[؀-ۿ]/.test(q)
  const nq = isAr ? normAr(q) : normEn(q)
  if (!nq) return []
  const qToks = nq.split(' ').filter(Boolean)
  const alias = ALIAS_N[nq] || ALIAS_N[nq.replace(/^ال/, '')]
  const scored: { id: string; sc: number }[] = []
  for (const row of SEARCH_ROWS) {
    let sc = scoreRow(row, qToks, nq, isAr)
    if (sc === 0 && alias) {
      const hay = isAr ? row.ar : row.en
      for (const a of alias) {
        const na = isAr ? normAr(a) : a.toLowerCase()
        if (hay.includes(na)) { sc = 48 + (row.feature ? 0 : 18); break }
      }
    }
    if (sc > 0) scored.push({ id: row.id, sc })
  }
  scored.sort((a, b) => b.sc - a.sc)
  return scored.slice(0, limit).map((r) => BY_ID.get(r.id)!)
}

// "did you mean" — closest single structure names for an unmatched query
export function suggestions(query: string, limit = 5): Structure[] {
  const res = search(query, limit)
  return res
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
