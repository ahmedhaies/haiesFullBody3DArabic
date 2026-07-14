// Anatomical systems. Each maps to one optimized GLB produced from the
// Z-Anatomy FBX sources (CC-BY-SA 4.0). `layer` groups systems for the
// skin→muscle→bone style layered reveal.

export type SystemId =
  | 'skeletal'
  | 'joints'
  | 'muscular'
  | 'cardiovascular'
  | 'visceral'
  | 'nervous'
  | 'lymphatic'
  | 'regions'
  | 'references'
  | 'chakras'

export interface SystemMeta {
  id: SystemId
  file: string
  ar: string
  en: string
  latin: string
  color: string        // base tint applied to the system's meshes
  icon: string
  /** depth order for the "layers" reveal slider (0 = deepest) */
  depth: number
  /** loaded & visible by default */
  defaultVisible: boolean
  /** heavier systems can be opt-in to keep first paint fast on mobile */
  heavy?: boolean
}

export const SYSTEMS: SystemMeta[] = [
  {
    id: 'skeletal', file: 'skeletal.glb',
    ar: 'الجهاز الهيكلي', en: 'Skeletal system', latin: 'Systema skeletale',
    color: '#ece3cf', icon: '🦴', depth: 0, defaultVisible: true,
  },
  {
    id: 'joints', file: 'joints.glb',
    ar: 'المفاصل والأربطة', en: 'Joints & ligaments', latin: 'Juncturae',
    color: '#d9c9a3', icon: '🔗', depth: 1, defaultVisible: false,
  },
  {
    id: 'muscular', file: 'muscular.glb',
    ar: 'الجهاز العضلي', en: 'Muscular system', latin: 'Systema musculare',
    color: '#b23b3b', icon: '💪', depth: 2, defaultVisible: false, heavy: true,
  },
  {
    id: 'cardiovascular', file: 'cardiovascular.glb',
    ar: 'الجهاز القلبي الوعائي (الدوري)', en: 'Cardiovascular system', latin: 'Systema cardiovasculare',
    color: '#c0392b', icon: '❤️', depth: 3, defaultVisible: false, heavy: true,
  },
  {
    id: 'visceral', file: 'visceral.glb',
    ar: 'الأحشاء (الأعضاء الداخلية)', en: 'Viscera (internal organs)', latin: 'Viscera',
    color: '#c98a5e', icon: '🫁', depth: 4, defaultVisible: false,
  },
  {
    id: 'nervous', file: 'nervous.glb',
    ar: 'الجهاز العصبي', en: 'Nervous system', latin: 'Systema nervosum',
    color: '#e2c044', icon: '🧠', depth: 5, defaultVisible: false, heavy: true,
  },
  {
    id: 'lymphatic', file: 'lymphatic.glb',
    ar: 'الجهاز اللمفاوي', en: 'Lymphatic system', latin: 'Systema lymphoideum',
    color: '#4a9d7f', icon: '🟢', depth: 6, defaultVisible: false,
  },
  {
    id: 'regions', file: 'regions.glb',
    ar: 'مناطق الجسم', en: 'Body regions', latin: 'Regiones corporis',
    color: '#8a94a6', icon: '🧍', depth: 7, defaultVisible: false,
  },
  {
    id: 'references', file: 'references.glb',
    ar: 'الخطوط والمستويات المرجعية', en: 'Reference lines & planes', latin: 'Termini situm',
    color: '#5b7fb0', icon: '📐', depth: 8, defaultVisible: false,
  },
  {
    // Procedural energy-center overlay (no GLB); rendered by <ChakraLayer/>.
    id: 'chakras', file: '',
    ar: 'الشاكرات (مراكز الطاقة)', en: 'Chakras (energy centers)', latin: 'Cakra',
    color: '#b07ee6', icon: '🌀', depth: 9, defaultVisible: false,
  },
]

export const SYSTEM_BY_ID: Record<SystemId, SystemMeta> = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, s]),
) as Record<SystemId, SystemMeta>
