import type { SystemId } from './systems'
import { STRUCTURES } from './terminology'

export interface TourStep {
  system: SystemId
  key: string
  ar: string
  en: string
}
export interface Tour {
  id: string
  ar: string
  en: string
  icon: string
  system: SystemId
  steps: TourStep[]
}

export const TOURS: Tour[] = [
  {
    id: 'skeleton', ar: 'جولة الهيكل العظمي', en: 'Skeleton tour', icon: '🦴', system: 'skeletal',
    steps: [
      { system: 'skeletal', key: 'Frontal bone', ar: 'العظم الجبهي يُكوّن الجبهة وسقف محجري العينين.', en: 'The frontal bone forms the forehead and orbital roofs.' },
      { system: 'skeletal', key: 'Mandible', ar: 'الفك السفلي هو العظم المتحرّك الوحيد في الجمجمة.', en: 'The mandible is the only movable skull bone.' },
      { system: 'skeletal', key: 'Vertebral column', ar: 'العمود الفقري يحمي النخاع الشوكي ويدعم الجذع.', en: 'The vertebral column protects the spinal cord.' },
      { system: 'skeletal', key: 'Sternum', ar: 'عظم القص في مقدمة الصدر تتصل به الأضلاع.', en: 'The sternum anchors the ribs at the front of the chest.' },
      { system: 'skeletal', key: 'Humerus', ar: 'عظم العَضُد بين الكتف والمرفق.', en: 'The humerus is the upper-arm bone.' },
      { system: 'skeletal', key: 'Femur', ar: 'عظم الفخذ أطول وأقوى عظام الجسم.', en: 'The femur is the longest, strongest bone.' },
      { system: 'skeletal', key: 'Tibia', ar: 'الظنبوب يحمل معظم وزن الجسم في الساق.', en: 'The tibia bears most of the leg’s weight.' },
    ],
  },
  {
    id: 'muscles', ar: 'جولة العضلات الكبرى', en: 'Major muscles tour', icon: '💪', system: 'muscular',
    steps: [
      { system: 'muscular', key: 'Masseter', ar: 'العضلة الماضغة ترفع الفك للمضغ.', en: 'The masseter elevates the jaw for chewing.' },
      { system: 'muscular', key: 'Deltoid muscle', ar: 'العضلة الدالية تبعّد الذراع وتغطي الكتف.', en: 'The deltoid abducts the arm.' },
      { system: 'muscular', key: 'Pectoralis major muscle', ar: 'العضلة الصدرية الكبيرة تقرّب الذراع.', en: 'Pectoralis major adducts the arm.' },
      { system: 'muscular', key: 'Biceps brachii muscle', ar: 'العضلة ذات الرأسين تثني الساعد.', en: 'Biceps brachii flexes the forearm.' },
      { system: 'muscular', key: 'Rectus abdominis muscle', ar: 'العضلة المستقيمة البطنية تثني الجذع.', en: 'Rectus abdominis flexes the trunk.' },
      { system: 'muscular', key: 'Gluteus maximus muscle', ar: 'العضلة الأليوية الكبيرة تبسط الورك.', en: 'Gluteus maximus extends the hip.' },
      { system: 'muscular', key: 'Gastrocnemius muscle', ar: 'العضلة التوأمية تُخمص القدم.', en: 'Gastrocnemius plantarflexes the foot.' },
    ],
  },
  {
    id: 'circulation', ar: 'جولة الدورة الدموية', en: 'Circulation tour', icon: '❤️', system: 'cardiovascular',
    steps: [
      { system: 'cardiovascular', key: 'Ascending aorta', ar: 'الأبهر الصاعد يخرج من البطين الأيسر.', en: 'The ascending aorta leaves the left ventricle.' },
      { system: 'cardiovascular', key: 'Thoracic aorta', ar: 'الأبهر الصدري ينزل داخل الصدر.', en: 'The thoracic aorta descends in the chest.' },
      { system: 'cardiovascular', key: 'Abdominal aorta', ar: 'الأبهر البطني يغذّي الأحشاء والطرفين.', en: 'The abdominal aorta feeds the viscera and legs.' },
      { system: 'cardiovascular', key: 'Pulmonary trunk', ar: 'الجذع الرئوي يحمل الدم إلى الرئتين.', en: 'The pulmonary trunk carries blood to the lungs.' },
      { system: 'cardiovascular', key: 'Superior vena cava', ar: 'الوريد الأجوف العلوي يعيد الدم للقلب.', en: 'The superior vena cava returns blood to the heart.' },
      { system: 'cardiovascular', key: 'Internal carotid artery', ar: 'الشريان السباتي الباطن يغذّي الدماغ.', en: 'The internal carotid artery supplies the brain.' },
    ],
  },
  {
    id: 'nervous', ar: 'جولة الجهاز العصبي', en: 'Nervous system tour', icon: '🧠', system: 'nervous',
    steps: [
      { system: 'nervous', key: 'Cerebrum', ar: 'المخ مركز الإدراك والحركة الإرادية.', en: 'The cerebrum governs cognition and voluntary movement.' },
      { system: 'nervous', key: 'Cerebellum', ar: 'المخيخ ينظّم التوازن والتناسق.', en: 'The cerebellum coordinates balance.' },
      { system: 'nervous', key: 'Spinal cord', ar: 'النخاع الشوكي يوصّل الإشارات للجسم.', en: 'The spinal cord relays signals to the body.' },
      { system: 'nervous', key: 'Median nerve', ar: 'العصب الناصف يتأثر في متلازمة النفق الرسغي.', en: 'The median nerve is affected in carpal tunnel syndrome.' },
      { system: 'nervous', key: 'Sciatic nerve', ar: 'العصب الوركي أطول عصب في الجسم.', en: 'The sciatic nerve is the longest nerve.' },
    ],
  },
  {
    id: 'viscera', ar: 'جولة الأحشاء', en: 'Viscera tour', icon: '🫁', system: 'visceral',
    steps: [
      { system: 'visceral', key: 'Liver', ar: 'الكبد أكبر غدة، يُنقّي الدم ويُنتج الصفراء.', en: 'The liver filters blood and makes bile.' },
      { system: 'visceral', key: 'Stomach', ar: 'المعدة تهضم الطعام بالأحماض.', en: 'The stomach digests food with acid.' },
      { system: 'visceral', key: 'Spleen', ar: 'الطحال يُنقّي الدم ويشارك في المناعة.', en: 'The spleen filters blood and aids immunity.' },
      { system: 'visceral', key: 'Pancreas', ar: 'البنكرياس يُنتج الإنزيمات والإنسولين.', en: 'The pancreas makes enzymes and insulin.' },
      { system: 'visceral', key: 'Kidney', ar: 'الكلية تُنقّي الدم وتُنتج البول.', en: 'The kidney filters blood and makes urine.' },
      { system: 'visceral', key: 'Small intestine', ar: 'الأمعاء الدقيقة موضع معظم الامتصاص.', en: 'The small intestine absorbs nutrients.' },
    ],
  },
]

// resolve a (system,key) step to a concrete structure id, if present in the models
export function resolveStep(step: TourStep): string | null {
  const s = STRUCTURES.find((x) => x.system === step.system && x.key === step.key)
  return s ? s.id : null
}
