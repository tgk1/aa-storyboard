import { createI18n } from 'vue-i18n';
import ja from '@/locales/ja.json';

function loc(): string {
  let locale = 'ja';
  const applocale = window.appConfig.getLocale();

  // 存在する言語ファイルのロケールを追加
  if (applocale == 'ja') {
    locale = applocale;
  }
  return locale;
}

/*
 *  I18n : vue-i18nの基本的な使い方.
 *  i18n : <script>内で使用する。 例) i18n.t('Warning')
 */
export const I18n = createI18n({ locale: loc(), messages: { ja } }); // 存在する言語ファイルのロケールを追加
export const i18n = I18n.global;
