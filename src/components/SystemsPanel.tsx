import { useStore } from '../store/useStore'
import { SYSTEMS } from '../data/systems'
import { BY_SYSTEM } from '../data/terminology'
import { t } from '../i18n/strings'

export default function SystemsPanel() {
  const lang = useStore((s) => s.lang)
  const visible = useStore((s) => s.visibleSystems)
  const toggle = useStore((s) => s.toggleSystem)
  const showAll = useStore((s) => s.showAllSystems)
  const showOnly = useStore((s) => s.showOnlySystem)
  const sex = useStore((s) => s.sex)
  const setSex = useStore((s) => s.setSex)

  return (
    <div className="panel-body">
      <div className="sex-field">
        <span className="sex-field-label">{t('sexTitle', lang)}</span>
        <div className="sex-toggle sex-toggle-wide" role="group" aria-label={t('sexTitle', lang)}>
          <button className={'sex-opt' + (sex === 'male' ? ' active' : '')} onClick={() => setSex('male')} aria-pressed={sex === 'male'}>♂ {t('sexMale', lang)}</button>
          <button className={'sex-opt' + (sex === 'female' ? ' active' : '')} onClick={() => setSex('female')} aria-pressed={sex === 'female'}>♀ {t('sexFemale', lang)}</button>
        </div>
      </div>
      {sex === 'female' && <p className="panel-note">ℹ️ {t('femaleNote', lang)}</p>}
      <div className="panel-toolbar">
        <button className="btn btn-sm" onClick={showAll}>{t('showAll', lang)}</button>
      </div>
      <ul className="systems-list">
        {SYSTEMS.map((s) => {
          const on = visible.includes(s.id)
          const count = BY_SYSTEM.get(s.id)?.length ?? 0
          return (
            <li key={s.id} className={'system-row' + (on ? ' on' : '')}>
              <button className="system-main" onClick={() => toggle(s.id)}>
                <span className="system-swatch" style={{ background: s.color }} />
                <span className="system-icon">{s.icon}</span>
                <span className="system-names">
                  <span className="system-ar">{lang === 'ar' ? s.ar : s.en}</span>
                  <span className="system-sub">{lang === 'ar' ? s.en : s.ar} · {count} {t('structuresCount', lang)}</span>
                </span>
                <span className={'toggle' + (on ? ' toggle-on' : '')}><span className="toggle-knob" /></span>
              </button>
              <button className="system-only" title={lang === 'ar' ? 'إفراد' : 'only'} onClick={() => showOnly(s.id)}>◎</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
