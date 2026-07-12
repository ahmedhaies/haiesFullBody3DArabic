// Authoritative Arabic anatomical name composer.
//
// Regenerates src/data/terms_auto.json from the manifest keys using a
// rule-based engine over standard Arabic anatomical terminology (aligned with
// the Unified Medical Dictionary / القاموس الطبي الموحّد). Curated terms in
// terms_curated.json always override these. Conservative by design: a term is
// emitted only when every content word is understood, so we never ship a
// half-translated or grammatically wrong name (those keys keep their English
// label until curated).
//
// Usage: node scripts/compose_ar.mjs
import fs from 'node:fs'

const D = new URL('../src/data/', import.meta.url)
const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', D), 'utf8'))
const curated = JSON.parse(fs.readFileSync(new URL('terms_curated.json', D), 'utf8'))

// ---------------------------------------------------------------------------
// Lexicons.  Each adjective carries masculine + feminine forms (definite);
// the head noun's gender selects the form.
// ---------------------------------------------------------------------------

// directional / positional / size adjectives -> {m,f}
const DIR = {
  anterior: ['الأمامي', 'الأمامية'], posterior: ['الخلفي', 'الخلفية'],
  superior: ['العلوي', 'العلوية'], inferior: ['السفلي', 'السفلية'],
  medial: ['الإنسي', 'الإنسية'], lateral: ['الوحشي', 'الوحشية'],
  median: ['الناصف', 'الناصفة'], middle: ['المتوسط', 'المتوسطة'],
  intermediate: ['المتوسط', 'المتوسطة'],
  proximal: ['الداني', 'الدانية'], distal: ['القاصي', 'القاصية'],
  dorsal: ['الظهري', 'الظهرية'], ventral: ['البطني', 'البطنية'],
  palmar: ['الراحي', 'الراحية'], volar: ['الراحي', 'الراحية'],
  plantar: ['الأخمصي', 'الأخمصية'],
  superficial: ['السطحي', 'السطحية'], deep: ['العميق', 'العميقة'],
  external: ['الخارجي', 'الخارجية'], internal: ['الداخلي', 'الداخلية'],
  outer: ['الخارجي', 'الخارجية'], inner: ['الداخلي', 'الداخلية'],
  transverse: ['المستعرض', 'المستعرضة'], oblique: ['المائل', 'المائلة'],
  longitudinal: ['الطولاني', 'الطولانية'],
  ascending: ['الصاعد', 'الصاعدة'], descending: ['النازل', 'النازلة'],
  right: ['الأيمن', 'اليمنى'], left: ['الأيسر', 'اليسرى'],
  great: ['الكبير', 'الكبيرة'], greater: ['الكبير', 'الكبيرة'],
  greatest: ['الأكبر', 'الكبرى'], major: ['الكبيرة', 'الكبيرة'],
  large: ['الكبير', 'الكبيرة'],
  small: ['الصغير', 'الصغيرة'], lesser: ['الصغير', 'الصغيرة'],
  least: ['الأصغر', 'الصغرى'], minor: ['الصغيرة', 'الصغيرة'], minimal: ['الأصغر', 'الصغرى'],
  long: ['الطويل', 'الطويلة'], longus: ['الطويل', 'الطويلة'], longest: ['الأطول', 'الطولى'],
  longissimus: ['الأطول', 'الطولى'],
  short: ['القصير', 'القصيرة'], brevis: ['القصير', 'القصيرة'], breves: ['القصيرة', 'القصيرة'],
  common: ['المشترك', 'المشتركة'], proper: ['الخاص', 'الخاصة'],
  accessory: ['الملحق', 'الملحقة'], additional: ['الإضافي', 'الإضافية'],
  main: ['الرئيسي', 'الرئيسية'], principal: ['الرئيسي', 'الرئيسية'],
  terminal: ['الانتهائي', 'الانتهائية'], marginal: ['الحافي', 'الحافية'],
  horizontal: ['الأفقي', 'الأفقية'], vertical: ['العمودي', 'العمودية'],
  straight: ['المستقيم', 'المستقيمة'], round: ['المدور', 'المدورة'],
  flat: ['المسطح', 'المسطحة'], long_head: ['الطويل', 'الطويلة'],
  first: ['الأول', 'الأولى'], second: ['الثاني', 'الثانية'], third: ['الثالث', 'الثالثة'],
  fourth: ['الرابع', 'الرابعة'], fifth: ['الخامس', 'الخامسة'], sixth: ['السادس', 'السادسة'],
  seventh: ['السابع', 'السابعة'], eighth: ['الثامن', 'الثامنة'], ninth: ['التاسع', 'التاسعة'],
  tenth: ['العاشر', 'العاشرة'], eleventh: ['الحادي عشر', 'الحادية عشرة'],
  twelfth: ['الثاني عشر', 'الثانية عشرة'],
  innermost: ['الأعمق', 'الأعمق'], outermost: ['الأسطح', 'الأسطح'],
  cranial: ['العلوي', 'العلوية'], caudal: ['السفلي', 'السفلية'],
  rostral: ['الأمامي', 'الأمامية'],
  compact: ['الكثيف', 'الكثيفة'], spongy: ['الإسفنجي', 'الإسفنجية'],
  free: ['الحر', 'الحرة'], fixed: ['الثابت', 'الثابتة'],
}

// region / bone / organ adjective roots -> {m,f}
const RADJ = {
  frontal: ['الجبهي', 'الجبهية'], parietal: ['الجداري', 'الجدارية'],
  occipital: ['القذالي', 'القذالية'], temporal: ['الصدغي', 'الصدغية'],
  sphenoid: ['الوتدي', 'الوتدية'], sphenoidal: ['الوتدي', 'الوتدية'],
  ethmoid: ['الغربالي', 'الغربالية'], ethmoidal: ['الغربالي', 'الغربالية'],
  nasal: ['الأنفي', 'الأنفية'], vomer: ['الميكعي', 'الميكعية'],
  maxillary: ['الفكي العلوي', 'الفكية العلوية'], mandibular: ['الفكي السفلي', 'الفكية السفلية'],
  zygomatic: ['الوجني', 'الوجنية'], malar: ['الوجني', 'الوجنية'],
  lacrimal: ['الدمعي', 'الدمعية'], palatine: ['الحنكي', 'الحنكية'], palatal: ['الحنكي', 'الحنكية'],
  hyoid: ['اللامي', 'اللامية'], thyroid: ['الدرقي', 'الدرقية'],
  cricoid: ['الحلقي', 'الحلقية'], arytenoid: ['الطرجهالي', 'الطرجهالية'],
  epiglottic: ['اللساني المزماري', 'اللسانية المزمارية'],
  laryngeal: ['الحنجري', 'الحنجرية'], pharyngeal: ['البلعومي', 'البلعومية'],
  tracheal: ['الرغامي', 'الرغامية'], esophageal: ['المريئي', 'المريئية'],
  lingual: ['اللساني', 'اللسانية'], buccal: ['الخدي', 'الخدية'],
  labial: ['الشفوي', 'الشفوية'], mental: ['الذقني', 'الذقنية'],
  orbital: ['الحجاجي', 'الحجاجية'], nuchal: ['القفوي', 'القفوية'],
  cervical: ['الرقبي', 'الرقبية'], thoracic: ['الصدري', 'الصدرية'],
  lumbar: ['القطني', 'القطنية'], sacral: ['العجزي', 'العجزية'],
  coccygeal: ['العصعصي', 'العصعصية'], costal: ['الضلعي', 'الضلعية'],
  sternal: ['القصي', 'القصية'], clavicular: ['الترقوي', 'الترقوية'],
  scapular: ['الكتفي', 'الكتفية'], acromial: ['الأخرمي', 'الأخرمية'],
  coracoid: ['الغرابي', 'الغرابية'], glenoid: ['الحُقّي', 'الحُقّية'],
  humeral: ['العضدي', 'العضدية'], radial: ['الكعبري', 'الكعبرية'],
  ulnar: ['الزندي', 'الزندية'], carpal: ['الرسغي', 'الرسغية'],
  metacarpal: ['السنعي', 'السنعية'], phalangeal: ['السلامي', 'السلامية'],
  digital: ['الإصبعي', 'الإصبعية'], interosseous: ['بين العظمي', 'بين العظمية'],
  interphalangeal: ['بين السلامي', 'بين السلامية'],
  metacarpophalangeal: ['السنعي السلامي', 'السنعية السلامية'],
  iliac: ['الحرقفي', 'الحرقفية'], ischial: ['الإسكي', 'الإسكية'],
  pubic: ['العاني', 'العانية'], femoral: ['الفخذي', 'الفخذية'],
  tibial: ['الظنبوبي', 'الظنبوبية'], fibular: ['الشظوي', 'الشظوية'],
  peroneal: ['الشظوي', 'الشظوية'], patellar: ['الرضفي', 'الرضفية'],
  tarsal: ['الرصغي', 'الرصغية'], metatarsal: ['المشطي', 'المشطية'],
  calcaneal: ['العقبي', 'العقبية'], talar: ['الكاحلي', 'الكاحلية'],
  navicular: ['الزورقي', 'الزورقية'], cuboid: ['النردي', 'النردية'],
  popliteal: ['المأبضي', 'المأبضية'], inguinal: ['الأربي', 'الأربية'],
  abdominal: ['البطني', 'البطنية'], pelvic: ['الحوضي', 'الحوضية'],
  perineal: ['العجاني', 'العجانية'], gluteal: ['الأليوي', 'الألوية'],
  vertebral: ['الفقري', 'الفقرية'], spinal: ['الشوكي', 'الشوكية'],
  pulmonary: ['الرئوي', 'الرئوية'], bronchial: ['القصبي', 'القصبية'],
  pleural: ['الجنبي', 'الجنبية'], cardiac: ['القلبي', 'القلبية'],
  coronary: ['التاجي', 'التاجية'], aortic: ['الأبهري', 'الأبهرية'],
  atrial: ['الأذيني', 'الأذينية'], ventricular: ['البطيني', 'البطينية'],
  hepatic: ['الكبدي', 'الكبدية'], splenic: ['الطحالي', 'الطحالية'],
  gastric: ['المعدي', 'المعدية'], renal: ['الكلوي', 'الكلوية'],
  suprarenal: ['الكظري', 'الكظرية'], adrenal: ['الكظري', 'الكظرية'],
  pancreatic: ['البنكرياسي', 'البنكرياسية'], intestinal: ['المعوي', 'المعوية'],
  colic: ['القولوني', 'القولونية'], rectal: ['المستقيمي', 'المستقيمية'],
  duodenal: ['الاثناعشري', 'الاثناعشرية'], jejunal: ['الصائمي', 'الصائمية'],
  ileal: ['اللفائفي', 'اللفائفية'], cecal: ['الأعوري', 'الأعورية'],
  mesenteric: ['المساريقي', 'المساريقية'], portal: ['البابي', 'البابية'],
  jugular: ['الوداجي', 'الوداجية'], carotid: ['السباتي', 'السباتية'],
  axillary: ['الإبطي', 'الإبطية'], brachial: ['العضدي', 'العضدية'],
  antebrachial: ['الساعدي', 'الساعدية'], basilar: ['القاعدي', 'القاعدية'],
  ophthalmic: ['العيني', 'العينية'], facial: ['الوجهي', 'الوجهية'],
  meningeal: ['السحائي', 'السحائية'], dural: ['الجافوي', 'الجافوية'],
  cerebral: ['المخي', 'المخية'], cerebellar: ['المخيخي', 'المخيخية'],
  pontine: ['الجسري', 'الجسرية'], medullary: ['النخاعي', 'النخاعية'],
  thalamic: ['المهادي', 'المهادية'], striatal: ['المخططي', 'المخططية'],
  caudate: ['المذنب', 'المذنبة'], lentiform: ['العدسي', 'العدسية'],
  olfactory: ['الشمي', 'الشمية'], optic: ['البصري', 'البصرية'],
  hypoglossal: ['تحت اللساني', 'تحت اللسانية'],
  auricular: ['الأذني', 'الأذنية'], tympanic: ['الطبلي', 'الطبلية'],
  mastoid: ['الخشائي', 'الخشائية'], styloid: ['الإبري', 'الإبرية'],
  petrous: ['الصخري', 'الصخرية'], squamous: ['الحرشفي', 'الحرشفية'],
  cavernous: ['الكهفي', 'الكهفية'], sigmoid: ['السيني', 'السينية'],
  transverse_sinus: ['المستعرض', 'المستعرضة'], straight_sinus: ['المستقيم', 'المستقيمة'],
  renal_pelvis: ['الكلوي', 'الكلوية'],
  epigastric: ['الشرسوفي', 'الشرسوفية'], hypogastric: ['تحت المعدي', 'تحت المعدية'],
  umbilical: ['السري', 'السرية'], phrenic: ['الحجابي', 'الحجابية'],
  intercostal: ['الوربي', 'الوربية'], subcostal: ['تحت الضلعي', 'تحت الضلعية'],
  suprascapular: ['فوق الكتفي', 'فوق الكتفية'], subscapular: ['تحت الكتفي', 'تحت الكتفية'],
  supraspinous: ['فوق الشوكي', 'فوق الشوكية'], infraspinous: ['تحت الشوكي', 'تحت الشوكية'],
  supraorbital: ['فوق الحجاجي', 'فوق الحجاجية'], infraorbital: ['تحت الحجاجي', 'تحت الحجاجية'],
  supratrochlear: ['فوق البكري', 'فوق البكرية'], infratrochlear: ['تحت البكري', 'تحت البكرية'],
  retromandibular: ['خلف الفكي', 'خلف الفكية'], submandibular: ['تحت الفكي', 'تحت الفكية'],
  submental: ['تحت الذقني', 'تحت الذقنية'], sublingual: ['تحت اللساني', 'تحت اللسانية'],
  angular: ['الزاوي', 'الزاوية'], marginal: ['الحافي', 'الحافية'],
  apical: ['القمي', 'القمية'], basal: ['القاعدي', 'القاعدية'],
  septal: ['الحاجزي', 'الحاجزية'], lingular: ['اللُّهَيْمي', 'اللُّهَيْمية'],
  areolar: ['الهالي', 'الهالية'], papillary: ['الحُلَيمي', 'الحُلَيمية'],
  cutaneous: ['الجلدي', 'الجلدية'], muscular: ['العضلي', 'العضلية'],
  articular: ['المفصلي', 'المفصلية'], synovial: ['الزليلي', 'الزليلية'],
  fibrous: ['الليفي', 'الليفية'], serous: ['المصلي', 'المصلية'],
  mucous: ['المخاطي', 'المخاطية'], subcutaneous: ['تحت الجلدي', 'تحت الجلدية'],
  cortical: ['القشري', 'القشرية'], nuchal_line: ['القفوي', 'القفوية'],
  obturator: ['السدادي', 'السدادية'], sciatic: ['الوركي', 'الوركية'],
  trochanteric: ['المدوري', 'المدورية'], condylar: ['اللقمي', 'اللقمية'],
  epicondylar: ['فوق اللقمي', 'فوق اللقمية'], malleolar: ['الكعبي', 'الكعبية'],
  cuneiform: ['الإسفيني', 'الإسفينية'], pisiform: ['الحمصي', 'الحمصية'],
  lunate: ['الهلالي', 'الهلالية'], scaphoid: ['الزورقي', 'الزورقية'],
  capitate: ['الكبير', 'الكبيرة'], hamate: ['الكلابي', 'الكلابية'],
  triquetral: ['الهرمي', 'الهرمية'],
  cricothyroid: ['الحلقي الدرقي', 'الحلقية الدرقية'],
  thyrohyoid: ['الدرقي اللامي', 'الدرقية اللامية'],
  sternocleidomastoid: ['القصية الترقوية الخشائية', 'القصية الترقوية الخشائية'],
  iliolumbar: ['الحرقفي القطني', 'الحرقفية القطنية'],
  sacroiliac: ['العجزي الحرقفي', 'العجزية الحرقفية'],
  sacrospinous: ['العجزي الشوكي', 'العجزية الشوكية'],
  sacrotuberous: ['العجزي الحدبي', 'العجزية الحدبية'],
  costotransverse: ['الضلعي المستعرض', 'الضلعية المستعرضة'],
  sternoclavicular: ['القصي الترقوي', 'القصية الترقوية'],
  acromioclavicular: ['الأخرمي الترقوي', 'الأخرمية الترقوية'],
  coracoclavicular: ['الغرابي الترقوي', 'الغرابية الترقوية'],
  coracoacromial: ['الغرابي الأخرمي', 'الغرابية الأخرمية'],
  coracohumeral: ['الغرابي العضدي', 'الغرابية العضدية'],
  glenohumeral: ['الحُقّي العضدي', 'الحُقّية العضدية'],
  radioulnar: ['الكعبري الزندي', 'الكعبرية الزندية'],
  radiocarpal: ['الكعبري الرسغي', 'الكعبرية الرسغية'],
  ulnocarpal: ['الزندي الرسغي', 'الزندية الرسغية'],
  intercarpal: ['بين الرسغي', 'بين الرسغية'],
  carpometacarpal: ['الرسغي السنعي', 'الرسغية السنعية'],
  talofibular: ['الكاحلي الشظوي', 'الكاحلية الشظوية'],
  talocalcaneal: ['الكاحلي العقبي', 'الكاحلية العقبية'],
  talonavicular: ['الكاحلي الزورقي', 'الكاحلية الزورقية'],
  tibiofibular: ['الظنبوبي الشظوي', 'الظنبوبية الشظوية'],
  tibionavicular: ['الظنبوبي الزورقي', 'الظنبوبية الزورقية'],
  calcaneofibular: ['العقبي الشظوي', 'العقبية الشظوية'],
  calcaneonavicular: ['العقبي الزورقي', 'العقبية الزورقية'],
  calcaneocuboid: ['العقبي النردي', 'العقبية النردية'],
  cuneonavicular: ['الإسفيني الزورقي', 'الإسفينية الزورقية'],
  patellofemoral: ['الرضفي الفخذي', 'الرضفية الفخذية'],
  pubofemoral: ['العاني الفخذي', 'العانية الفخذية'],
  iliofemoral: ['الحرقفي الفخذي', 'الحرقفية الفخذية'],
  ischiofemoral: ['الإسكي الفخذي', 'الإسكية الفخذية'],
  costoclavicular: ['الضلعي الترقوي', 'الضلعية الترقوية'],
  cervicothoracic: ['الرقبي الصدري', 'الرقبية الصدرية'],
  thoracolumbar: ['الصدري القطني', 'الصدرية القطنية'],
  nasolabial: ['الأنفي الشفوي', 'الأنفية الشفوية'],
  nasolacrimal: ['الأنفي الدمعي', 'الأنفية الدمعية'],
  nasopalatine: ['الأنفي الحنكي', 'الأنفية الحنكية'],
  temporomandibular: ['الصدغي الفكي', 'الصدغية الفكية'],
  atlanto: ['الأطلسي', 'الأطلسية'], atlantoaxial: ['الأطلسي المحوري', 'الأطلسية المحورية'],
  atlantooccipital: ['الأطلسي القذالي', 'الأطلسية القذالية'],
}

// noun heads: type / part / organ -> {ar, g:'m'|'f', pl?}
const NOUN = {
  // structure types
  muscle: ['العضلة', 'f', 'العضلات'], ligament: ['الرباط', 'm', 'الأربطة'],
  artery: ['الشريان', 'm', 'الشرايين'], vein: ['الوريد', 'm', 'الأوردة'],
  nerve: ['العصب', 'm', 'الأعصاب'], node: ['العقدة اللمفية', 'f', 'العُقد اللمفية'],
  vessel: ['الوعاء', 'm', 'الأوعية'], tendon: ['الوتر', 'm', 'الأوتار'],
  cartilage: ['الغضروف', 'm', 'الغضاريف'], bursa: ['الجِراب', 'm', 'الأجربة'],
  disc: ['القرص', 'm', 'الأقراص'], disk: ['القرص', 'm', 'الأقراص'],
  vertebra: ['الفقرة', 'f', 'الفقرات'], rib: ['الضلع', 'm', 'الأضلاع'],
  bone: ['العظم', 'm', 'العظام'], gyrus: ['التلفيف', 'm', 'التلافيف'],
  sulcus: ['التلم', 'm', 'التلامات'], nucleus: ['النواة', 'f', 'النوى'],
  fossa: ['الحفرة', 'f', 'الحُفر'], fovea: ['النقرة', 'f'],
  process: ['الناتئ', 'm', 'النواتئ'], tubercle: ['الحُدَيبة', 'f', 'الحُدَيبات'],
  tuberosity: ['الأحدوبة', 'f'], trochanter: ['المَدْوَر', 'm'],
  branch: ['الفرع', 'm', 'الفروع'], tract: ['السبيل', 'm', 'السُّبل'],
  sheath: ['الغِمد', 'm', 'الأغماد'], fascia: ['اللفافة', 'f', 'اللفافات'],
  joint: ['المفصل', 'm', 'المفاصل'], capsule: ['المحفظة', 'f'],
  septum: ['الحاجز', 'm', 'الحواجز'], cortex: ['القشرة', 'f'],
  notch: ['الثلمة', 'f', 'الثُّلم'], incisure: ['الثلمة', 'f'],
  lobe: ['الفص', 'm', 'الفصوص'], lobule: ['الفُصيص', 'm', 'الفُصيصات'],
  bronchus: ['القصبة', 'f', 'القصبات'], gland: ['الغدة', 'f', 'الغدد'],
  ganglion: ['العقدة', 'f', 'العُقد'], plexus: ['الضفيرة', 'f', 'الضفائر'],
  sinus: ['الجيب', 'm', 'الجيوب'], duct: ['القناة', 'f', 'القنوات'],
  ventricle: ['البطين', 'm', 'البطينات'], atrium: ['الأذين', 'm', 'الأذينات'],
  horn: ['القرن', 'm', 'القرون'], crest: ['العُرف', 'm', 'الأعراف'],
  spine: ['الشوكة', 'f', 'الأشواك'], foramen: ['الثقبة', 'f', 'الثقوب'],
  canal: ['القناة', 'f', 'القنوات'], groove: ['الأخدود', 'm', 'الأخاديد'],
  arch: ['القوس', 'm', 'الأقواس'], ala: ['الجناح', 'm', 'الأجنحة'],
  wing: ['الجناح', 'm', 'الأجنحة'], region: ['المنطقة', 'f', 'المناطق'],
  meniscus: ['الغضروف الهلالي', 'm'], retinaculum: ['الشبكة', 'f'],
  aponeurosis: ['الصفاق', 'm'], raphe: ['الرَّفَط', 'm'],
  commissure: ['الملتقى', 'm'], funiculus: ['الحبل', 'm'],
  fasciculus: ['الحُزَيمة', 'f'], fascicle: ['الحُزَيمة', 'f'],
  peduncle: ['السويقة', 'f'], lamina: ['الصفيحة', 'f', 'الصفائح'],
  pedicle: ['السويقة', 'f'], condyle: ['اللقمة', 'f', 'اللقم'],
  epicondyle: ['فوق اللقمة', 'f'], malleolus: ['الكعب', 'm'],
  facet: ['السطح المفصلي', 'm'], ramus: ['الفرع', 'm', 'الفروع'],
  body: ['الجسم', 'm'], head: ['الرأس', 'm', 'الرؤوس'],
  neck: ['العنق', 'm'], base: ['القاعدة', 'f'], apex: ['القمة', 'f'],
  border: ['الحافة', 'f', 'الحواف'], margin: ['الحافة', 'f'],
  surface: ['السطح', 'm', 'الأسطح'], angle: ['الزاوية', 'f'],
  line: ['الخط', 'm', 'الخطوط'], belly: ['البطن', 'm'],
  part: ['الجزء', 'm', 'الأجزاء'], impression: ['الانطباع', 'm'],
  eminence: ['الأكمة', 'f'], protuberance: ['البروز', 'm'],
  symphysis: ['الارتفاق', 'm'], suture: ['الدرز', 'm', 'الدروز'],
  membrane: ['الغشاء', 'm', 'الأغشية'], fissure: ['الشق', 'm', 'الشقوق'],
  cistern: ['الصهريج', 'm'], colliculus: ['الأكيمة', 'f'],
  pyramid: ['الهرم', 'm'], operculum: ['الغطاء', 'm'],
  uncus: ['الخُطّاف', 'm'], insula: ['الجزيرة', 'f'],
  cuneus: ['الإسفين', 'm'], precuneus: ['الطليعة الإسفينية', 'f'],
  gyri: ['التلافيف', 'm'], valve: ['الصمام', 'm', 'الصمامات'],
  leaflet: ['الوريقة', 'f', 'الوريقات'], cusp: ['الشُّرفة', 'f', 'الشُّرَف'],
  chamber: ['الحجرة', 'f'], papilla: ['الحُلَيمة', 'f'],
  crus: ['الساق', 'f'], column: ['العمود', 'm', 'الأعمدة'],
  cord: ['الحبل', 'm', 'الحبال'], trunk: ['الجذع', 'm', 'الجذوع'],
  arcade: ['القوس', 'm'], loop: ['العروة', 'f'],
  tuber: ['الحدبة', 'f'], tubercle_: ['الحُدَيبة', 'f'],
  division: ['القسم', 'm', 'الأقسام'], root: ['الجذر', 'm', 'الجذور'],
  triangle: ['المثلث', 'm', 'المثلثات'], segment: ['القطعة', 'f', 'القطع'],
  labrum: ['الشفة الغضروفية', 'f'], canaliculus: ['القُنَيَّة', 'f'],
  ampulla: ['الأمبولة', 'f'], dorsum: ['الظهر', 'm'], cavity: ['التجويف', 'm'],
  labyrinth: ['التيه', 'm'], cochlea: ['القوقعة', 'f'], vestibule: ['الدهليز', 'm'],
  antihelix: ['الحلزون المضاد', 'm'], helix: ['الحلزون', 'm'], concha: ['الصِّماخ', 'f'],
  tragus: ['الوَتَد', 'm'], lobule_ear: ['الشحمة', 'f'], auricle: ['الصيوان', 'm'],
  taenia: ['الشريط', 'm'], flexure: ['الانثناء', 'm'], hiatus: ['الفُرجة', 'f'],
  isthmus: ['البرزخ', 'm'], calyx: ['الكأس', 'm'], pole: ['القطب', 'm'],
  hilum: ['السُّرَّة', 'f'], fundus: ['القاع', 'm'], antrum: ['الغار', 'm'],
  septum_: ['الحاجز', 'm'], vallecula: ['الوهدة', 'f'], caruncle: ['اللحيمة', 'f'],
  fornix: ['القبو', 'm'], commissure_: ['الملتقى', 'm'], funiculus_: ['الحبل', 'm'],
  decussation: ['التصالب', 'm'], lemniscus: ['الفتيل', 'm'], aqueduct: ['المَسال', 'm'],
  ventricle_brain: ['البطين', 'm'], claustrum: ['السياج', 'm'], putamen: ['البُطامة', 'f'],
  pallidum: ['الكرة الشاحبة', 'f'], amygdala: ['اللوزة', 'f'], insula_: ['الجزيرة', 'f'],
  tegmentum: ['السقيفة', 'f'], tectum: ['السقف', 'm'], uvula: ['اللهاة', 'f'],
  gland: ['الغدة', 'f', 'الغدد'],
  // organs usable as head nouns ("Ascending colon", "Right kidney" …)
  colon: ['القولون', 'm'], cecum: ['الأعور', 'm'], caecum: ['الأعور', 'm'],
  rectum: ['المستقيم', 'm'], ileum: ['اللفائفي', 'm'], jejunum: ['الصائم', 'm'],
  duodenum: ['الاثنا عشر', 'm'], stomach: ['المعدة', 'f'], liver: ['الكبد', 'm'],
  spleen: ['الطحال', 'm'], kidney: ['الكلية', 'f'], bladder: ['المثانة', 'f'],
  ureter: ['الحالب', 'm'], urethra: ['الإحليل', 'm'], uterus: ['الرحم', 'm'],
  ovary: ['المبيض', 'm'], testis: ['الخصية', 'f'], prostate: ['البروستاتا', 'f'],
  epididymis: ['البربخ', 'm'], penis: ['القضيب', 'm'], trachea: ['الرغامى', 'f'],
  esophagus: ['المريء', 'm'], oesophagus: ['المريء', 'm'], pharynx: ['البلعوم', 'm'],
  larynx: ['الحنجرة', 'f'], tongue: ['اللسان', 'm'], tonsil: ['اللوزة', 'f'],
  thymus: ['التوتة', 'f'], appendix: ['الزائدة الدودية', 'f'], gallbladder: ['المرارة', 'f'],
  pancreas: ['البنكرياس', 'm'], diaphragm: ['الحجاب الحاجز', 'm'], peritoneum: ['الصِّفاق', 'm'],
  omentum: ['الثرب', 'm'], mesentery: ['المِساريقا', 'f'], pleura: ['الجَنْبة', 'f'],
  pericardium: ['التامور', 'm'], lung: ['الرئة', 'f'], heart: ['القلب', 'm'],
  eyeball: ['مقلة العين', 'f'], cornea: ['القرنية', 'f'], retina: ['الشبكية', 'f'],
  iris: ['القزحية', 'f'], sclera: ['الصُّلبة', 'f'], skin: ['الجلد', 'm'],
  // digits, teeth, brain matter
  phalanx: ['السلامية', 'f', 'السلاميات'], finger: ['الإصبع', 'm', 'الأصابع'],
  toe: ['إصبع القدم', 'm', 'أصابع القدم'], digit: ['الإصبع', 'm', 'الأصابع'],
  thumb: ['الإبهام', 'm'], matter: ['المادة', 'f'], tooth: ['السن', 'f', 'الأسنان'],
  telencephalon: ['الدماغ الانتهائي', 'm'], diencephalon: ['الدماغ البيني', 'm'],
  mesencephalon: ['الدماغ المتوسط', 'm'], metencephalon: ['الدماغ التالي', 'm'],
  myelencephalon: ['الدماغ البصلي', 'm'], rhombencephalon: ['الدماغ المعيني', 'm'],
  pons: ['الجسر', 'm'], midbrain: ['الدماغ المتوسط', 'm'], hypophysis: ['النخامة', 'f'],
}

// plural type markers (english plural noun -> singular key + force plural)
const PLURALS = {
  muscles: 'muscle', ligaments: 'ligament', arteries: 'artery', veins: 'vein',
  nerves: 'nerve', nodes: 'node', vessels: 'vessel', tendons: 'tendon',
  cartilages: 'cartilage', branches: 'branch', bones: 'bone', gyri: 'gyrus',
  nuclei: 'nucleus', processes: 'process', tubercles: 'tubercle', glands: 'gland',
  lobes: 'lobe', lobules: 'lobule', ganglia: 'ganglion', foramina: 'foramen',
  sinuses: 'sinus', ducts: 'duct', joints: 'joint', discs: 'disc',
  ribs: 'rib', vertebrae: 'vertebra', folds: 'fold', bursae: 'bursa',
  fasciae: 'fascia', laminae: 'lamina', condyles: 'condyle', crests: 'crest',
  lines: 'line', horns: 'horn', valves: 'valve', columns: 'column',
}

// Latin genitive tokens -> either an adjective {adj:[m,f]} or an idafa owner {li:'...'}
const LATGEN = {
  digitorum: { li: 'الأصابع' }, digiti: { li: 'الإصبع' }, pollicis: { li: 'الإبهام' },
  hallucis: { li: 'إبهام القدم' }, indicis: { li: 'السبابة' }, minimi: { adj: ['الصغير', 'الصغيرة'] },
  carpi: { li: 'الرسغ' }, cruris: { adj: ['الساقي', 'الساقية'] }, femoris: { adj: ['الفخذي', 'الفخذية'] },
  brachii: { adj: ['العضدي', 'العضدية'] }, capitis: { adj: ['الرأسي', 'الرأسية'] },
  colli: { adj: ['الرقبي', 'الرقبية'] }, cervicis: { adj: ['الرقبي', 'الرقبية'] },
  thoracis: { adj: ['الصدري', 'الصدرية'] }, lumborum: { adj: ['القطني', 'القطنية'] },
  abdominis: { adj: ['البطني', 'البطنية'] }, oris: { adj: ['الفموي', 'الفموية'] },
  oculi: { adj: ['العيني', 'العينية'] }, nasi: { adj: ['الأنفي', 'الأنفية'] },
  plantae: { adj: ['الأخمصي', 'الأخمصية'] }, ani: { adj: ['الشرجي', 'الشرجية'] },
  costarum: { li: 'الأضلاع' }, surae: { adj: ['الساقي', 'الساقية'] },
  genus: { adj: ['الركبي', 'الركبية'] },
}

// "of X" owner noun phrases (bare nouns) -> arabic definite noun
const OWNER = {
  hand: 'اليد', foot: 'القدم', wrist: 'الرسغ', ankle: 'الكاحل', knee: 'الركبة',
  elbow: 'المرفق', shoulder: 'الكتف', hip: 'الورك', thigh: 'الفخذ', leg: 'الساق',
  arm: 'العضد', forearm: 'الساعد', head: 'الرأس', neck: 'العنق', face: 'الوجه',
  thorax: 'الصدر', chest: 'الصدر', abdomen: 'البطن', pelvis: 'الحوض', skull: 'الجمجمة',
  thumb: 'الإبهام', finger: 'الإصبع', toe: 'إصبع القدم', palm: 'الراحة',
  heart: 'القلب', lung: 'الرئة', liver: 'الكبد', spleen: 'الطحال', stomach: 'المعدة',
  kidney: 'الكلية', pancreas: 'البنكرياس', bladder: 'المثانة', brain: 'الدماغ',
  cerebrum: 'المخ', cerebellum: 'المخيخ', tongue: 'اللسان', eye: 'العين',
  nose: 'الأنف', ear: 'الأذن', mouth: 'الفم', larynx: 'الحنجرة', pharynx: 'البلعوم',
  trachea: 'الرغامى', esophagus: 'المريء', duodenum: 'الاثنا عشر', jejunum: 'الصائم',
  ileum: 'اللفائفي', cecum: 'الأعور', colon: 'القولون', rectum: 'المستقيم',
  uterus: 'الرحم', ovary: 'المبيض', testis: 'الخصية', prostate: 'البروستاتا',
  penis: 'القضيب', scapula: 'لوح الكتف', clavicle: 'الترقوة', sternum: 'القص',
  humerus: 'العضد', radius: 'الكعبرة', ulna: 'الزند', femur: 'الفخذ',
  tibia: 'الظنبوب', fibula: 'الشظية', patella: 'الرضفة', mandible: 'الفك السفلي',
  maxilla: 'الفك العلوي', atlas: 'الأطلس', axis: 'المحور', sacrum: 'العجز',
  coccyx: 'العصعص', diaphragm: 'الحجاب الحاجز', spleen_: 'الطحال',
  cuboid: 'العظم النردي', talus: 'الكاحل', calcaneus: 'العقب',
  epididymis: 'البربخ', urethra: 'الإحليل', gallbladder: 'المرارة',
}

// muscle proper names -> arabic phrase that FOLLOWS العضلة (feminine, definite);
// action participles composed separately so heads/parts/bellies work.
const MUSCLE = {
  deltoid: 'الدالية', trapezius: 'شبه المنحرفة', sartorius: 'الخياطية',
  gracilis: 'الرشيقة', soleus: 'النعلية', gastrocnemius: 'التوأمية الساقية',
  brachialis: 'العضدية', brachioradialis: 'العضدية الكعبرية',
  coracobrachialis: 'الغرابية العضدية', anconeus: 'المرفقية',
  pectineus: 'العانية المشطية', pyramidalis: 'الهرمية',
  iliacus: 'الحرقفية', iliopsoas: 'الحرقفية القطنية', piriformis: 'الكمثرية',
  popliteus: 'المأبضية', plantaris: 'الأخمصية', semitendinosus: 'نصف الوترية',
  semimembranosus: 'نصف الغشائية', subclavius: 'تحت الترقوية',
  subscapularis: 'تحت الشوكية الكتفية', supraspinatus: 'فوق الشوكة',
  infraspinatus: 'تحت الشوكة', supinator: 'المبطحة', masseter: 'الماضغة',
  temporalis: 'الصدغية', buccinator: 'البوقية', frontalis: 'الجبهية',
  occipitalis: 'القذالية', mentalis: 'الذقنية', nasalis: 'الأنفية',
  procerus: 'الهرمية الأنفية', risorius: 'الضاحكة', platysma: 'العريضة العنقية',
  genioglossus: 'الذقنية اللسانية', hyoglossus: 'اللامية اللسانية',
  styloglossus: 'الإبرية اللسانية', geniohyoid: 'الذقنية اللامية',
  mylohyoid: 'الفكية اللامية', stylohyoid: 'الإبرية اللامية',
  sternohyoid: 'القصية اللامية', omohyoid: 'الكتفية اللامية',
  thyrohyoid: 'الدرقية اللامية', sternothyroid: 'القصية الدرقية',
  cricothyroid: 'الحلقية الدرقية', stylopharyngeus: 'الإبرية البلعومية',
  palatopharyngeus: 'الحنكية البلعومية', salpingopharyngeus: 'البوقية البلعومية',
  temporoparietalis: 'الصدغية الجدارية', corrugator: 'المُقَطِّبة',
  subclavius_: 'تحت الترقوية', pectineus_: 'العانية',
  sternocleidomastoid: 'القصية الترقوية الخشائية',
  pronator: 'الكابّة', supinator_: 'المبطحة',
  quadriceps: 'رباعية الرؤوس الفخذية', triceps: 'ثلاثية الرؤوس',
  biceps: 'ذات الرأسين', digastric: 'ذات البطنين',
  coccygeus: 'العصعصية', iliococcygeus: 'الحرقفية العصعصية',
  pubococcygeus: 'العانية العصعصية', puborectalis: 'العانية المستقيمية',
  levator_ani: 'رافعة الشرج',
  scalenus: 'الأخمعية', scalene: 'الأخمعية',
  splenius: 'الشائكة', longissimus: 'الطولى', spinalis: 'الشوكية',
  iliocostalis: 'الحرقفية الضلعية', multifidus: 'المتعددة الفلقات',
  semispinalis: 'نصف الشوكية', rotatores: 'المدورات', interspinales: 'بين الشوكية',
  intertransversarii: 'بين المستعرضة', quadratus: 'المربعة',
  serratus: 'المسننة', rhomboid: 'المعينية', teres: 'المدورة',
  subscapularis_: 'تحت الكتفية', levator: 'الرافعة', depressor: 'الخافضة',
  tensor: 'الموترة', dilator: 'الموسعة', sphincter: 'العاصرة',
  obturator: 'السدادية', gemellus: 'التوأمية', vastus: 'المتّسعة',
  articularis: 'المفصلية', pectoralis: 'الصدرية', latissimus: 'الظهرية العريضة',
  psoas: 'القطنية', gluteus: 'الأليوية', adductor: 'المقربة', abductor: 'المبعدة',
  flexor: 'القابضة', extensor: 'الباسطة', fibularis: 'الشظوية', peroneus: 'الشظوية',
  tibialis: 'الظنبوبية', palmaris: 'الراحية', lumbrical: 'الدودية',
  opponens: 'المقابِلة', interossei: 'بين العظمية', interosseous: 'بين العظمية',
  transversus: 'المستعرضة', rectus: 'المستقيمة', obliquus: 'المائلة',
  zygomaticus: 'الوجنية', orbicularis: 'الدويرية', levatores: 'الرافعات',
  epicranius: 'فوق القحفية', occipitofrontalis: 'القذالية الجبهية',
  auricularis: 'الأذنية', stapedius: 'الركابية',
}

// action participles used with muscle "part/head of" and standalone
const MUSACTION = {
  flexor: 'القابضة', extensor: 'الباسطة', abductor: 'المبعدة', adductor: 'المقربة',
  levator: 'الرافعة', depressor: 'الخافضة', tensor: 'الموترة', pronator: 'الكابّة',
  supinator: 'المبطحة', rotator: 'المدورة', dilator: 'الموسعة', constrictor: 'العاصرة',
  opponens: 'المقابِلة', erector: 'الناصبة',
}

// standalone named single-word muscles matched by exact key (lower)
const MUSCLE_EXACT = {
  supinator: 'العضلة المبطحة', 'erector spinae': 'العضلة الناصبة للفقار',
  'levator ani': 'العضلة رافعة الشرج',
  'pronator teres': 'العضلة الكابّة المدورة', 'pronator quadratus': 'العضلة الكابّة المربعة',
  'palmaris longus': 'العضلة الراحية الطويلة', 'triceps surae': 'العضلة الساقية الثلاثية الرؤوس',
  'depressor labii inferioris': 'العضلة الخافضة للشفة السفلية',
  'levator labii superioris': 'العضلة الرافعة للشفة العليا',
  'depressor septi nasi': 'العضلة الخافضة لحاجز الأنف',
  'levator palpebrae superioris': 'العضلة الرافعة للجفن العلوي',
  'levator nasolabialis': 'العضلة الرافعة للأنف والشفة العليا',
  'depressor anguli oris': 'العضلة الخافضة لزاوية الفم',
  'levator anguli oris': 'العضلة الرافعة لزاوية الفم',
  'quadratus plantae': 'العضلة المربعة الأخمصية',
  'quadratus lumborum': 'العضلة المربعة القطنية',
  'quadratus femoris': 'العضلة المربعة الفخذية',
  'obturator internus': 'العضلة السدادية الباطنة', 'obturator externus': 'العضلة السدادية الظاهرة',
  'flexor digitorum profundus': 'العضلة القابضة العميقة للأصابع',
  'flexor digitorum superficialis': 'العضلة القابضة السطحية للأصابع',
  'extensor digitorum longus': 'العضلة الباسطة الطويلة للأصابع',
  'extensor digitorum brevis': 'العضلة الباسطة القصيرة للأصابع',
  'flexor hallucis longus': 'العضلة القابضة الطويلة لإبهام القدم',
  'flexor pollicis longus': 'العضلة القابضة الطويلة للإبهام',
  'extensor hallucis longus': 'العضلة الباسطة الطويلة لإبهام القدم',
  'extensor pollicis longus': 'العضلة الباسطة الطويلة للإبهام',
  'extensor pollicis brevis': 'العضلة الباسطة القصيرة للإبهام',
  'abductor pollicis longus': 'العضلة المبعدة الطويلة للإبهام',
}

// named bones (single word or exact)
const BONE_EXACT = {
  'hyoid bone': 'العظم اللامي', 'capitate bone': 'العظم الكبير', 'cuboid bone': 'العظم النردي',
  'hamate bone': 'العظم الكلابي', 'lunate bone': 'العظم الهلالي', 'scaphoid bone': 'العظم الزورقي',
  'pisiform bone': 'العظم الحمصي', 'triquetral bone': 'العظم الهرمي',
  'trapezium bone': 'عظم شبه المنحرف', 'trapezoid bone': 'العظم شبه المنحرف',
  'navicular bone': 'العظم الزورقي', 'lacrimal bone': 'العظم الدمعي',
  'nasal bone': 'العظم الأنفي', 'palatine bone': 'العظم الحنكي',
  'frontal bone': 'العظم الجبهي', 'parietal bone': 'العظم الجداري',
  'occipital bone': 'العظم القذالي', 'temporal bone': 'العظم الصدغي',
  'sphenoid bone': 'العظم الوتدي', 'ethmoid bone': 'العظم الغربالي',
  'zygomatic bone': 'العظم الوجني', 'vomer': 'الميكعة', 'mandible': 'الفك السفلي',
  'maxilla': 'الفك العلوي', 'incus': 'السندان', 'malleus': 'المطرقة', 'stapes': 'الركاب',
  'inferior nasal concha bone': 'العظم المحاري الأنفي السفلي',
  'medial cuneiform bone': 'العظم الإسفيني الإنسي', 'intermediate cuneiform bone': 'العظم الإسفيني المتوسط',
  'lateral cuneiform bone': 'العظم الإسفيني الوحشي',
  'arytenoid cartilage': 'الغضروف الطرجهالي', 'cricoid cartilage': 'الغضروف الحلقي',
  'thyroid cartilage': 'الغضروف الدرقي', 'corniculate cartilage': 'الغضروف القريني',
  'cuneiform cartilage': 'الغضروف الإسفيني', 'epiglottis': 'لسان المزمار',
}

// exact whole-key overrides for common irregular / important structures
const EXACT = {
  'erector spinae': 'العضلة الناصبة للفقار',
  'iliopsoas muscle': 'العضلة الحرقفية القطنية',
  'triceps surae muscle': 'العضلة الساقية الثلاثية الرؤوس',
  'nucleus pulposus': 'النواة اللبية',
  'annulus fibrosus': 'الحلقة الليفية',
  'medulla oblongata': 'النخاع المستطيل',
  'spinal cord': 'النخاع الشوكي',
  'corpus callosum': 'الجسم الثفني',
  'optic chiasm': 'التصالب البصري', 'optic chiasma': 'التصالب البصري',
  'pituitary gland': 'الغدة النخامية', 'pineal gland': 'الغدة الصنوبرية',
  'thyroid gland': 'الغدة الدرقية', 'adrenal gland': 'الغدة الكظرية',
  'suprarenal gland': 'الغدة الكظرية',
  'bile duct': 'القناة الصفراوية', 'common bile duct': 'القناة الصفراوية المشتركة',
  'cystic duct': 'القناة المرارية', 'common hepatic duct': 'القناة الكبدية المشتركة',
  'pancreatic duct': 'القناة البنكرياسية', 'thoracic duct': 'القناة الصدرية',
  'adenohypophysis': 'الغُدّية النخامية', 'neurohypophysis': 'العصبية النخامية',
  'ascending colon': 'القولون الصاعد', 'descending colon': 'القولون النازل',
  'transverse colon': 'القولون المستعرض', 'sigmoid colon': 'القولون السيني',
  'greater omentum': 'الثرب الأكبر', 'lesser omentum': 'الثرب الأصغر',
}

// Latin adjective variants + size words shared across heads
Object.assign(DIR, {
  lateralis: ['الوحشي', 'الوحشية'], medialis: ['الإنسي', 'الإنسية'],
  intermedius: ['المتوسط', 'المتوسطة'], maximus: ['الأكبر', 'الكبيرة'],
  medius: ['الأوسط', 'المتوسطة'], minimus: ['الأصغر', 'الصغيرة'],
  magnus: ['الكبير', 'الكبيرة'], profundus: ['العميق', 'العميقة'],
  superficialis: ['السطحي', 'السطحية'], superioris: ['العلوي', 'العلوية'],
  inferioris: ['السفلي', 'السفلية'], anticus: ['الأمامي', 'الأمامية'],
  gray: ['الرمادي', 'الرمادية'], grey: ['الرمادي', 'الرمادية'], white: ['الأبيض', 'البيضاء'],
  fibrosus: ['الليفي', 'الليفية'], pulposus: ['اللبي', 'اللبية'],
})
Object.assign(RADJ, {
  intervertebral: ['بين الفقري', 'بين الفقرية'], clinoid: ['السريري', 'السريرية'],
  ulnaris: ['الزندي', 'الزندية'], radialis: ['الكعبري', 'الكعبرية'],
  radiate: ['الشعاعي', 'الشعاعية'], cruciate: ['المتصالب', 'المتصالبة'],
  collateral: ['الجانبي', 'الجانبية'], annular: ['الحلقي', 'الحلقية'],
  falciform: ['المنجلي', 'المنجلية'], coronary_lig: ['التاجي', 'التاجية'],
  round: ['المدور', 'المدورة'], broad: ['العريض', 'العريضة'],
  nuchal: ['القفوي', 'القفوية'], stylohyoid: ['الإبري اللامي', 'الإبرية اللامية'],
  stylomandibular: ['الإبري الفكي', 'الإبرية الفكية'],
  sphenomandibular: ['الوتدي الفكي', 'الوتدية الفكية'],
  pterygospinous: ['الجناحي الشوكي', 'الجناحية الشوكية'],
  // reproductive / pelvic
  testicular: ['الخصوي', 'الخصوية'], ovarian: ['المبيضي', 'المبيضية'],
  uterine: ['الرحمي', 'الرحمية'], vaginal: ['المهبلي', 'المهبلية'],
  vesical: ['المثاني', 'المثانية'], prostatic: ['البروستاتي', 'البروستاتية'],
  penile: ['القضيبي', 'القضيبية'], scrotal: ['الصفني', 'الصفنية'],
  mammary: ['الثديي', 'الثديية'], anal: ['الشرجي', 'الشرجية'],
  seminal: ['المنوي', 'المنوية'], deferential: ['الناقلي', 'الناقلية'],
  cremasteric: ['المشمري', 'المشمرية'], pudendal: ['الفرجي', 'الفرجية'],
  // extra vessel / nerve adjectives
  circumflex: ['المحيطي', 'المحيطية'], alveolar: ['السنخي', 'السنخية'],
  tonsillar: ['اللوزي', 'اللوزية'], pericardial: ['التاموري', 'التامورية'],
  pterygoid: ['الجناحي', 'الجناحية'], masseteric: ['الماضغي', 'الماضغية'],
  genicular: ['الركبي', 'الركبية'], sural: ['الربلي', 'الربلية'],
  saphenous: ['الصافن', 'الصافنة'], dorsalis: ['الظهري', 'الظهرية'],
  retinal: ['الشبكي', 'الشبكية'], palpebral: ['الجفني', 'الجفنية'],
  ciliary: ['الهدبي', 'الهدبية'], dental: ['السني', 'السنية'],
  gingival: ['اللثوي', 'اللثوية'], nasopalatine: ['الأنفي الحنكي', 'الأنفية الحنكية'],
  sphenopalatine: ['الوتدي الحنكي', 'الوتدية الحنكية'],
  vertebral_a: ['الفقري', 'الفقرية'], recurrent: ['الراجع', 'الراجعة'],
  perforating: ['النافذ', 'النافذة'], communicating: ['الموصل', 'الموصلة'],
  digital_a: ['الإصبعي', 'الإصبعية'], metacarpal_a: ['السنعي', 'السنعية'],
  cystic: ['المراري', 'المرارية'], appendicular: ['الزائدي', 'الزائدية'],
  ileocolic: ['اللفائفي القولوني', 'اللفائفية القولونية'],
  gastroduodenal: ['المعدي الاثناعشري', 'المعدية الاثناعشرية'],
  gastroepiploic: ['المعدي الثربي', 'المعدية الثربية'],
  gastro_omental: ['المعدي الثربي', 'المعدية الثربية'],
  // cranial-nerve names (head = العصب)
  abducens: ['المبعد', 'المبعدة'], oculomotor: ['المحرك للعين', 'المحركة للعين'],
  trochlear: ['البكري', 'البكرية'], trigeminal: ['ثلاثي التوائم', 'ثلاثية التوائم'],
  vagus: ['المبهم', 'المبهمة'], vestibulocochlear: ['الدهليزي القوقعي', 'الدهليزية القوقعية'],
  glossopharyngeal: ['اللساني البلعومي', 'اللسانية البلعومية'],
  // brain / tracts / gyri
  corticospinal: ['القشري النخاعي', 'القشرية النخاعية'],
  spinothalamic: ['الشوكي المهادي', 'الشوكية المهادية'],
  corticonuclear: ['القشري النووي', 'القشرية النووية'],
  spinocerebellar: ['الشوكي المخيخي', 'الشوكية المخيخية'],
  reticulospinal: ['الشبكي النخاعي', 'الشبكية النخاعية'],
  rubrospinal: ['الأحمر النخاعي', 'الحمراء النخاعية'],
  precentral: ['أمام المركزي', 'أمام المركزية'], postcentral: ['خلف المركزي', 'خلف المركزية'],
  central: ['المركزي', 'المركزية'], cingulate: ['الحزامي', 'الحزامية'],
  fusiform: ['المغزلي', 'المغزلية'], supramarginal: ['فوق الحافي', 'فوق الحافية'],
  parahippocampal: ['حول الحصيني', 'حول الحصينية'], hippocampal: ['الحصيني', 'الحصينية'],
  calcarine: ['المهمازي', 'المهمازية'], collateral_s: ['الجانبي', 'الجانبية'],
  parieto_occipital: ['الجداري القذالي', 'الجدارية القذالية'],
  temporooccipital: ['الصدغي القذالي', 'الصدغية القذالية'],
  dentate: ['المسنن', 'المسننة'], caudate: ['المذنب', 'المذنبة'],
  lentiform: ['العدسي', 'العدسية'], subthalamic: ['تحت المهادي', 'تحت المهادية'],
  geniculate: ['الركبي', 'الركبية'], mammillary: ['الحلمي', 'الحلمية'],
  olivary: ['الزيتوني', 'الزيتونية'], cuneate: ['الإسفيني', 'الإسفينية'],
  gracile: ['الرشيق', 'الرشيقة'], solitary: ['المنفرد', 'المنفردة'],
  ambiguus: ['المبهم الشكل', 'المبهمة الشكل'], vestibular: ['الدهليزي', 'الدهليزية'],
  cochlear: ['القوقعي', 'القوقعية'], salivary: ['اللعابي', 'اللعابية'],
  // bronchopulmonary segments
  segmental: ['القطعي', 'القطعية'], lobar: ['الفصي', 'الفصية'],
  apicoposterior: ['القمي الخلفي', 'القمية الخلفية'],
  anteromedial: ['الأمامي الإنسي', 'الأمامية الإنسية'],
  anterolateral: ['الأمامي الوحشي', 'الأمامية الوحشية'],
  posterolateral: ['الخلفي الوحشي', 'الخلفية الوحشية'],
  posteromedial: ['الخلفي الإنسي', 'الخلفية الإنسية'],
  posterobasal: ['القاعدي الخلفي', 'القاعدية الخلفية'],
  anterobasal: ['القاعدي الأمامي', 'القاعدية الأمامية'],
  mediobasal: ['القاعدي الإنسي', 'القاعدية الإنسية'],
  laterobasal: ['القاعدي الوحشي', 'القاعدية الوحشية'],
  // lymph-node adjectives
  coeliac: ['الزلاقي', 'الزلاقية'], celiac: ['الزلاقي', 'الزلاقية'],
  cubital: ['المرفقي', 'المرفقية'], diaphragmatic: ['الحجابي', 'الحجابية'],
  tracheobronchial: ['الرغامي القصبي', 'الرغامية القصبية'],
  paratracheal: ['حول الرغامي', 'حول الرغامية'], pyloric: ['البوابي', 'البوابية'],
  retropyloric: ['خلف البوابي', 'خلف البوابية'], subpyloric: ['تحت البوابي', 'تحت البوابية'],
  suprapyloric: ['فوق البوابي', 'فوق البوابية'], lacunar: ['الثغري', 'الثغرية'],
  parotid: ['النكفي', 'النكفية'], brachiocephalic: ['الرأسي العضدي', 'الرأسية العضدية'],
  buccinator: ['البوقي', 'البوقية'], retroauricular: ['خلف الأذني', 'خلف الأذنية'],
  submandibular_n: ['تحت الفكي', 'تحت الفكية'], preauricular: ['أمام الأذني', 'أمام الأذنية'],
  hepatic_n: ['الكبدي', 'الكبدية'], pancreatic_n: ['البنكرياسي', 'البنكرياسية'],
  splenic_n: ['الطحالي', 'الطحالية'], gastric_n: ['المعدي', 'المعدية'],
  // region adjectives
  deltoid: ['الدالي', 'الدالية'], deltopectoral: ['الدالي الصدري', 'الدالية الصدرية'],
  bicipital: ['العضدي', 'العضدية'], supraclavicular: ['فوق الترقوي', 'فوق الترقوية'],
  infraclavicular: ['تحت الترقوي', 'تحت الترقوية'], sternocleidomastoid_r: ['القصي الترقوي الخشائي', 'القصية الترقوية الخشائية'],
  scapular_r: ['الكتفي', 'الكتفية'], vertebral_r: ['الفقري', 'الفقرية'],
  cubital_r: ['المرفقي', 'المرفقية'], crural: ['الساقي', 'الساقية'],
  sural: ['الربلي', 'الربلية'], calcanean: ['العقبي', 'العقبية'],
  oblongata: ['المستطيل', 'المستطيلة'], subtendinous: ['تحت الوتري', 'تحت الوترية'],
  intermuscular: ['بين العضلي', 'بين العضلية'], intercondylar: ['بين اللقمي', 'بين اللقمية'],
  intrarenal: ['داخل الكلوي', 'داخل الكلوية'], interspinous: ['بين الشوكي', 'بين الشوكية'],
  meniscotibial: ['الهلالي الظنبوبي', 'الهلالية الظنبوبية'],
  meniscofemoral: ['الهلالي الفخذي', 'الهلالية الفخذية'],
  supraspinous: ['فوق الشوكي', 'فوق الشوكية'], infraspinous: ['تحت الشوكي', 'تحت الشوكية'],
  interclavicular: ['بين الترقوي', 'بين الترقوية'], intra_articular: ['داخل المفصلي', 'داخل المفصلية'],
  arcuate: ['المقوس', 'المقوسة'], pectineal: ['العاني', 'العانية'],
  spiral: ['الحلزوني', 'الحلزونية'], oval: ['البيضوي', 'البيضوية'],
  telencephalic: ['الانتهائي', 'الانتهائية'], diencephalic: ['البيني', 'البينية'],
  molar: ['الطاحن', 'الطاحنة'], premolar: ['الضاحك', 'الضاحكة'],
  incisor: ['القاطع', 'القاطعة'], canine: ['النابي', 'النابية'],
})
// participle adjectives (m,f) for non-muscle heads (retinaculum/sheath/groove…)
const ADJ = {
  flexor: ['القابض', 'القابضة'], extensor: ['الباسط', 'الباسطة'],
  abductor: ['المبعد', 'المبعدة'], adductor: ['المقرب', 'المقربة'],
  levator: ['الرافع', 'الرافعة'], depressor: ['الخافض', 'الخافضة'],
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
function clean(s) {
  s = s.trim()
  if (/^\(.*\)$/.test(s)) s = s.slice(1, -1).trim() // unwrap fully-parenthesized key
  s = s.replace(/\([^)]*\)/g, ' ')                  // drop annotations e.g. (BVIII), (XI)
  return s.replace(/\s+/g, ' ').trim()
}
// join hyphenated compounds (sacro-iliac -> sacroiliac, crico-arytenoid -> …)
const words = (s) => clean(s).toLowerCase().replace(/[()]/g, ' ').replace(/[-–]/g, '').replace(/,/g, ' ').split(/\s+/).filter(Boolean)

function looksMuscle(toks) {
  if (toks.includes('muscle') || toks.includes('muscles')) return true
  for (const t of toks) if (MUSCLE[t] || MUSACTION[t]) return true
  return false
}

// compose a segment (already split on "of"/"for") into an arabic NP; return
// {ar, g} or null if any content word is unknown.
function composeSegment(toks) {
  // find head noun (prefer an explicit type/part noun; last match wins for
  // compound heads like "articular surface")
  let headIdx = -1, plural = false, headKey = null
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i]
    if (PLURALS[w]) { headIdx = i; headKey = PLURALS[w]; plural = true }
    else if (NOUN[w]) { headIdx = i; headKey = w; plural = false }
  }
  if (headIdx < 0) return null
  const head = NOUN[headKey]
  if (!head) return null
  const g = head[1]
  const headAr = plural ? (head[2] || head[0]) : head[0]

  // remaining tokens -> adjectives (region first, then directional)
  const radj = [], dir = [], owners = []
  // inanimate plural nouns take feminine-singular adjective agreement
  const gi = (g === 'f' || plural) ? 1 : 0
  for (let i = 0; i < toks.length; i++) {
    if (i === headIdx) continue
    const w = toks[i]
    if (w === 'the' || w === 'lymph') continue // "lymph node" -> node already means it
    if (w === 'of' || w === 'for' || w === 'and' || w === 'to') return null // handled upstream
    if (RADJ[w]) radj.push(RADJ[w][gi])
    else if (ADJ[w]) radj.push(ADJ[w][gi])
    else if (DIR[w]) dir.push(DIR[w][gi])
    else if (LATGEN[w] && LATGEN[w].adj) radj.push(LATGEN[w].adj[gi])
    else if (OWNER[w]) owners.push(OWNER[w])
    else return null // unknown content word -> bail (stay English)
  }
  if (owners.length) {
    // body-part idafa e.g. "elbow joint" -> مفصل المرفق (only when unmodified)
    if (owners.length === 1 && !radj.length && !dir.length) {
      return { ar: `${headAr.replace(/^ال/, '')} ${owners[0]}`, g, bare: false }
    }
    return null // ambiguous owner+adjective mix inside one segment
  }
  const ar = [headAr, ...radj, ...dir].join(' ')
  return { ar, g, bare: radj.length === 0 && dir.length === 0 }
}

// muscle composer
function composeMuscle(raw, toks) {
  const key = clean(raw).toLowerCase()
  if (MUSCLE_EXACT[key]) return MUSCLE_EXACT[key]
  // strip trailing 'muscle'/'muscles'
  const plural = toks.includes('muscles')
  const t = toks.filter((w) => w !== 'muscle' && w !== 'muscles')
  const headWord = plural ? 'العضلات' : 'العضلة'
  const adjs = []        // feminine adjective phrases after العضلة
  const li = []          // idafa "of X" phrases
  let known = true
  for (let i = 0; i < t.length; i++) {
    const w = t[i]
    if (MUSACTION[w]) adjs.unshift(MUSACTION[w]) // action participle leads
    else if (MUSCLE[w]) adjs.push(MUSCLE[w])
    else if (DIR[w]) adjs.push(DIR[w][1])
    else if (RADJ[w]) adjs.push(RADJ[w][1])
    else if (LATGEN[w]) { const g = LATGEN[w]; if (g.adj) adjs.push(g.adj[1]); else if (g.li) li.push(LI(g.li)) }
    else if (OWNER[w]) li.push(LI(OWNER[w]))
    else if (w === 'of' || w === 'for' || w === 'the' || w === 'to') continue
    else { known = false; break }
  }
  if (!known || adjs.length === 0) return null
  const liJoined = li.join(' ')
  return [headWord, ...adjs, liJoined].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

// attach the genitive lām: ل + owner, assimilating ل+ال -> لل
function LI(x) {
  return x.startsWith('ال') ? 'لل' + x.slice(2) : 'ل' + x
}
function linkOwner(_mainG, ownerAr) { return LI(ownerAr) }

// feminine owner nouns (for adjective agreement in "of left lung" etc.)
const OWNER_F = new Set(['hand', 'foot', 'leg', 'knee', 'lung', 'kidney', 'stomach',
  'bladder', 'clavicle', 'fibula', 'patella', 'ear', 'eye'])

function bareOwner(ownerToks) {
  const on = ownerToks[ownerToks.length - 1]
  if (!OWNER[on]) return null
  const g = OWNER_F.has(on) ? 1 : 0
  const pre = []
  for (const w of ownerToks.slice(0, -1)) {
    if (DIR[w]) pre.push(DIR[w][g])
    else if (RADJ[w]) pre.push(RADJ[w][g])
    else if (ADJ[w]) pre.push(ADJ[w][g])
    else return null
  }
  return [OWNER[on], ...pre].join(' ')
}

function compose(raw) {
  const key = clean(raw)
  const low = key.toLowerCase()
  if (EXACT[low]) return EXACT[low]
  if (BONE_EXACT[low]) return BONE_EXACT[low]
  if (MUSCLE_EXACT[low]) return MUSCLE_EXACT[low]
  // disc levels keep their standard notation (C2-C3, T1-T2 …)
  if (low.startsWith('intervertebral disc')) return ('القرص الفقري ' + key.replace(/^intervertebral disc\s*/i, '')).trim()
  if (low.startsWith('nucleus pulposus')) return ('النواة اللبية ' + key.replace(/^nucleus pulposus\s*/i, '')).trim()
  const toks = words(key)
  if (!toks.length) return null

  // split on the first " of " / " for " / " to " into main + owner
  let splitIdx = -1
  for (let i = 1; i < toks.length; i++) {
    const w = toks[i]
    if (w === 'of' || w === 'for' || w === 'to') { splitIdx = i; break }
  }
  if (splitIdx > 0) {
    const mainToks = toks.slice(0, splitIdx)
    const ownerToks = toks.slice(splitIdx + 1)
    const main = composeSegment(mainToks) // "head/belly/part/bursa/... of X"
    if (main) {
      let ownerAr = null
      if (looksMuscle(ownerToks)) ownerAr = composeMuscle(ownerToks.join(' '), ownerToks)
      if (!ownerAr) { const seg = composeSegment(ownerToks); if (seg) ownerAr = seg.ar }
      if (!ownerAr) ownerAr = bareOwner(ownerToks)
      if (!ownerAr && ownerToks.includes('of')) ownerAr = compose(ownerToks.join(' ')) // nested "of"
      if (ownerAr) {
        if (main.bare) return `${main.ar.replace(/^ال/, '')} ${ownerAr}`.replace(/\s+/g, ' ').trim()
        return `${main.ar} ${linkOwner(main.g, ownerAr)}`.replace(/\s+/g, ' ').trim()
      }
    }
    // main isn't a clean structure noun -> maybe the whole key is a located muscle
    if (looksMuscle(toks)) { const m = composeMuscle(key, toks); if (m) return m }
    return null
  }

  // no split: muscle first, else a single segment
  if (looksMuscle(toks)) { const m = composeMuscle(key, toks); if (m) return m }
  const seg = composeSegment(toks)
  return seg ? seg.ar : null
}

// ---------------------------------------------------------------------------
// Run over every manifest key
// ---------------------------------------------------------------------------
const out = {}
let total = 0, done = 0
const samples = []
const uniqueKeys = new Set()
for (const sys of Object.keys(manifest)) for (const s of manifest[sys]) uniqueKeys.add(s.k)
for (const k of uniqueKeys) {
  total++
  if (curated[k]) { done++; continue } // curated wins; don't duplicate
  const ar = compose(k)
  if (ar) { out[k] = ar; done++; if (samples.length < 50 && Math.random === Math.random) samples.push([k, ar]) }
}

fs.writeFileSync(new URL('terms_auto.json', D), JSON.stringify(out))
console.log(`unique keys: ${total}`)
console.log(`auto-composed: ${Object.keys(out).length}`)
console.log(`total with arabic (auto+curated): ${done} (${(100 * done / total).toFixed(1)}%)`)
