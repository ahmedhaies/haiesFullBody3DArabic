import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { BY_SYSTEM, BY_ID, type Structure } from '../data/terminology'
import { SYSTEMS, SYSTEM_BY_ID, type SystemId } from '../data/systems'
import { t } from '../i18n/strings'
import { names } from '../hooks'

type Tab = 'browse' | 'favorites' | 'notes'

function Row({ s }: { s: Structure }) {
  const lang = useStore((st) => st.lang)
  const select = useStore((st) => st.select)
  const selectedId = useStore((st) => st.selectedId)
  const n = names(s, lang)
  return (
    <li>
      <button className={'lib-row' + (selectedId === s.id ? ' on' : '') + (s.feature ? ' is-feature' : '')} onClick={() => select(s.id)}>
        <span className="lib-primary">{n.primary}</span>
        {n.secondary && <span className="lib-secondary" dir={lang === 'ar' ? 'ltr' : 'rtl'}>{n.secondary}</span>}
      </button>
    </li>
  )
}

export default function LibraryPanel() {
  const lang = useStore((s) => s.lang)
  const favorites = useStore((s) => s.favorites)
  const notes = useStore((s) => s.notes)
  const setSystemVisible = useStore((s) => s.setSystemVisible)
  const [tab, setTab] = useState<Tab>('browse')
  const [sys, setSys] = useState<SystemId>('skeletal')
  const [onlyPrimary, setOnlyPrimary] = useState(true)
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    let arr = BY_SYSTEM.get(sys) || []
    if (onlyPrimary) arr = arr.filter((s) => !s.feature)
    if (q.trim()) {
      const nq = q.trim().toLowerCase()
      arr = arr.filter((s) => (s.ar && s.ar.includes(q.trim())) || s.en.toLowerCase().includes(nq))
    }
    return arr.slice(0, 400)
  }, [sys, onlyPrimary, q])

  const favStructures = favorites.map((id) => BY_ID.get(id)).filter(Boolean) as Structure[]
  const noteStructures = Object.keys(notes).map((id) => BY_ID.get(id)).filter(Boolean) as Structure[]

  return (
    <div className="panel-body library">
      <div className="lib-tabs">
        <button className={tab === 'browse' ? 'on' : ''} onClick={() => setTab('browse')}>{lang === 'ar' ? 'تصفّح' : 'Browse'}</button>
        <button className={tab === 'favorites' ? 'on' : ''} onClick={() => setTab('favorites')}>★ {t('favorites', lang)}</button>
        <button className={tab === 'notes' ? 'on' : ''} onClick={() => setTab('notes')}>📝 {t('notes', lang)}</button>
      </div>

      {tab === 'browse' && (
        <>
          <div className="lib-syschips">
            {SYSTEMS.map((s) => (
              <button
                key={s.id}
                className={'syschip' + (sys === s.id ? ' on' : '')}
                style={{ ['--chip' as any]: s.color }}
                onClick={() => { setSys(s.id); setSystemVisible(s.id, true) }}
              >
                {s.icon} {lang === 'ar' ? s.ar : s.en}
              </button>
            ))}
          </div>
          <div className="lib-filter">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search', lang) + '…'} />
            <label className="mini-check">
              <input type="checkbox" checked={onlyPrimary} onChange={(e) => setOnlyPrimary(e.target.checked)} />
              <span>{lang === 'ar' ? 'الرئيسية فقط' : 'Primary only'}</span>
            </label>
          </div>
          <ul className="lib-list">{list.map((s) => <Row key={s.id} s={s} />)}</ul>
        </>
      )}

      {tab === 'favorites' && (
        <ul className="lib-list">
          {favStructures.length === 0 && <li className="panel-empty">{t('noFavorites', lang)}</li>}
          {favStructures.map((s) => <Row key={s.id} s={s} />)}
        </ul>
      )}

      {tab === 'notes' && (
        <ul className="lib-list">
          {noteStructures.length === 0 && <li className="panel-empty">{t('noNotes', lang)}</li>}
          {noteStructures.map((s) => (
            <li key={s.id}>
              <button className="lib-row lib-note" onClick={() => useStore.getState().select(s.id)}>
                <span className="lib-primary">{names(s, lang).primary}</span>
                <span className="lib-note-text">{notes[s.id]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
