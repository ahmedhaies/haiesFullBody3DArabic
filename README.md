# أطلس التشريح ثلاثي الأبعاد · 3D Human Anatomy Atlas

<div dir="rtl">

نظام تفاعلي متكامل لاستكشاف تشريح جسم الإنسان بالكامل ثلاثي الأبعاد، بمسميات دقيقة
**بالعربية والإنجليزية** (مع اللاتينية لأهم التراكيب). يعمل بسهولة على **الموبايل والكمبيوتر**.

## المميزات

- 🔎 **بحث فوري** بالعربي أو الإنجليزي عن أي عضو أو عظم أو عضلة أو شريان… ويُعلّم عليه ويركّز الكاميرا.
- 👆 **اضغط على أي جزء** ليظهر اسمه بالعربي والإنجليزي واللاتيني مع نبذة.
- 🧩 **٩ أجهزة**: الهيكلي، المفاصل، العضلي، القلبي الوعائي، الأحشاء، العصبي، اللمفاوي، المناطق، والمستويات المرجعية — تُشغّل وتُخفى بضغطة.
- ✂️ **مقاطع عرضية** (سهمي/إكليلي/محوري) وإخفاء الطبقات وإبراز التركيب.
- 🎓 **جولات إرشادية** لكل جهاز تحرّك الكاميرا وتشرح التراكيب بالترتيب.
- ⭐ **مفضلة وملاحظات** تُحفظ في المتصفح.
- 📱 تحكّم باللمس (الموبايل) والماوس (الكمبيوتر)، وواجهة عربية RTL كاملة.

أكثر من **٣٠٠٠ تركيب تشريحي** قابل للتحديد.

</div>

## Overview (English)

An interactive, bilingual (Arabic/English) 3D atlas of the whole human body. Search any
structure in Arabic or English, tap any part to reveal its names and description, toggle
9 body systems, cut cross-sections, take guided tours, and save favorites/notes. Works on
mobile and desktop with full RTL support. 3000+ selectable anatomical structures.

## Run locally

```bash
npm install
npm run dev        # development
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Deploy

Pushing to the development branch (or `main`) triggers **GitHub Actions** to build and
publish to **GitHub Pages** (`.github/workflows/deploy.yml`). Enable Pages → *Source: GitHub
Actions* in the repository settings. The site is served under `/haiesFullBody3DArabic/`
(configurable via the `VITE_BASE` env var).

## Data pipeline

The 3D models are produced from the open-source Z-Anatomy FBX files:

1. Convert `FBX → glTF` (FBX2glTF), preserving every named structure.
2. Optimize node-preservingly: `prune → dedup → weld → simplify → Draco` (`gltf-transform`).
3. Extract a manifest of ~3000 structures grouped by anatomical name (merging left/right).
4. Generate bilingual terminology: a curated dictionary for major structures plus a
   grammar-aware Arabic composer (gender agreement, iḍāfa, laterality) for the rest.

## Credits & License

- **3D models:** [Z-Anatomy](https://www.z-anatomy.com/) (based on
  [BodyParts3D](https://lifesciencedb.jp/bp3d/), DBCLS) — **CC BY-SA 4.0**.
- **English descriptions:** Wikipedia — **CC BY-SA**.
- **Arabic terminology:** curated per standard Arabic anatomical nomenclature.

Because the models are CC BY-SA 4.0, the anatomical assets in this repository are
distributed under the **same license**. Application source code is released under the
**MIT License**. See [`ATTRIBUTION.md`](./ATTRIBUTION.md).
