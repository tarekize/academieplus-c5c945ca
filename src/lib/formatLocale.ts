import i18n from "@/i18n/config";

/** Maps the active i18n language to an Intl locale (Latin digits even in Arabic). */
export function getIntlLocale(): string {
  return i18n.language === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR";
}

export function formatLocaleDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getIntlLocale(), options);
}

export function formatLocaleDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(getIntlLocale(), options);
}

export function formatLocaleNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString(getIntlLocale(), options);
}
