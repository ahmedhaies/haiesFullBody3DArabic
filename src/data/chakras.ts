// Chakra (energy-center) overlay data. Positions are expressed as fractions of
// the measured body height/depth relative to the model's bounding-box centre,
// so they scale to whatever the loaded model's units are. Directions decide
// which way the cone/vortex opens: front (+Z), back (−Z), up (+Y), down (−Y).
// Front chakras also carry a small ±X for laterally-placed centres (spleen).

export type ChakraDir = 'front' | 'back' | 'up' | 'down'

export interface Chakra {
  id: string          // structure id: chakras#<key>
  ar: string          // Arabic name
  en: string          // English name
  sanskrit: string    // traditional name (shown in the "Latin" slot)
  color: string       // vortex colour
  dir: ChakraDir
  x: number           // lateral offset (fraction of body height, +X = model's left)
  y: number           // vertical offset from bbox centre (fraction of body height)
  size: number        // relative cone size
  descAr: string
}

// y = 0 is the bounding-box centre (≈ pelvis/navel); +y toward the head.
export const CHAKRAS: Chakra[] = [
  {
    id: 'chakras#crown', ar: 'شاكرا التاج', en: 'Crown chakra', sanskrit: 'Sahasrara',
    color: '#b98cf0', dir: 'up', x: 0, y: 0.452, size: 1.0,
    descAr: 'المركز السابع أعلى الرأس، يرتبط بالوعي الأعلى والاتصال الروحي والإدراك الكوني، ولونه بنفسجي/أبيض.',
  },
  {
    id: 'chakras#ajna', ar: 'شاكرا الآجنا (العين الثالثة)', en: 'Ajna (third-eye) chakra', sanskrit: 'Ajna',
    color: '#6a63e0', dir: 'front', x: 0, y: 0.405, size: 0.9,
    descAr: 'المركز السادس بين الحاجبين (العين الثالثة)، يرتبط بالحدس والبصيرة والتخيّل، ولونه نيلي.',
  },
  {
    id: 'chakras#throat', ar: 'شاكرا الحلق', en: 'Throat chakra', sanskrit: 'Vishuddha',
    color: '#33a6e6', dir: 'front', x: 0, y: 0.33, size: 0.95,
    descAr: 'المركز الخامس عند الحلق، يرتبط بالتعبير والتواصل والصدق، ولونه أزرق.',
  },
  {
    id: 'chakras#heart_front', ar: 'شاكرا القلب (الأمامية)', en: 'Heart chakra (front)', sanskrit: 'Anahata',
    color: '#43d98a', dir: 'front', x: 0, y: 0.225, size: 1.0,
    descAr: 'المركز الرابع في وسط الصدر، وجهه الأمامي يرتبط بالحب والرحمة والعاطفة، ولونه أخضر.',
  },
  {
    id: 'chakras#heart_back', ar: 'شاكرا القلب (الخلفية)', en: 'Heart chakra (back)', sanskrit: 'Anahata (rear)',
    color: '#43d98a', dir: 'back', x: 0, y: 0.225, size: 0.85,
    descAr: 'الوجه الخلفي لشاكرا القلب بين لوحي الكتف، يرتبط بالإرادة تجاه المحيط والذات.',
  },
  {
    id: 'chakras#solar_front', ar: 'شاكرا الضفيرة الشمسية (الأمامية)', en: 'Solar plexus chakra (front)', sanskrit: 'Manipura',
    color: '#f2cf3b', dir: 'front', x: 0, y: 0.115, size: 1.0,
    descAr: 'المركز الثالث أعلى البطن، وجهه الأمامي يرتبط بالمشاعر والحياة العاطفية، ولونه أصفر.',
  },
  {
    id: 'chakras#solar_back', ar: 'شاكرا الضفيرة الشمسية (الخلفية)', en: 'Solar plexus chakra (back)', sanskrit: 'Manipura (rear)',
    color: '#f2cf3b', dir: 'back', x: 0, y: 0.115, size: 0.85,
    descAr: 'الوجه الخلفي لشاكرا الضفيرة الشمسية، يرتبط بالإرادة والقوة الشخصية والصحة الجسدية.',
  },
  {
    id: 'chakras#spleen_front', ar: 'شاكرا الطحال (الأمامية)', en: 'Spleen chakra (front)', sanskrit: 'Spleen center',
    color: '#f0a83c', dir: 'front', x: 0.085, y: 0.075, size: 0.8,
    descAr: 'مركز على الجانب الأيسر تحت الأضلاع، يرتبط بامتصاص وتوزيع الطاقة الحيوية (البرانا).',
  },
  {
    id: 'chakras#spleen_back', ar: 'شاكرا الطحال (الخلفية)', en: 'Spleen chakra (back)', sanskrit: 'Spleen center (rear)',
    color: '#f0a83c', dir: 'back', x: 0.085, y: 0.075, size: 0.72,
    descAr: 'الوجه الخلفي لمركز الطحال، يكمّل استقبال الطاقة الحيوية على الجانب الأيسر.',
  },
  {
    id: 'chakras#navel', ar: 'شاكرا السرة', en: 'Navel chakra', sanskrit: 'Nabhi',
    color: '#f0912f', dir: 'front', x: 0, y: 0.02, size: 0.9,
    descAr: 'مركز عند السرّة يرتبط بالحيوية وتوزيع طاقة الجسم وتخزينها.',
  },
  {
    id: 'chakras#mingmen', ar: 'شاكرا المينج مين (بوابة الحياة)', en: 'Ming Men chakra (Gate of Life)', sanskrit: 'Ming Men',
    color: '#e0603a', dir: 'back', x: 0, y: 0.0, size: 0.9,
    descAr: '«بوابة الحياة» في أسفل الظهر بين الكليتين، مصدر الطاقة الحيوية الأصلية (تشي) في الطب الصيني.',
  },
  {
    id: 'chakras#sex', ar: 'شاكرا الجنس', en: 'Sacral (sex) chakra', sanskrit: 'Svadhisthana',
    color: '#f2793b', dir: 'front', x: 0, y: -0.075, size: 0.95,
    descAr: 'المركز الثاني في منطقة العانة، يرتبط بالطاقة الجنسية والإبداع والمتعة، ولونه برتقالي.',
  },
  {
    id: 'chakras#root', ar: 'شاكرا القاعدة (الجذر)', en: 'Root (base) chakra', sanskrit: 'Muladhara',
    color: '#e2433a', dir: 'down', x: 0, y: -0.16, size: 1.05,
    descAr: 'المركز الأول عند قاعدة العمود الفقري، يرتبط بالأمان والبقاء والتجذّر بالأرض، ولونه أحمر.',
  },
]
