import { create_i18n } from '@/lib/i18n';

/*
 * rendererプロセスで使用する多言語処理
 *
 *  使い方
 *  import { i18n } from '@/lib/i18n-renderer';
 *  i18n.t('Warning')
 */
export const I18n = create_i18n(window.appConfig.getLocale());
export const i18n = I18n.global;
