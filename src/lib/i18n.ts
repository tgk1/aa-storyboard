import { createI18n } from 'vue-i18n';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';

/*
 * rendererプロセスで使用する多言語処理
 */
function loc(): string {
  let locale = 'ja';

  // 存在する言語ファイルのロケールがあれば変更する
  const applocale = window.appConfig.getLocale();
  if (applocale == 'ko') {
    locale = applocale;
  }

  return locale;
}

/*
 *  I18n : vue-i18nの基本的な使い方.
 *  i18n : <script>内で使用する。 例) i18n.t('Warning')
 */
export const I18n = createI18n({ locale: loc(), messages: { ja, ko } }); // 存在する言語ファイルのロケールを追加
export const i18n = I18n.global;
