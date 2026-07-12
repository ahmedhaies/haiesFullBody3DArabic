// Re-derive the `f` (hidden-by-default) flag from geometry instead of node-name
// suffixes. Z-Anatomy tags every structure with a tiny (~24-vertex) label pin
// AND, for real structures, a high-vertex mesh. Only the pin-only structures
// (max vertex count below the threshold) are label anchors to hide by default.
import fs from 'node:fs'

const MODELS = '/home/user/haiesFullBody3DArabic/public/models'
const MANIFEST = '/home/user/haiesFullBody3DArabic/src/data/manifest.json'
const THRESHOLD = 40

function parseGLB(file) {
  const b = fs.readFileSync(file)
  const len = b.readUInt32LE(12)
  return JSON.parse(b.slice(20, 20 + len).toString('utf8'))
}
function vertsByName(file) {
  const j = parseGLB(file)
  const acc = j.accessors || [], meshes = j.meshes || []
  const map = new Map()
  for (const n of j.nodes || []) {
    if (n.mesh === undefined || !n.name) continue
    let v = 0
    for (const p of meshes[n.mesh]?.primitives || []) {
      const a = acc[p.attributes?.POSITION]
      if (a) v += a.count
    }
    map.set(n.name, Math.max(map.get(n.name) || 0, v))
  }
  return map
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
let flipped = 0, nowVisible = 0, nowHidden = 0
for (const sys of Object.keys(manifest)) {
  const verts = vertsByName(`${MODELS}/${sys}.glb`)
  for (const s of manifest[sys]) {
    const maxV = Math.max(0, ...s.n.map((n) => verts.get(n) || 0))
    const f = maxV < THRESHOLD ? 1 : 0
    if (f !== s.f) { flipped++; if (f === 0) nowVisible++; else nowHidden++ }
    s.f = f
    s.v = maxV // keep for potential future use
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest))

// report
let prim = 0, feat = 0
for (const sys of Object.keys(manifest)) for (const s of manifest[sys]) (s.f ? feat++ : prim++)
console.log(`threshold: ${THRESHOLD} verts`)
console.log(`flipped: ${flipped} (now visible: ${nowVisible}, now hidden: ${nowHidden})`)
console.log(`totals -> visible: ${prim}, hidden(label pins): ${feat}`)
for (const sys of Object.keys(manifest)) {
  const arr = manifest[sys]
  console.log(`  ${sys.padEnd(15)} visible ${arr.filter((s) => !s.f).length}/${arr.length}`)
}
