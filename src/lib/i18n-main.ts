import { app } from 'electron';
import { create_i18n } from '@/lib/i18n';

/*
 * mainプロセスで使用する多言語処理
 *
 *  使い方
 *  import { createi18n } from '@/lib/i18n-main';
 *  const i18n = I18n().global;
 *  i18n.t('Warning')
 */
export const I18n = () => {
  const locale = app.getLocale();
  return create_i18n(locale);
};
