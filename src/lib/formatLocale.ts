import i18n from "@/i18n/config";

/** Maps the active i18n language to an Intl locale (Latin digits even in Arabic). */
export function getIntlLocale(): string {
  return i18n.language === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR";
}

/** Formate une date selon la langue d'interface active (FR ou AR-DZ, chiffres latins). */
export function formatLocaleDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getIntlLocale(), options);
}

/** Idem formatLocaleDate, avec l'heure. */
export function formatLocaleDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(getIntlLocale(), options);
}

/** Formate un nombre selon la langue d'interface active. */
export function formatLocaleNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString(getIntlLocale(), options);
}

/** Formate un montant en dinars algériens avec le symbole dans la langue active
 * ("DA" en français, "دج" en arabe) — chiffres toujours latins, comme le reste
 * de l'app (cf. getIntlLocale). */
export function formatCurrencyDA(value: number): string {
  const amount = formatLocaleNumber(value);
  return i18n.language === "ar" ? `${amount} دج` : `${amount} DA`;
}
