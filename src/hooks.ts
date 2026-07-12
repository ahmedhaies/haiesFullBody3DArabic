import { useEffect, useState } from 'react'
import type { Lang } from './i18n/strings'
import type { Structure } from './data/terminology'

export function useIsMobile(bp = 820): boolean {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < bp : false))
  useEffect(() => {
    const on = () => setM(window.innerWidth < bp)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [bp])
  return m
}

export interface NameParts { primary: string; secondary: string; pending: boolean }

export function names(s: Structure, lang: Lang): NameParts {
  const hasAr = !!s.ar
  if (lang === 'ar') {
    return { primary: hasAr ? s.ar : s.en, secondary: hasAr ? s.en : s.en, pending: !hasAr }
  }
  return { primary: s.en, secondary: hasAr ? s.ar : '', pending: false }
}

export function sideLabel(sides: string, lang: Lang): string {
  if (sides === 'rl') return lang === 'ar' ? 'أيمن وأيسر' : 'right & left'
  if (sides === 'r') return lang === 'ar' ? 'الأيمن' : 'right'
  if (sides === 'l') return lang === 'ar' ? 'الأيسر' : 'left'
  return ''
}
