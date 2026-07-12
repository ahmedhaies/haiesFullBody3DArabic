import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { BY_ID, loadDescriptionsEn, getDescriptionEn, describeAr, describeEn } from '../data/terminology'
import { SYSTEM_BY_ID } from '../data/systems'
import { t } from '../i18n/strings'
import { names, sideLabel } from '../hooks'

export default function InfoPanel() {
  const lang = useStore((s) => s.lang)
  const selectedId = useStore((s) => s.selectedId)
  const favorites = useStore((s) => s.favorites)
  const notes = useStore((s) => s.notes)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const setNote = useStore((s) => s.setNote)
  const requestFocus = useStore((s) => s.requestFocus)
  const isolate = useStore((s) => s.isolateStructure)
  const setIsolate = useStore((s) => s.setIsolateStructure)
  const select = useStore((s) => s.select)

  const [descEn, setDescEn] = useState<string | undefined>()
  const [noteDraft, setNoteDraft] = useState('')
  const [editing, setEditing] = useState(false)

  const s = selectedId ? BY_ID.get(selectedId) : null

  useEffect(() => {
    if (!s) return
    setEditing(false)
    setNoteDraft(notes[s.id] || '')
    loadDescriptionsEn(import.meta.env.BASE_URL).then(() => setDescEn(getDescriptionEn(s.key)))
  }, [selectedId])

  if (!s) return null
  const n = names(s, lang)
  const sys = SYSTEM_BY_ID[s.system]
  const isFav = favorites.includes(s.id)
  const side = sideLabel(s.sides, lang)
  const savedNote = notes[s.id]

  return (
    <div className="info">
      <div className="info-head" style={{ ['--sys' as any]: sys.color }}>
        <div className="info-titles">
          <h2 className="info-primary">{n.primary}</h2>
          {n.secondary && <div className="info-secondary" dir={lang === 'ar' ? 'ltr' : 'rtl'}>{n.secondary}</div>}
        </div>
        <button className="icon-btn" onClick={() => select(null)} aria-label={t('close', lang)}>✕</button>
      </div>

      <div className="info-badges">
        <span className="chip" style={{ ['--chip' as any]: sys.color }}>
          <span className="chip-dot" />{sys.icon} {lang === 'ar' ? sys.ar : sys.en}
        </span>
        {side && <span className="badge">{side}</span>}
        {s.arVerified && <span className="badge badge-ok">✓ {lang === 'ar' ? 'مدقّق' : 'verified'}</span>}
        {n.pending && <span className="badge badge-warn">{t('noArabicYet', lang)}</span>}
      </div>

      <dl className="info-names">
        {s.ar && <div><dt>{t('arabicName', lang)}</dt><dd>{s.ar}</dd></div>}
        <div><dt>{t('englishName', lang)}</dt><dd dir="ltr">{s.en}</dd></div>
        {s.la && <div><dt>{t('latinName', lang)}</dt><dd dir="ltr"><em>{s.la}</em></dd></div>}
      </dl>

      <div className="info-desc">
        <h3>{t('description', lang)}</h3>
        <p dir="rtl">{describeAr(s)}</p>
        <p className="info-desc-en" dir="ltr">{descEn || describeEn(s)}</p>
      </div>

      <div className="info-actions">
        <button className="btn" onClick={requestFocus}>🎯 {t('focus', lang)}</button>
        <button className={'btn' + (isolate ? ' btn-active' : '')} onClick={() => setIsolate(!isolate)}>◎ {t('isolate', lang)}</button>
        <button className={'btn' + (isFav ? ' btn-active' : '')} onClick={() => toggleFavorite(s.id)}>
          {isFav ? '★' : '☆'} {isFav ? t('removeFavorite', lang) : t('addFavorite', lang)}
        </button>
      </div>

      <div className="info-note">
        {editing || !savedNote ? (
          <>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={t('notePlaceholder', lang)}
              rows={3}
            />
            <button className="btn btn-primary" onClick={() => { setNote(s.id, noteDraft); setEditing(false) }}>
              {t('saveNote', lang)}
            </button>
          </>
        ) : (
          <div className="info-note-saved" onClick={() => setEditing(true)}>
            <span className="info-note-label">📝 {t('notes', lang)}</span>
            <p>{savedNote}</p>
          </div>
        )}
      </div>
    </div>
  )
}
