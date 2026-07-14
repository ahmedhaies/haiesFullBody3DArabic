import { useEffect, useState } from 'react'
import { useStore, type PanelId } from './store/useStore'
import { t } from './i18n/strings'
import Viewer from './three/Viewer'
import TopBar from './components/TopBar'
import Dock from './components/Dock'
import InfoPanel from './components/InfoPanel'
import SystemsPanel from './components/SystemsPanel'
import ToolsPanel from './components/ToolsPanel'
import ToursPanel from './components/ToursPanel'
import LibraryPanel from './components/LibraryPanel'
import TourOverlay from './components/TourOverlay'
import SearchBox from './components/SearchBox'
import Loader from './components/Loader'
import HelpModal from './components/HelpModal'
import HiddenChip from './components/HiddenChip'
import { useIsMobile } from './hooks'

const DOCK_PANELS: PanelId[] = ['search', 'layers', 'tools', 'tours', 'library']

function PanelDrawer() {
  const lang = useStore((s) => s.lang)
  const panel = useStore((s) => s.panel)
  const setPanel = useStore((s) => s.setPanel)
  if (!DOCK_PANELS.includes(panel)) return null

  const title =
    panel === 'search' ? t('search', lang)
    : panel === 'layers' ? t('layers', lang)
    : panel === 'tools' ? t('tools', lang)
    : panel === 'tours' ? t('tours', lang)
    : t('library', lang)

  return (
    <aside className="drawer drawer-end">
      <div className="drawer-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={() => setPanel('none')} aria-label={t('close', lang)}>✕</button>
      </div>
      {panel === 'search' && <div className="panel-body"><SearchBox autoFocus onPick={() => setPanel('none')} /></div>}
      {panel === 'layers' && <SystemsPanel />}
      {panel === 'tools' && <ToolsPanel />}
      {panel === 'tours' && <ToursPanel />}
      {panel === 'library' && <LibraryPanel />}
    </aside>
  )
}

export default function App() {
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const selectedId = useStore((s) => s.selectedId)
  const panel = useStore((s) => s.panel)
  const activeTour = useStore((s) => s.activeTour)
  const isMobile = useIsMobile()
  const [help, setHelp] = useState(false)
  const [hintDone, setHintDone] = useState(() => localStorage.getItem('haies-hint') === '1')

  // apply persisted language to <html> on mount
  useEffect(() => { setLang(lang) }, [])

  const dockPanelOpen = DOCK_PANELS.includes(panel)
  const showInfo = !!selectedId && (!isMobile || !dockPanelOpen)

  const dismissHint = () => { setHintDone(true); localStorage.setItem('haies-hint', '1') }

  return (
    <div className={'app' + (isMobile ? ' is-mobile' : '')}>
      <div className="viewer-wrap"><Viewer /></div>

      <TopBar onHelp={() => setHelp(true)} />
      <Dock />
      <PanelDrawer />
      {showInfo && <aside className="drawer drawer-start info-drawer"><InfoPanel /></aside>}
      {!activeTour && <HiddenChip />}
      {activeTour && <TourOverlay />}

      {!hintDone && !selectedId && !activeTour && (
        <div className="hint" onClick={dismissHint}>
          <span>👆 {t('tapHint', lang)}</span>
        </div>
      )}

      <Loader />
      {help && <HelpModal onClose={() => setHelp(false)} />}
    </div>
  )
}
