import { useProgress } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { t } from '../i18n/strings'

export default function Loader() {
  const { active, progress } = useProgress()
  const lang = useStore((s) => s.lang)
  if (!active) return null
  return (
    <div className="loader">
      <div className="loader-card">
        <div className="loader-spinner" />
        <div className="loader-text">{t('loadingModel', lang)}</div>
        <div className="loader-bar"><span style={{ width: `${progress.toFixed(0)}%` }} /></div>
        <div className="loader-pct">{progress.toFixed(0)}%</div>
      </div>
    </div>
  )
}
