import { z } from 'zod';

export const courseSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  matiere_id: z.number().positive('Veuillez sélectionner une matière'),
  niveau_id: z.number().positive('Veuillez sélectionner un niveau'),
  difficulte: z.number().min(1).max(5),
  duree_lecture: z.number().min(1),
  statut: z.enum(['brouillon', 'en_revision', 'publié', 'archivé']),
});

export const sectionSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  type: z.enum(['definition', 'propriete', 'exemple', 'methode', 'remarque', 'exercice']),
  contenu_texte: z.string().optional(),
  ordre: z.number(),
});

export const formulaSchema = z.object({
  latex_source: z.string().min(1, 'La formule ne peut pas être vide'),
  mode_affichage: z.enum(['inline', 'block']).default('block'),
});

export const mediaSchema = z.object({
  nom_fichier: z.string(),
  url_fichier: z.string().url(),
  type_fichier: z.enum(['image', 'video', 'audio', 'document']),
  alt_text: z.string().optional(),
  legende: z.string().optional(),
});

export function validateCourse(data: unknown) {
  return courseSchema.safeParse(data);
}

export function validateSection(data: unknown) {
  return sectionSchema.safeParse(data);
}

export function validateFormula(data: unknown) {
  return formulaSchema.safeParse(data);
}

export function validateMedia(data: unknown) {
  return mediaSchema.safeParse(data);
}
