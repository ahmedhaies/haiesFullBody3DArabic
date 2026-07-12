// Bilingual UI strings. `t(key, lang)` returns the string for the active
// language. Anatomical term names live in the terminology dataset, not here.

export type Lang = 'ar' | 'en'

type Dict = Record<string, { ar: string; en: string }>

export const UI: Dict = {
  appTitle: { ar: 'أطلس التشريح ثلاثي الأبعاد', en: '3D Anatomy Atlas' },
  appTagline: { ar: 'الجسم البشري كاملاً — عربي/إنجليزي', en: 'The complete human body — Arabic/English' },

  // Actions / toolbar
  search: { ar: 'بحث', en: 'Search' },
  searchPlaceholder: { ar: 'ابحث عن عضو أو عظم أو عضلة…', en: 'Search an organ, bone, muscle…' },
  layers: { ar: 'الأجهزة والطبقات', en: 'Systems & layers' },
  tools: { ar: 'أدوات', en: 'Tools' },
  tours: { ar: 'جولات إرشادية', en: 'Guided tours' },
  library: { ar: 'المكتبة', en: 'Library' },
  favorites: { ar: 'المفضلة', en: 'Favorites' },
  notes: { ar: 'ملاحظاتي', en: 'My notes' },
  help: { ar: 'مساعدة', en: 'Help' },
  reset: { ar: 'إعادة الضبط', en: 'Reset view' },
  close: { ar: 'إغلاق', en: 'Close' },

  // Body sex
  sexTitle: { ar: 'جنس الجسم', en: 'Body sex' },
  sexMale: { ar: 'ذكر', en: 'Male' },
  sexFemale: { ar: 'أنثى', en: 'Female' },
  sexToggle: { ar: 'تبديل الجنس (ذكر/أنثى)', en: 'Switch body (male / female)' },
  femaleNote: {
    ar: 'النماذج مفتوحة المصدر مبنية على جسم ذكر، لذلك في وضع الأنثى تُخفى الأعضاء التناسلية الذكرية. باقي الأجهزة (الهيكل، العضلات، الأوعية، الأعصاب…) مشتركة بين الجنسين.',
    en: 'The open-source models are based on a male body, so female mode hides the male genital organs. All other systems (skeleton, muscles, vessels, nerves…) are shared.',
  },

  clear: { ar: 'مسح', en: 'Clear' },
  language: { ar: 'English', en: 'العربية' }, // label shows the OTHER language

  // Viewer controls
  autoRotate: { ar: 'دوران تلقائي', en: 'Auto-rotate' },
  isolate: { ar: 'إفراد', en: 'Isolate' },
  showAll: { ar: 'إظهار الكل', en: 'Show all' },
  hideOthers: { ar: 'إخفاء الباقي', en: 'Hide others' },
  focus: { ar: 'تركيز', en: 'Focus' },
  transparency: { ar: 'شفافية باقي الأجسام', en: 'Fade other structures' },
  explode: { ar: 'تباعد الطبقات', en: 'Layer depth' },
  showLandmarks: { ar: 'إظهار المعالم والخطوط الدقيقة', en: 'Show surface landmarks & lines' },

  // Cross-section
  crossSection: { ar: 'المقطع العرضي', en: 'Cross-section' },
  planeSagittal: { ar: 'سهمي (يمين/يسار)', en: 'Sagittal (L/R)' },
  planeCoronal: { ar: 'إكليلي (أمام/خلف)', en: 'Coronal (front/back)' },
  planeAxial: { ar: 'محوري (أعلى/أسفل)', en: 'Axial (top/bottom)' },
  flip: { ar: 'عكس الاتجاه', en: 'Flip side' },
  enable: { ar: 'تفعيل', en: 'Enable' },

  // Info panel
  arabicName: { ar: 'الاسم بالعربية', en: 'Arabic name' },
  englishName: { ar: 'الاسم بالإنجليزية', en: 'English name' },
  latinName: { ar: 'الاسم اللاتيني', en: 'Latin (Terminologia)' },
  systemLabel: { ar: 'الجهاز', en: 'System' },
  description: { ar: 'نبذة', en: 'Description' },
  addFavorite: { ar: 'أضف للمفضلة', en: 'Add to favorites' },
  removeFavorite: { ar: 'إزالة من المفضلة', en: 'Remove favorite' },
  addNote: { ar: 'أضف ملاحظة', en: 'Add a note' },
  saveNote: { ar: 'حفظ', en: 'Save' },
  notePlaceholder: { ar: 'اكتب ملاحظتك هنا…', en: 'Write your note…' },
  noArabicYet: { ar: 'الترجمة العربية قيد المراجعة', en: 'Arabic term pending review' },
  side_left: { ar: 'الأيسر', en: 'left' },
  side_right: { ar: 'الأيمن', en: 'right' },
  side_both: { ar: 'أيمن وأيسر', en: 'right & left' },

  // Empty / status
  noResults: { ar: 'لا توجد نتائج', en: 'No results' },
  noFavorites: { ar: 'لا توجد عناصر في المفضلة بعد', en: 'No favorites yet' },
  noNotes: { ar: 'لا توجد ملاحظات بعد', en: 'No notes yet' },
  loading: { ar: 'جارٍ التحميل…', en: 'Loading…' },
  loadingModel: { ar: 'جارٍ تحميل المجسم…', en: 'Loading model…' },
  structuresCount: { ar: 'تركيب', en: 'structures' },
  tapHint: { ar: 'اضغط على أي جزء لعرض تفاصيله', en: 'Tap any part to see its details' },

  // Tours
  tourStart: { ar: 'ابدأ الجولة', en: 'Start tour' },
  tourNext: { ar: 'التالي', en: 'Next' },
  tourPrev: { ar: 'السابق', en: 'Previous' },
  tourExit: { ar: 'إنهاء الجولة', en: 'End tour' },
  tourStep: { ar: 'خطوة', en: 'Step' },
  of: { ar: 'من', en: 'of' },

  // Help
  helpControls: { ar: 'التحكم', en: 'Controls' },
  helpDrag: { ar: 'اسحب: تدوير', en: 'Drag: rotate' },
  helpPinch: { ar: 'قرصة/عجلة: تقريب', en: 'Pinch / wheel: zoom' },
  helpTwoFinger: { ar: 'إصبعان / زر أيمن: تحريك', en: 'Two fingers / right-drag: pan' },
  helpTap: { ar: 'نقرة: تحديد تركيب', en: 'Tap: select a structure' },

  attribution: { ar: 'المصدر والحقوق', en: 'Credits & license' },
}

export function t(key: keyof typeof UI | string, lang: Lang): string {
  const e = UI[key as string]
  return e ? e[lang] : (key as string)
}
