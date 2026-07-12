import { useStore } from '../store/useStore'
import { TOURS } from '../data/tours'
import { SYSTEM_BY_ID } from '../data/systems'
import { t } from '../i18n/strings'

export default function ToursPanel() {
  const lang = useStore((s) => s.lang)
  const startTour = useStore((s) => s.startTour)

  return (
    <div className="panel-body">
      <ul className="tours-list">
        {TOURS.map((tour) => {
          const sys = SYSTEM_BY_ID[tour.system]
          return (
            <li key={tour.id}>
              <button className="tour-card" onClick={() => startTour(tour.id)} style={{ ['--sys' as any]: sys.color }}>
                <span className="tour-icon">{tour.icon}</span>
                <span className="tour-text">
                  <span className="tour-title">{lang === 'ar' ? tour.ar : tour.en}</span>
                  <span className="tour-sub">{tour.steps.length} {lang === 'ar' ? 'محطات' : 'stops'}</span>
                </span>
                <span className="tour-go">{t('tourStart', lang)} →</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
