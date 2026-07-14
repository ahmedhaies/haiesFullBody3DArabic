import { useState } from 'react'
import { useStore } from '../store/useStore'
import { BY_ID, type Structure } from '../data/terminology'
import { t } from '../i18n/strings'
import { names } from '../hooks'

// Always-available restore surface: a floating pill that shows how many parts
// are hidden and, when tapped, lists them so any one (or all) can be brought
// back — independent of which panel is open.
export default function HiddenChip() {
  const lang = useStore((s) => s.lang)
  const hidden = useStore((s) => s.hidden)
  const unhide = useStore((s) => s.unhideStructure)
  const clearHidden = useStore((s) => s.clearHidden)
  const [open, setOpen] = useState(false)

  const items = hidden.map((id) => BY_ID.get(id)).filter(Boolean) as Structure[]
  if (items.length === 0) return null

  return (
    <div className={'hidden-chip-wrap' + (open ? ' open' : '')}>
      {open && (
        <div className="hidden-pop">
          <div className="hidden-pop-head">
            <span className="hidden-pop-title">🚫 {t('hiddenTitle', lang)} <span className="hidden-count">{items.length}</span></span>
            <button className="btn btn-sm" onClick={clearHidden}>{t('showAllHidden', lang)}</button>
          </div>
          <p className="hidden-hint">{t('hiddenHint', lang)}</p>
          <ul className="hidden-list">
            {items.map((s) => (
              <li key={s.id}>
                <button className="hidden-row" onClick={() => unhide(s.id)} title={t('unhide', lang)}>
                  <span className="hidden-name">{names(s, lang).primary}</span>
                  <span className="hidden-eye">👁 {t('unhide', lang)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="hidden-chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={t('hiddenTitle', lang)}
      >
        <span className="hidden-chip-icon">🚫</span>
        <span className="hidden-chip-count">{items.length}</span>
        <span className="hidden-chip-text">{t('hiddenTitle', lang)}</span>
        <span className="hidden-chip-caret">{open ? '▾' : '▴'}</span>
      </button>
    </div>
  )
}
