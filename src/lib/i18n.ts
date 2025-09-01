import { createI18n } from 'vue-i18n';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import zhTW from '@/locales/zh-TW.json';

/* rendererプロセスで使用する多言語処理 */
function loc(): string {
  let locale = 'ja';
  const applocale = window.appConfig.getLocale(); // 可能回傳 zh-TW / zh-CN / ko / ja / ...

  if (applocale.startsWith('ko')) return 'ko';
  // if (applocale === 'zh-CN') return 'zh-CN';
  if (applocale.startsWith('zh')) return 'zh-TW';

  return locale;
}


export const I18n = createI18n({
  locale: loc(),
  fallbackLocale: 'ja',
  messages: {
    ja,
    ko,
    'zh-TW': zhTW,
    // 'zh-CN': zhCN,
  },
});
export const i18n = I18n.global;
