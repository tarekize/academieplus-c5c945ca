// Catalogue des matières assignables à un pédago. Doit rester cohérent avec
// la table `subjects` en base (supabase/migrations/20260720120000_add_pedago_subjects.sql).
export interface SubjectDef {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
}

export const SUBJECTS: SubjectDef[] = [
  { id: "math", name: "Mathématiques", nameAr: "الرياضيات", icon: "📐" },
  { id: "physique", name: "Physique", nameAr: "الفيزياء", icon: "⚛️" },
  { id: "science", name: "Sciences", nameAr: "العلوم", icon: "🔬" },
  { id: "anglais", name: "Anglais", nameAr: "الإنجليزية", icon: "🇬🇧" },
  { id: "francais", name: "Français", nameAr: "الفرنسية", icon: "🇫🇷" },
  { id: "arabe", name: "Arabe", nameAr: "العربية", icon: "📖" },
  { id: "islamique", name: "Éducation islamique", nameAr: "التربية الإسلامية", icon: "🕌" },
  { id: "histoire_geo", name: "Histoire-Géographie", nameAr: "التاريخ والجغرافيا", icon: "🗺️" },
  { id: "philo", name: "Philosophie", nameAr: "الفلسفة", icon: "🧠" },
];

export function subjectLabel(id: string): string {
  return SUBJECTS.find((s) => s.id === id)?.name || id;
}
