import { I18NDict, SupportedLanguage } from './i18n-dict.type';

export function i18n<T extends string>(lang: SupportedLanguage, tag: T, dict: I18NDict<T>): string {
  return dict[lang][tag];
}
