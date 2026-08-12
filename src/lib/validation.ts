import { z } from "zod";

// Numéro algérien : mobile 05/06/07 + 8 chiffres, fixe 02-04 + 7-8 chiffres,
// préfixe +213 ou 0 accepté, espaces/points/tirets tolérés dans la saisie.
export const ALGERIAN_PHONE_REGEX = /^(?:\+213[\s.-]?0?|0)(?:[5-7](?:[\s.-]?\d){8}|[2-4](?:[\s.-]?\d){7,8})$/;

export const algerianPhoneSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || ALGERIAN_PHONE_REGEX.test(v), {
    message: "Numéro de téléphone invalide (format algérien attendu, ex : 05 XX XX XX XX)",
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
