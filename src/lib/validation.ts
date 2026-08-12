import { z } from "zod";

// Password validation: min 8 chars, 1 uppercase, 1 number
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

// Email validation
export const emailSchema = z
  .string()
  .email("Adresse email invalide")
  .min(1, "L'email est requis");

// Phone validation (French format)
export const phoneSchema = z
  .string()
  .regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    "Numéro de téléphone invalide (format français attendu)"
  )
  .optional()
  .or(z.literal(""));

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

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Le nom doit contenir au moins 2 caractères")
  .max(50, "Le nom ne peut pas dépasser 50 caractères");

// Registration schema for students
export const studentRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: z.date().optional(),
  schoolLevel: z.string().min(1, "Veuillez sélectionner votre niveau scolaire"),
  consentDataProcessing: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter le traitement des données",
  }),
  consentTermsPrivacy: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Registration schema for parents
export const parentRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  consentDataProcessing: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter le traitement des données",
  }),
  consentTermsPrivacy: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  schoolLevel: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Types
export type StudentRegistration = z.infer<typeof studentRegistrationSchema>;
export type ParentRegistration = z.infer<typeof parentRegistrationSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Helper de validation de mot de passe (mêmes règles que passwordSchema).
// À date de cet audit, aucun composant n'importe cette fonction ni les
// schémas Zod ci-dessus (studentRegistrationSchema, passwordSchema, etc.) :
// chaque page (Auth.tsx, ResetPassword.tsx, ChangePasswordButton.tsx,
// AddUserDialog.tsx...) redéfinit sa propre fonction locale `validatePassword`
// avec la même logique dupliquée. Un bug dans l'une de ces copies locales
// (comme celui déjà corrigé dans Auth.tsx où le résultat n'était pas
// vérifié par l'appelant) n'est pas rattrapé par ce module centralisé.
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Au moins 8 caractères");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins une majuscule");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Au moins un chiffre");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

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

/** Regroupe un niveau scolaire dans sa catégorie (Primaire/CEM/Lycée) pour l'affichage. */
export function getSchoolCategory(value: string): string {
  if (schoolLevels.primaire.some((l) => l.value === value)) return "Primaire";
  if (schoolLevels.cem.some((l) => l.value === value)) return "CEM";
  if (schoolLevels.lycee.some((l) => l.value === value)) return "Lycée";
  return "";
}
