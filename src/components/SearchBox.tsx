import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { search } from '../data/terminology'
import { SYSTEM_BY_ID } from '../data/systems'
import { t } from '../i18n/strings'
import { names } from '../hooks'

interface Props { autoFocus?: boolean; onPick?: () => void }

export default function SearchBox({ autoFocus, onPick }: Props) {
  const lang = useStore((s) => s.lang)
  const select = useStore((s) => s.select)
  const [q, setQ] = useState('')
  const results = useMemo(() => search(q, 30), [q])

  const pick = (id: string) => {
    select(id)
    onPick?.()
  }

  return (
    <div className="searchbox">
      <div className="searchbox-field">
        <span className="searchbox-icon" aria-hidden>🔍</span>
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) pick(results[0].id) }}
          placeholder={t('searchPlaceholder', lang)}
          aria-label={t('search', lang)}
        />
        {q && <button className="searchbox-clear" onClick={() => setQ('')} aria-label={t('clear', lang)}>✕</button>}
      </div>
      {q && (
        <ul className="search-results" role="listbox">
          {results.length === 0 && <li className="search-empty">{t('noResults', lang)}</li>}
          {results.map((s) => {
            const n = names(s, lang)
            const sys = SYSTEM_BY_ID[s.system]
            return (
              <li key={s.id}>
                <button className={'search-item' + (s.feature ? ' is-feature' : '')} onClick={() => pick(s.id)}>
                  <span className="search-item-main">
                    <span className="search-item-primary">{n.primary}</span>
                    {n.secondary && <span className="search-item-secondary">{n.secondary}</span>}
                  </span>
                  <span className="chip" style={{ ['--chip' as any]: sys.color }}>
                    <span className="chip-dot" />{lang === 'ar' ? sys.ar : sys.en}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
