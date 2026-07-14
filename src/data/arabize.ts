// Rule-based Arabic composer for anatomical terms the curated/auto dictionaries
// didn't cover. It handles the systematic families (vertebrae, teeth, ribs,
// digits) exactly, and composes the large "[adjective…] noun (of/for noun)"
// landmark family from a gendered lexicon so adjectives agree with their noun.
//
// Philosophy: only emit Arabic when we can map the head noun (and every
// modifier) with confidence. Anything unmapped returns '' so the caller keeps
// the English name rather than showing a wrong translation.

type Gender = 'm' | 'f'

// Head nouns → { Arabic (bare, no article), grammatical gender }
const NOUN: Record<string, { ar: string; g: Gender }> = {
  ligament: { ar: 'رباط', g: 'm' }, ligaments: { ar: 'أربطة', g: 'f' },
  artery: { ar: 'شريان', g: 'm' }, arteries: { ar: 'شرايين', g: 'f' },
  vein: { ar: 'وريد', g: 'm' }, veins: { ar: 'أوردة', g: 'f' },
  nerve: { ar: 'عصب', g: 'm' }, nerves: { ar: 'أعصاب', g: 'f' },
  muscle: { ar: 'عضلة', g: 'f' }, muscles: { ar: 'عضلات', g: 'f' },
  tendon: { ar: 'وتر', g: 'm' }, sheath: { ar: 'غِمد', g: 'm' },
  sulcus: { ar: 'أخدود', g: 'm' }, groove: { ar: 'أخدود', g: 'm' },
  gyrus: { ar: 'تلفيف', g: 'm' }, fossa: { ar: 'حُفرة', g: 'f' }, fovea: { ar: 'نُقرة', g: 'f' },
  tubercle: { ar: 'حُديبة', g: 'f' }, tuberosity: { ar: 'حَدَبة', g: 'f' },
  crest: { ar: 'عُرف', g: 'm' }, line: { ar: 'خط', g: 'm' }, linea: { ar: 'خط', g: 'm' },
  fascia: { ar: 'لفافة', g: 'f' }, bursa: { ar: 'جِراب', g: 'm' },
  bone: { ar: 'عظم', g: 'm' }, bones: { ar: 'عظام', g: 'f' },
  process: { ar: 'ناتئ', g: 'm' }, foramen: { ar: 'ثُقبة', g: 'f' }, canal: { ar: 'قناة', g: 'f' },
  sinus: { ar: 'جيب', g: 'm' }, tract: { ar: 'سبيل', g: 'm' }, nucleus: { ar: 'نواة', g: 'f' },
  valve: { ar: 'صمام', g: 'm' }, leaflet: { ar: 'وُريقة', g: 'f' }, cusp: { ar: 'شُرفة', g: 'f' },
  surface: { ar: 'سطح', g: 'm' }, head: { ar: 'رأس', g: 'm' }, body: { ar: 'جسم', g: 'm' },
  base: { ar: 'قاعدة', g: 'f' }, apex: { ar: 'قمة', g: 'f' }, margin: { ar: 'حافة', g: 'f' },
  border: { ar: 'حافة', g: 'f' }, notch: { ar: 'ثُلمة', g: 'f' }, angle: { ar: 'زاوية', g: 'f' },
  ramus: { ar: 'فرع', g: 'm' }, ala: { ar: 'جناح', g: 'm' }, wing: { ar: 'جناح', g: 'm' },
  plate: { ar: 'صفيحة', g: 'f' }, arch: { ar: 'قوس', g: 'm' }, facet: { ar: 'وجه', g: 'm' },
  circumference: { ar: 'محيط', g: 'm' }, eminence: { ar: 'نُتوء', g: 'm' },
  condyle: { ar: 'لُقمة', g: 'f' }, epicondyle: { ar: 'لُقيمة', g: 'f' },
  trochanter: { ar: 'مِدوَر', g: 'm' }, wall: { ar: 'جدار', g: 'm' }, roof: { ar: 'سقف', g: 'm' },
  floor: { ar: 'قاع', g: 'm' }, limb: { ar: 'طرف', g: 'm' }, part: { ar: 'جزء', g: 'm' },
  branch: { ar: 'فرع', g: 'm' }, branches: { ar: 'فروع', g: 'f' },
  region: { ar: 'منطقة', g: 'f' }, regions: { ar: 'مناطق', g: 'f' },
  skeleton: { ar: 'هيكل', g: 'm' }, girdle: { ar: 'حزام', g: 'm' }, cavity: { ar: 'تجويف', g: 'm' },
  duct: { ar: 'قناة', g: 'f' }, lobe: { ar: 'فص', g: 'm' }, horn: { ar: 'قرن', g: 'm' },
  cornu: { ar: 'قرن', g: 'm' }, pole: { ar: 'قطب', g: 'm' }, neck: { ar: 'عنق', g: 'm' },
  shaft: { ar: 'بدن', g: 'm' }, trochlea: { ar: 'بَكَرة', g: 'f' }, spine: { ar: 'شوكة', g: 'f' },
  node: { ar: 'عقدة', g: 'f' }, nodes: { ar: 'عُقد', g: 'f' }, cell: { ar: 'خلية', g: 'f' }, cells: { ar: 'خلايا', g: 'f' },
  membrane: { ar: 'غشاء', g: 'm' }, cartilage: { ar: 'غضروف', g: 'm' }, capsule: { ar: 'محفظة', g: 'f' },
  ridge: { ar: 'حَرف', g: 'm' }, fissure: { ar: 'شق', g: 'm' }, aperture: { ar: 'فتحة', g: 'f' },
  meatus: { ar: 'صِماخ', g: 'm' }, septum: { ar: 'حاجز', g: 'm' }, trunk: { ar: 'جذع', g: 'm' },
  rib: { ar: 'ضلع', g: 'm' }, ribs: { ar: 'أضلاع', g: 'f' }, disc: { ar: 'قرص', g: 'm' },
  vertebra: { ar: 'فقرة', g: 'f' }, tooth: { ar: 'سِن', g: 'f' }, gland: { ar: 'غدة', g: 'f' },
  pelvis: { ar: 'حوض', g: 'm' }, column: { ar: 'عمود', g: 'm' }, lip: { ar: 'شفة', g: 'f' },
  tip: { ar: 'طرف', g: 'm' }, root: { ar: 'جذر', g: 'm' }, sac: { ar: 'كيس', g: 'm' },
  epiphysis: { ar: 'مِشاش', g: 'm' }, diaphysis: { ar: 'جَدل', g: 'm' }, metaphysis: { ar: 'كُردوس', g: 'm' },
  area: { ar: 'منطقة', g: 'f' }, ossicles: { ar: 'عُظيمات', g: 'f' }, insertion: { ar: 'مَغرِز', g: 'm' },
  protuberance: { ar: 'نُتوء', g: 'm' }, promontory: { ar: 'نُتوء', g: 'm' }, prominence: { ar: 'نُتوء', g: 'm' },
  symphysis: { ar: 'ارتفاق', g: 'm' }, impression: { ar: 'انطباع', g: 'm' }, hiatus: { ar: 'فُرجة', g: 'f' },
  pit: { ar: 'نُقرة', g: 'f' }, incisure: { ar: 'ثُلمة', g: 'f' }, sulci: { ar: 'أخاديد', g: 'f' },
  fibers: { ar: 'ألياف', g: 'f' }, layer: { ar: 'طبقة', g: 'f' }, opening: { ar: 'فتحة', g: 'f' },
  fold: { ar: 'ثنية', g: 'f' }, recess: { ar: 'رَدب', g: 'm' }, junction: { ar: 'ملتقى', g: 'm' },
  pyramid: { ar: 'هرم', g: 'm' }, matter: { ar: 'مادة', g: 'f' }, funiculus: { ar: 'حبل', g: 'm' },
  cord: { ar: 'حبل', g: 'm' }, yoke: { ar: 'نِير', g: 'm' }, lingula: { ar: 'لِسَين', g: 'm' },
  pedicle: { ar: 'سُويقة', g: 'f' }, lamina: { ar: 'صفيحة', g: 'f' }, promontorium: { ar: 'نُتوء', g: 'm' },
  notches: { ar: 'ثُلمات', g: 'f' }, mass: { ar: 'كتلة', g: 'f' }, space: { ar: 'مسافة', g: 'f' },
  plane: { ar: 'مستوى', g: 'm' }, crown: { ar: 'تاج', g: 'm' }, handle: { ar: 'مِقبَض', g: 'm' },
  hook: { ar: 'خُطّاف', g: 'm' }, hamulus: { ar: 'خُطّاف', g: 'm' }, zone: { ar: 'منطقة', g: 'f' },
  end: { ar: 'نهاية', g: 'f' }, shoulder: { ar: 'كتف', g: 'f' }, hip: { ar: 'وِرك', g: 'm' },
  tubercles: { ar: 'حُديبات', g: 'f' }, foramina: { ar: 'ثُقب', g: 'f' },
  phalanges: { ar: 'سُلاميات', g: 'f' }, phalanx: { ar: 'سُلامى', g: 'f' }, inlet: { ar: 'مَدخل', g: 'm' },
  outlet: { ar: 'مَخرَج', g: 'm' }, plateau: { ar: 'هَضبة', g: 'f' }, ridges: { ar: 'حُروف', g: 'f' },
  malleolus: { ar: 'كَعب', g: 'm' }, surfaces: { ar: 'سُطوح', g: 'f' }, condyles: { ar: 'لُقمتان', g: 'f' },
  epicondyles: { ar: 'لُقيمتان', g: 'f' }, borders: { ar: 'حَواف', g: 'f' }, processes: { ar: 'نواتئ', g: 'f' },
}

// Adjectives → masculine / feminine forms
const ADJ: Record<string, { m: string; f: string }> = {
  anterior: { m: 'أمامي', f: 'أمامية' }, posterior: { m: 'خلفي', f: 'خلفية' },
  superior: { m: 'علوي', f: 'علوية' }, inferior: { m: 'سفلي', f: 'سفلية' },
  upper: { m: 'علوي', f: 'علوية' }, lower: { m: 'سفلي', f: 'سفلية' },
  medial: { m: 'إنسي', f: 'إنسية' }, lateral: { m: 'وحشي', f: 'وحشية' },
  dorsal: { m: 'ظهري', f: 'ظهرية' }, ventral: { m: 'بطني', f: 'بطنية' },
  palmar: { m: 'راحي', f: 'راحية' }, plantar: { m: 'أخمصي', f: 'أخمصية' },
  proximal: { m: 'داني', f: 'دانية' }, distal: { m: 'بعيد', f: 'بعيدة' },
  superficial: { m: 'سطحي', f: 'سطحية' }, deep: { m: 'عميق', f: 'عميقة' },
  internal: { m: 'داخلي', f: 'داخلية' }, external: { m: 'خارجي', f: 'خارجية' },
  greater: { m: 'كبير', f: 'كبيرة' }, lesser: { m: 'صغير', f: 'صغيرة' },
  great: { m: 'كبير', f: 'كبيرة' }, major: { m: 'كبير', f: 'كبيرة' }, minor: { m: 'صغير', f: 'صغيرة' },
  large: { m: 'كبير', f: 'كبيرة' }, small: { m: 'صغير', f: 'صغيرة' },
  middle: { m: 'أوسط', f: 'وسطى' }, transverse: { m: 'مستعرض', f: 'مستعرضة' },
  oblique: { m: 'مائل', f: 'مائلة' }, longitudinal: { m: 'طولي', f: 'طولية' },
  common: { m: 'مشترك', f: 'مشتركة' }, articular: { m: 'مفصلي', f: 'مفصلية' },
  interosseous: { m: 'بين عظمي', f: 'بين عظمية' }, fibrous: { m: 'ليفي', f: 'ليفية' },
  cutaneous: { m: 'جلدي', f: 'جلدية' }, vertebral: { m: 'فقري', f: 'فقرية' },
  costal: { m: 'ضلعي', f: 'ضلعية' }, cranial: { m: 'قحفي', f: 'قحفية' },
  nasal: { m: 'أنفي', f: 'أنفية' }, oral: { m: 'فموي', f: 'فموية' }, orbital: { m: 'حجاجي', f: 'حجاجية' },
  frontal: { m: 'جبهي', f: 'جبهية' }, occipital: { m: 'قذالي', f: 'قذالية' },
  temporal: { m: 'صدغي', f: 'صدغية' }, parietal: { m: 'جداري', f: 'جدارية' },
  sphenoidal: { m: 'وتدي', f: 'وتدية' }, sphenoid: { m: 'وتدي', f: 'وتدية' },
  ethmoidal: { m: 'غربالي', f: 'غربالية' }, ethmoid: { m: 'غربالي', f: 'غربالية' },
  pubic: { m: 'عاني', f: 'عانية' }, iliac: { m: 'حرقفي', f: 'حرقفية' },
  ischial: { m: 'إسكي', f: 'إسكية' }, sacral: { m: 'عجزي', f: 'عجزية' },
  thoracic: { m: 'صدري', f: 'صدرية' }, cervical: { m: 'عنقي', f: 'عنقية' },
  lumbar: { m: 'قطني', f: 'قطنية' }, pectoral: { m: 'صدري', f: 'صدرية' },
  pelvic: { m: 'حوضي', f: 'حوضية' }, gluteal: { m: 'أَلَوي', f: 'أَلَوية' },
  femoral: { m: 'فخذي', f: 'فخذية' }, tibial: { m: 'ظنبوبي', f: 'ظنبوبية' },
  radial: { m: 'كعبري', f: 'كعبرية' }, ulnar: { m: 'زندي', f: 'زندية' },
  carpal: { m: 'رسغي', f: 'رسغية' }, tarsal: { m: 'رصغي', f: 'رصغية' },
  coronoid: { m: 'منقاري', f: 'منقارية' }, styloid: { m: 'إبري', f: 'إبرية' },
  mastoid: { m: 'حلمي', f: 'حلمية' }, condylar: { m: 'لُقمي', f: 'لُقمية' },
  spinous: { m: 'شوكي', f: 'شوكية' }, true: { m: 'حقيقي', f: 'حقيقية' },
  false: { m: 'كاذب', f: 'كاذبة' }, floating: { m: 'عائم', f: 'عائمة' },
  accessory: { m: 'إضافي', f: 'إضافية' }, lingual: { m: 'لساني', f: 'لسانية' },
  axial: { m: 'محوري', f: 'محورية' }, appendicular: { m: 'طرفي', f: 'طرفية' },
  bony: { m: 'عظمي', f: 'عظمية' }, nutrient: { m: 'مُغذٍّ', f: 'مغذية' },
  supraorbital: { m: 'فوق حجاجي', f: 'فوق حجاجية' }, infraorbital: { m: 'تحت حجاجي', f: 'تحت حجاجية' },
  zygomatic: { m: 'وجني', f: 'وجنية' }, mandibular: { m: 'فكي سفلي', f: 'فكية سفلية' },
  maxillary: { m: 'فكي علوي', f: 'فكية علوية' }, palatine: { m: 'حنكي', f: 'حنكية' },
  optic: { m: 'بصري', f: 'بصرية' }, jugular: { m: 'وداجي', f: 'وداجية' },
  hypoglossal: { m: 'تحت لساني', f: 'تحت لسانية' }, intervertebral: { m: 'بين فقري', f: 'بين فقرية' },
  glenoid: { m: 'أروح', f: 'أروح' }, acromial: { m: 'أخرمي', f: 'أخرمية' },
  coracoid: { m: 'غرابي', f: 'غرابية' }, deltoid: { m: 'دالي', f: 'دالية' },
  sacroiliac: { m: 'عجزي حرقفي', f: 'عجزية حرقفية' }, obturator: { m: 'سِدادي', f: 'سِدادية' },
  acetabular: { m: 'حُقّي', f: 'حُقّية' }, anatomical: { m: 'تشريحي', f: 'تشريحية' },
  surgical: { m: 'جراحي', f: 'جراحية' }, arcuate: { m: 'مُقوَّس', f: 'مُقوَّسة' },
  auricular: { m: 'أُذيني', f: 'أُذينية' }, conoid: { m: 'مخروطي', f: 'مخروطية' },
  cruciform: { m: 'صليبي', f: 'صليبية' }, cruciate: { m: 'متصالب', f: 'متصالبة' },
  chiasmatic: { m: 'تصالبي', f: 'تصالبية' }, annular: { m: 'حلقي', f: 'حلقية' },
  alveolar: { m: 'سِنخي', f: 'سِنخية' }, mental: { m: 'ذَقني', f: 'ذَقنية' },
  nuchal: { m: 'قفوي', f: 'قفوية' }, sagittal: { m: 'سهمي', f: 'سهمية' },
  coronal: { m: 'إكليلي', f: 'إكليلية' }, petrous: { m: 'صخري', f: 'صخرية' },
  squamous: { m: 'حرشفي', f: 'حرشفية' }, basilar: { m: 'قاعدي', f: 'قاعدية' },
  cribriform: { m: 'مصفوي', f: 'مصفوية' }, perpendicular: { m: 'عمودي', f: 'عمودية' },
  horizontal: { m: 'أفقي', f: 'أفقية' }, vertical: { m: 'رأسي', f: 'رأسية' },
  epiphyseal: { m: 'مشاشي', f: 'مشاشية' }, alar: { m: 'جناحي', f: 'جناحية' },
  pterygoid: { m: 'جناحي', f: 'جناحية' }, trochlear: { m: 'بَكَري', f: 'بَكَرية' },
  semilunar: { m: 'هلالي', f: 'هلالية' }, radiate: { m: 'شعاعي', f: 'شعاعية' },
  pectineal: { m: 'مُشطي', f: 'مُشطية' }, soleal: { m: 'نعلي', f: 'نعلية' },
  popliteal: { m: 'مأبِضي', f: 'مأبِضية' }, medullary: { m: 'نُخاعي', f: 'نُخاعية' },
  cortical: { m: 'قشري', f: 'قشرية' },
  supracondylar: { m: 'فوق لُقمي', f: 'فوق لُقمية' }, infracondylar: { m: 'تحت لُقمي', f: 'تحت لُقمية' },
  intercondylar: { m: 'بين لُقمي', f: 'بين لُقمية' }, subscapular: { m: 'تحت لَوحي', f: 'تحت لَوحية' },
  supraspinous: { m: 'فوق الشوكة', f: 'فوق الشوكة' }, infraspinous: { m: 'تحت الشوكة', f: 'تحت الشوكة' },
  intertubercular: { m: 'بين الحُديبتين', f: 'بين الحُديبتين' }, suprascapular: { m: 'فوق لَوحي', f: 'فوق لَوحية' },
  temporomandibular: { m: 'صدغي فكي', f: 'صدغية فكية' }, sternocostal: { m: 'قصي ضلعي', f: 'قصية ضلعية' },
  sternoclavicular: { m: 'قصي ترقوي', f: 'قصية ترقوية' }, costochondral: { m: 'ضلعي غضروفي', f: 'ضلعية غضروفية' },
  right: { m: 'أيمن', f: 'يمنى' }, left: { m: 'أيسر', f: 'يسرى' },
  hyoid: { m: 'لامي', f: 'لامية' }, grey: { m: 'رمادي', f: 'رمادية' }, gray: { m: 'رمادي', f: 'رمادية' },
  white: { m: 'أبيض', f: 'بيضاء' }, median: { m: 'ناصف', f: 'ناصفة' }, spinal: { m: 'شوكي', f: 'شوكية' },
  motor: { m: 'حركي', f: 'حركية' }, sensory: { m: 'حسّي', f: 'حسّية' },
  intertrochanteric: { m: 'بين المِدوَرين', f: 'بين المِدوَرين' }, iliopubic: { m: 'حرقفي عاني', f: 'حرقفية عانية' },
  ischiopubic: { m: 'إسكي عاني', f: 'إسكية عانية' }, laryngeal: { m: 'حنجري', f: 'حنجرية' },
  hypophysial: { m: 'نخامي', f: 'نخامية' }, hypophyseal: { m: 'نخامي', f: 'نخامية' },
  intercostal: { m: 'وَرْبي', f: 'وَرْبية' }, long: { m: 'طويل', f: 'طويلة' }, short: { m: 'قصير', f: 'قصيرة' },
  mesial: { m: 'إنسي', f: 'إنسية' }, occlusal: { m: 'إطباقي', f: 'إطباقية' }, buccal: { m: 'شِدقي', f: 'شِدقية' },
  labial: { m: 'شَفَوي', f: 'شَفَوية' }, lenticular: { m: 'عَدَسي', f: 'عَدَسية' }, oblong: { m: 'مُستطيل', f: 'مُستطيلة' },
  infraglenoid: { m: 'تحت الأروح', f: 'تحت الأروح' }, supraglenoid: { m: 'فوق الأروح', f: 'فوق الأروح' },
  infrasternal: { m: 'تحت القصي', f: 'تحت القصية' }, extracranial: { m: 'خارج القحفي', f: 'خارج القحفية' },
  intracranial: { m: 'داخل القحفي', f: 'داخل القحفية' }, infratemporal: { m: 'تحت صدغي', f: 'تحت صدغية' },
  terminal: { m: 'حَدّي', f: 'حَدّية' }, sternal: { m: 'قَصّي', f: 'قَصّية' },
  quadrate: { m: 'مُربَّع', f: 'مُربَّعة' }, triangular: { m: 'مُثلَّث', f: 'مُثلَّثة' },
}

// Genitive tail nouns (bones/organs) → definite Arabic form
const GEN: Record<string, string> = {
  ilium: 'الحرقفة', ischium: 'الإسك', pubis: 'العانة', humerus: 'العضد', ulna: 'الزند',
  radius: 'الكعبرة', femur: 'الفخذ', tibia: 'الظنبوب', fibula: 'الشظية', scapula: 'اللوح',
  clavicle: 'الترقوة', sternum: 'القص', mandible: 'الفك السفلي', maxilla: 'الفك العلوي',
  malleus: 'المطرقة', incus: 'السندان', stapes: 'الركاب', sacrum: 'العجز', coccyx: 'العصعص',
  atlas: 'الأطلس', axis: 'المحور', dens: 'السن', foot: 'القدم', hand: 'اليد', thigh: 'الفخذ',
  leg: 'الساق', forearm: 'الساعد', arm: 'العضد', cranium: 'القحف', skull: 'الجمجمة',
  pelvis: 'الحوض', sternebra: 'القص', patella: 'الرضفة', talus: 'الكاحل', calcaneus: 'العَقِب',
  liver: 'الكبد', stomach: 'المعدة', spleen: 'الطحال', kidney: 'الكلية', bladder: 'المثانة',
  lung: 'الرئة', heart: 'القلب', brain: 'الدماغ', tongue: 'اللسان', larynx: 'الحنجرة',
  pharynx: 'البلعوم', trachea: 'الرغامى', esophagus: 'المريء', duodenum: 'الاثنا عشري',
  frontal: 'الجبهة', occiput: 'القذال', 'medulla oblongata': 'النخاع المستطيل',
  'spinal cord': 'الحبل الشوكي', cerebellum: 'المخيخ', cerebrum: 'المخ', pons: 'الجسر',
  hamate: 'العظم الكلابي', trapezium: 'العظم شبه المنحرف', 'hip bone': 'عظم الورك',
  'dens axis': 'السِّنّ المحوري', 'linea aspera': 'الخط الخشن', 'linea apera': 'الخط الخشن',
  'hamate bone': 'العظم الكلابي', 'cuboid bone': 'العظم النَّردي', 'greater wing': 'الجناح الكبير',
  'lesser wing': 'الجناح الصغير', 'iliac crest': 'العُرف الحرقفي',
}

const ORD: { m: string; f: string }[] = [
  { m: '', f: '' },
  { m: 'الأول', f: 'الأولى' }, { m: 'الثاني', f: 'الثانية' }, { m: 'الثالث', f: 'الثالثة' },
  { m: 'الرابع', f: 'الرابعة' }, { m: 'الخامس', f: 'الخامسة' }, { m: 'السادس', f: 'السادسة' },
  { m: 'السابع', f: 'السابعة' }, { m: 'الثامن', f: 'الثامنة' }, { m: 'التاسع', f: 'التاسعة' },
  { m: 'العاشر', f: 'العاشرة' }, { m: 'الحادي عشر', f: 'الحادية عشرة' }, { m: 'الثاني عشر', f: 'الثانية عشرة' },
]
const WORD_ORD: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
  seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
}

const clean = (s: string) => s.replace(/^[([]+|[)\].]+$/g, '').replace(/\s+/g, ' ').trim()
const article = (bare: string) => (/^[اأإآ]/.test(bare) ? 'ال' + bare : 'ال' + bare)
// merge the preposition ل with a following noun (ل + الـ → للـ; else ل attaches)
const lam = (def: string) => (def.startsWith('ال') ? 'ل' + def.slice(1) : 'ل' + def)

// ---- special families -----------------------------------------------------
function vertebra(en: string): string | null {
  // "Vertebra C3", "Atlas (C1)", "Axis (C2)"
  const m = en.match(/\b([CTLS])\s?(\d{1,2})\b/i)
  if (!m) return null
  if (!/vertebra|atlas|axis/i.test(en)) return null
  const region = { c: 'العنقية', t: 'الصدرية', l: 'القطنية', s: 'العجزية' }[m[1].toLowerCase()]!
  const n = parseInt(m[2], 10)
  const region2 = { c: 'العنقية', t: 'الصدرية', l: 'القطنية', s: 'العجزية' }[m[1].toLowerCase()]!
  const ord = ORD[n]?.f || ''
  const base = `الفقرة ${region} ${ord}`.trim()
  if (/atlas/i.test(en)) return `الأطلس (${base})`
  if (/axis/i.test(en)) return `المحور (${base})`
  void region2
  return base
}

function tooth(en: string): string | null {
  const s = en.toLowerCase()
  if (!/incisor|canine|premolar|molar/.test(s)) return null
  const jaw = /upper/.test(s) ? ' العلوي' : /lower/.test(s) ? ' السفلي' : ''
  const jawF = /upper/.test(s) ? ' العلوية' : /lower/.test(s) ? ' السفلية' : ''
  if (/canine/.test(s)) return `الناب${jaw}`.trim()
  if (/incisor/.test(s)) {
    const kind = /lateral/.test(s) ? 'الجانبية' : 'الوسطى'
    return `القاطعة ${kind}${jawF}`.trim()
  }
  const nWord = Object.keys(WORD_ORD).find((w) => s.includes(w))
  const n = nWord ? WORD_ORD[nWord] : 0
  if (/premolar/.test(s)) return `الضاحك${n ? ' ' + ORD[n].m : ''}${jaw}`.trim()
  // molar
  return `الرحى${n ? ' ' + ORD[n].f : ''}${jawF}`.trim()
}

function ribFamily(en: string): string | null {
  const m = en.match(/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+rib$/i)
  if (!m) return null
  return `الضلع ${ORD[WORD_ORD[m[1].toLowerCase()]].m}`
}

// ---- generic lexicon composer ---------------------------------------------
interface NP { head: string; g: Gender; adjs: string[] }
function nounPhrase(seg: string): NP | null {
  const toks = clean(seg).toLowerCase().split(' ').filter(Boolean)
  if (!toks.length) return null
  let headIdx = -1
  for (let i = toks.length - 1; i >= 0; i--) if (NOUN[toks[i]]) { headIdx = i; break }
  if (headIdx === -1) return null
  const noun = NOUN[toks[headIdx]]
  const adjs: string[] = []
  for (let i = 0; i < toks.length; i++) {
    if (i === headIdx) continue
    const w = toks[i]
    if (ADJ[w]) adjs.push(noun.g === 'f' ? ADJ[w].f : ADJ[w].m)
    else if (WORD_ORD[w]) adjs.push(noun.g === 'f' ? ORD[WORD_ORD[w]].f : ORD[WORD_ORD[w]].m)
    else return null // an unmapped modifier — bail so English is kept
  }
  return { head: noun.ar, g: noun.g, adjs }
}
const definiteOf = (np: NP) => article(np.head) + np.adjs.map((a) => ' ' + article(a)).join('')

// render a chain of genitive tail segments into one definite phrase
function genitiveChain(tails: string[]): string | null {
  let acc = ''
  for (let i = tails.length - 1; i >= 0; i--) {
    const seg = clean(tails[i]).toLowerCase()
    let phrase: string
    if (GEN[seg]) phrase = GEN[seg]
    else {
      const np = nounPhrase(seg)
      if (!np) return null
      phrase = i === tails.length - 1 ? definiteOf(np) : np.head // middle tails: bare head (idafa)
    }
    acc = acc ? `${phrase} ${acc}` : phrase
  }
  return acc
}

export function arabize(raw: string): string {
  const en = clean(raw)
  if (!en) return ''
  return (
    vertebra(en) ||
    tooth(en) ||
    ribFamily(en) ||
    generic(en) ||
    ''
  )
}

function generic(en: string): string | null {
  const segs = en.split(/\s+(?:of|for)\s+/i).map((s) => s.trim()).filter(Boolean)
  const main = nounPhrase(segs[0])
  if (!main) return null
  if (segs.length === 1) return definiteOf(main)
  const tail = genitiveChain(segs.slice(1))
  if (!tail) return null
  // main with adjectives → "الرأس المفصلي لـ…"; bare head noun → idafa "رأس الكعبرة"
  return main.adjs.length ? `${definiteOf(main)} ${lam(tail)}` : `${main.head} ${tail}`
}
