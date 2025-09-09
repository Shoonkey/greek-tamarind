import { API_ERRORS, ApiErrorCode } from './api.errors';
import { SupportedLanguage } from './i18n-dict.type';

// TODO: Create generalized solution for all i18n dictionaries

export function i18nApi(lang: SupportedLanguage, tag: ApiErrorCode): string {
  return API_ERRORS[lang][tag];
}
