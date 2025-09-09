import { I18NDict } from './i18n-dict.type';

enum ApiErrorId {
  UNEXPECTED_ERROR,
}

export type ApiErrorCode = keyof typeof ApiErrorId;

export const API_ERRORS: I18NDict<ApiErrorCode> = {
  'en-US': {
    UNEXPECTED_ERROR: 'Oops! An unexpected error happened.',
  },
};
