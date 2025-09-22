import { createI18n } from 'vue-i18n';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import zhTW from '@/locales/zh-TW.json';

/*
 * rendererプロセスで使用する多言語処理
 */
function loc(): string {
  let locale = 'ja';

  // 存在する言語ファイルのロケールがあれば変更する
  // Electronのロケールの仕様 https://www.electronjs.org/docs/latest/api/app#appgetlocale
  // ロケールの一覧 https://chromium.googlesource.com/chromium/src/+/66.0.3359.158/ui/base/l10n/l10n_util.cc
  const applocale = window.appConfig.getLocale();
  switch (applocale) {
    case 'ko':
    case 'zh-TW':
      locale = applocale;
      break;
    default:
      break;
  }
  return locale;
}

/*
 *  I18n : vue-i18nの基本的な使い方.
 *  i18n : <script>内で使用する。 例) i18n.t('Warning')
 */
export const I18n = createI18n({
  locale: loc(),
  messages: {
    ja: ja,
    ko: ko,
    'zh-TW': zhTW
  }
}); // 存在する言語ファイルのロケールを追加
export const i18n = I18n.global;
