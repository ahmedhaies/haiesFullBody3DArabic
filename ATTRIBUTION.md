# Attribution & Licensing

## 3D anatomical models — CC BY-SA 4.0

The GLB models in `public/models/` are derived from the **Z-Anatomy** project
(<https://www.z-anatomy.com/>, repository <https://github.com/LluisV/Z-Anatomy>), which is
itself based on **BodyParts3D** by the Database Center for Life Science (DBCLS),
<https://lifesciencedb.jp/bp3d/>.

The original FBX models were converted to glTF, geometry-simplified and Draco-compressed for
the web. No anatomical geometry was authored from scratch. These derived model files are
distributed under the **Creative Commons Attribution-ShareAlike 4.0 International License
(CC BY-SA 4.0)** — <https://creativecommons.org/licenses/by-sa/4.0/> — the same license as
the source.

- Z-Anatomy — © Lluís Vinent Juanico and contributors — CC BY-SA 4.0
- BodyParts3D — © The Database Center for Life Science — CC BY-SA 2.1 Japan

## English descriptions — CC BY-SA

The English structure descriptions in `public/data/descriptions_en.json` originate from
Z-Anatomy's description set (sourced from Wikipedia), licensed **CC BY-SA**.

## Arabic terminology

The Arabic anatomical names and descriptions were curated for this project following
standard Arabic anatomical nomenclature (Unified Medical Dictionary / Terminologia
Anatomica conventions), combined with a grammar-aware transliteration/composition step.

## Application source code — MIT License

All application source code (everything under `src/`, build scripts, and configuration) is
released under the MIT License:

```
MIT License

Copyright (c) 2026 haies

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
