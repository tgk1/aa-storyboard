import { createI18n } from 'vue-i18n';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import zhTW from '@/locales/zh-TW.json';

export function selectLocale(applocale: string): string {
  // 存在する言語ファイルのロケールがあれば変更する
  // Electronのロケールの仕様 https://www.electronjs.org/docs/latest/api/app#appgetlocale
  // ロケールの一覧 https://chromium.googlesource.com/chromium/src/+/66.0.3359.158/ui/base/l10n/l10n_util.cc
  switch (applocale) {
    case 'ko':
    case 'zh-HK':
    case 'zh-TW':
      return applocale;
    default:
      return 'ja';
  }
}

//
// applocaleはメイン/レンダープロセスでロケールの取得方法が異なる
//   renderer process : window.appConfig.getLocale()
//   main process : app.getLocale()
export const create_i18n = (applocale: string) => {
  return createI18n({
    locale: selectLocale(applocale),
    messages: {
      ja: ja,
      ko: ko,
      'zh-HK': zhTW,
      'zh-TW': zhTW
    }
  });
};
