import { useStore, type PanelId } from '../store/useStore'
import { t } from '../i18n/strings'

const ITEMS: { id: PanelId; icon: string; key: string }[] = [
  { id: 'search', icon: '🔍', key: 'search' },
  { id: 'layers', icon: '🧩', key: 'layers' },
  { id: 'tools', icon: '✂️', key: 'tools' },
  { id: 'tours', icon: '🎓', key: 'tours' },
  { id: 'library', icon: '📚', key: 'library' },
]

export default function Dock() {
  const lang = useStore((s) => s.lang)
  const panel = useStore((s) => s.panel)
  const setPanel = useStore((s) => s.setPanel)

  return (
    <nav className="dock">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          className={'dock-btn' + (panel === it.id ? ' on' : '')}
          onClick={() => setPanel(it.id)}
          aria-label={t(it.key, lang)}
        >
          <span className="dock-icon">{it.icon}</span>
          <span className="dock-label">{t(it.key, lang)}</span>
        </button>
      ))}
    </nav>
  )
}
