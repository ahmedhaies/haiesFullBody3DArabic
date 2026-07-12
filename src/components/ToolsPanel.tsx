import { useStore } from '../store/useStore'
import { t } from '../i18n/strings'
import type { Axis } from '../three/clip'

export default function ToolsPanel() {
  const lang = useStore((s) => s.lang)
  const clip = useStore((s) => s.clip)
  const setClip = useStore((s) => s.setClip)
  const fadeOthers = useStore((s) => s.fadeOthers)
  const setFadeOthers = useStore((s) => s.setFadeOthers)
  const isolate = useStore((s) => s.isolateStructure)
  const setIsolate = useStore((s) => s.setIsolateStructure)
  const showFeatures = useStore((s) => s.showFeatures)
  const setShowFeatures = useStore((s) => s.setShowFeatures)
  const autoRotate = useStore((s) => s.autoRotate)
  const setAutoRotate = useStore((s) => s.setAutoRotate)

  const axes: { id: Axis; ar: string; en: string }[] = [
    { id: 'x', ar: t('planeSagittal', 'ar'), en: t('planeSagittal', 'en') },
    { id: 'y', ar: t('planeAxial', 'ar'), en: t('planeAxial', 'en') },
    { id: 'z', ar: t('planeCoronal', 'ar'), en: t('planeCoronal', 'en') },
  ]

  return (
    <div className="panel-body tools">
      <section className="tool-group">
        <div className="tool-row">
          <label className="switch">
            <input type="checkbox" checked={clip.enabled} onChange={(e) => setClip({ enabled: e.target.checked })} />
            <span>{t('crossSection', lang)}</span>
          </label>
        </div>
        {clip.enabled && (
          <>
            <div className="seg">
              {axes.map((a) => (
                <button key={a.id} className={'seg-btn' + (clip.axis === a.id ? ' on' : '')} onClick={() => setClip({ axis: a.id })}>
                  {lang === 'ar' ? a.ar : a.en}
                </button>
              ))}
            </div>
            <input className="slider" type="range" min={-1} max={1} step={0.01} value={clip.value} onChange={(e) => setClip({ value: parseFloat(e.target.value) })} />
            <button className="btn btn-sm" onClick={() => setClip({ flip: !clip.flip })}>⇄ {t('flip', lang)}</button>
          </>
        )}
      </section>

      <section className="tool-group">
        <label className="switch">
          <input type="checkbox" checked={fadeOthers} onChange={(e) => setFadeOthers(e.target.checked)} />
          <span>{t('transparency', lang)}</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={isolate} onChange={(e) => setIsolate(e.target.checked)} />
          <span>{t('hideOthers', lang)}</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={showFeatures} onChange={(e) => setShowFeatures(e.target.checked)} />
          <span>{t('showLandmarks', lang)}</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
          <span>{t('autoRotate', lang)}</span>
        </label>
      </section>
    </div>
  )
}
