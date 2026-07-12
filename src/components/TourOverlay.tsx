import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { TOURS, resolveStep } from '../data/tours'
import { t } from '../i18n/strings'

export default function TourOverlay() {
  const lang = useStore((s) => s.lang)
  const activeTour = useStore((s) => s.activeTour)
  const tourStep = useStore((s) => s.tourStep)
  const tourGoto = useStore((s) => s.tourGoto)
  const endTour = useStore((s) => s.endTour)
  const select = useStore((s) => s.select)
  const setSystemVisible = useStore((s) => s.setSystemVisible)

  const tour = TOURS.find((x) => x.id === activeTour) || null
  const step = tour ? tour.steps[tourStep] : null

  // when the step changes, reveal its system and select+focus its structure
  useEffect(() => {
    if (!tour || !step) return
    setSystemVisible(step.system, true)
    const id = resolveStep(step)
    if (id) {
      // small delay so a just-revealed system has its meshes registered
      const to = setTimeout(() => select(id), id ? 60 : 0)
      return () => clearTimeout(to)
    }
  }, [activeTour, tourStep])

  if (!tour || !step) return null
  const last = tourStep >= tour.steps.length - 1
  const first = tourStep <= 0

  return (
    <div className="tour-overlay">
      <div className="tour-panel">
        <div className="tour-panel-head">
          <span className="tour-badge">{tour.icon} {lang === 'ar' ? tour.ar : tour.en}</span>
          <span className="tour-progress">{t('tourStep', lang)} {tourStep + 1} {t('of', lang)} {tour.steps.length}</span>
          <button className="icon-btn" onClick={endTour} aria-label={t('tourExit', lang)}>✕</button>
        </div>
        <p className="tour-narration">{lang === 'ar' ? step.ar : step.en}</p>
        <div className="tour-nav">
          <button className="btn" disabled={first} onClick={() => tourGoto(tourStep - 1)}>← {t('tourPrev', lang)}</button>
          <div className="tour-dots">
            {tour.steps.map((_, i) => (
              <span key={i} className={'tour-dot' + (i === tourStep ? ' on' : '')} onClick={() => tourGoto(i)} />
            ))}
          </div>
          {last ? (
            <button className="btn btn-primary" onClick={endTour}>{t('tourExit', lang)}</button>
          ) : (
            <button className="btn btn-primary" onClick={() => tourGoto(tourStep + 1)}>{t('tourNext', lang)} →</button>
          )}
        </div>
      </div>
    </div>
  )
}
