// TODO: potentially add more supported languages
export type SupportedLanguage = 'en-US';

/**
 * This allows for making i18n typed objects like this:
 *
 * enum TextId {
 *  WELCOME_MESSAGE
 * }
 *
 * const i18n: I18NDict<keyof typeof SpecificSectionText> = { "en-US": { WELCOME_MESSAGE: "Hello!" } };
 */
export type I18NDict<T extends string> = Record<SupportedLanguage, Record<T, string>>;
