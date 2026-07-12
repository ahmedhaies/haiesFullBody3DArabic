import { useStore } from '../store/useStore'
import { t } from '../i18n/strings'
import { STATS } from '../data/terminology'
import SearchBox from './SearchBox'
import { useIsMobile } from '../hooks'

export default function TopBar({ onHelp }: { onHelp: () => void }) {
  const lang = useStore((s) => s.lang)
  const toggleLang = useStore((s) => s.toggleLang)
  const requestReset = useStore((s) => s.requestReset)
  const setPanel = useStore((s) => s.setPanel)
  const sex = useStore((s) => s.sex)
  const setSex = useStore((s) => s.setSex)
  const isMobile = useIsMobile()

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-logo" aria-hidden>🫀</span>
        <span className="brand-text">
          <span className="brand-title">{t('appTitle', lang)}</span>
          {!isMobile && <span className="brand-sub">{STATS.structures.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en')} {t('structuresCount', lang)} · {lang === 'ar' ? 'عربي/إنجليزي' : 'AR/EN'}</span>}
        </span>
      </div>

      {!isMobile && <div className="topbar-search"><SearchBox /></div>}

      <div className="topbar-actions">
        {isMobile && (
          <button className="icon-btn" onClick={() => setPanel('search')} aria-label={t('search', lang)}>🔍</button>
        )}
        <div className="sex-toggle" role="group" aria-label={t('sexTitle', lang)} title={t('sexToggle', lang)}>
          <button
            className={'sex-opt' + (sex === 'male' ? ' active' : '')}
            onClick={() => setSex('male')}
            aria-pressed={sex === 'male'}
          >♂{!isMobile && ' ' + t('sexMale', lang)}</button>
          <button
            className={'sex-opt' + (sex === 'female' ? ' active' : '')}
            onClick={() => setSex('female')}
            aria-pressed={sex === 'female'}
          >♀{!isMobile && ' ' + t('sexFemale', lang)}</button>
        </div>
        <button className="icon-btn" onClick={requestReset} aria-label={t('reset', lang)} title={t('reset', lang)}>⟳</button>
        <button className="lang-btn" onClick={toggleLang} aria-label="language">{t('language', lang)}</button>
        <button className="icon-btn" onClick={onHelp} aria-label={t('help', lang)}>؟</button>
      </div>
    </header>
  )
}
