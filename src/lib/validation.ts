import { z } from "zod";

// Numéro algérien : doit commencer par 0 et compter exactement 10 chiffres
// (espaces/points/tirets tolérés à la saisie, retirés avant validation/stockage).
export const ALGERIAN_PHONE_REGEX = /^0\d{9}$/;

export const algerianPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.-]/g, ""))
  .refine((v) => v === "" || ALGERIAN_PHONE_REGEX.test(v), {
    message: "Le numéro doit commencer par 0 et contenir 10 chiffres (ex : 0555123456).",
  })
  .optional()
  .or(z.literal(""));

// School levels configuration - values match the database enum
export const schoolLevels = {
  primaire: [
    { value: "5eme_primaire", label: "5ème Primaire" },
  ],
  cem: [
    { value: "1ere_cem", label: "1ère CEM" },
    { value: "2eme_cem", label: "2ème CEM" },
    { value: "3eme_cem", label: "3ème CEM" },
    { value: "4eme_cem", label: "4ème CEM" },
  ],
  lycee: [
    { value: "premiere", label: "Première" },
    { value: "seconde", label: "Seconde" },
    { value: "terminale", label: "Terminale" },
  ],
};

export const allSchoolLevels = [
  ...schoolLevels.primaire,
  ...schoolLevels.cem,
  ...schoolLevels.lycee,
];

/** Libellé FR d'un niveau scolaire (valeur enum -> "Terminale", etc.), repli sur la valeur brute. */
export function getSchoolLevelLabel(value: string): string {
  const level = allSchoolLevels.find((l) => l.value === value);
  return level?.label || value;
}
