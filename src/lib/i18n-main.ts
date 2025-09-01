// src/lib/i18n-main.ts (for main process)
import { app } from 'electron';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import zhTW from '@/locales/zh-TW.json';

type Dict = Record<string, any>;
const messages: Record<string, Dict> = { ja, ko, 'zh-TW': zhTW };

let currentLocale = 'ja';

function normalizeLocale(raw: string): keyof typeof messages {
  // 規整可能的變體：zh, zh-TW, zh_Hant_TW, zh-Hant…
  if (!raw) return 'ja';
  const v = raw.toLowerCase().replace('_', '-');
  if (v.startsWith('zh')) return 'zh-TW';
  if (v.startsWith('ko')) return 'ko';
  return 'ja';
}

function getByPath(obj: Dict, path: string): any {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
}

export function initI18nMain(explicit?: string) {
  // need call after app.whenReady()
  const fromApp = app.getLocale();
  const want = explicit || fromApp;
  currentLocale = normalizeLocale(want);
  console.log('[i18n-main] resolved locale =', currentLocale, '(raw:', want, ')');
}

export function setLocaleMain(next: string) {
  currentLocale = normalizeLocale(next);
  console.log('[i18n-main] changed locale =', currentLocale);
}

export function tMain(key: string, vars?: Record<string, any>): string {
  const dict = messages[currentLocale] || messages['ja'];
  let val = getByPath(dict, key);
  if (typeof val !== 'string') return key;
  if (vars) {
    val = val.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ''));
  }
  return val;
}
