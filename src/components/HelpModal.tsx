import { useStore } from '../store/useStore'
import { t } from '../i18n/strings'
import { STATS } from '../data/terminology'

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{t('appTitle', lang)}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <p className="modal-tag">{t('appTagline', lang)}</p>

        <h3>{t('helpControls', lang)}</h3>
        <ul className="help-list">
          <li><b>🖱️/👆 {t('helpDrag', lang)}</b></li>
          <li><b>🔍 {t('helpPinch', lang)}</b></li>
          <li><b>✋ {t('helpTwoFinger', lang)}</b></li>
          <li><b>👆 {t('helpTap', lang)}</b></li>
        </ul>

        <p className="help-stats">
          {lang === 'ar'
            ? `${STATS.structures.toLocaleString('ar-EG')} تركيب تشريحي · ${STATS.arabic.toLocaleString('ar-EG')} باسم عربي`
            : `${STATS.structures.toLocaleString('en')} structures · ${STATS.arabic.toLocaleString('en')} with Arabic names`}
        </p>

        <div className="attribution">
          <h3>{t('attribution', lang)}</h3>
          <p>
            {lang === 'ar'
              ? 'المجسمات ثلاثية الأبعاد من مشروع Z-Anatomy (مبنية على BodyParts3D) — رخصة المشاع الإبداعي: النسب-الترخيص بالمثل 4.0 (CC BY-SA 4.0). الأوصاف الإنجليزية من ويكيبيديا (CC BY-SA). المصطلحات العربية أُعدّت وفق التشريح المعتمد.'
              : 'The 3D models are from the Z-Anatomy project (based on BodyParts3D), licensed CC BY-SA 4.0. English descriptions from Wikipedia (CC BY-SA). Arabic terminology curated per standard anatomy.'}
          </p>
        </div>
      </div>
    </div>
  )
}
