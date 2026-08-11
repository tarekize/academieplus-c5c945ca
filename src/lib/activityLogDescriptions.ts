import { Json } from "@/integrations/supabase/types";

// Le code brut de l'action (ex: "generate_remediation") ne dit rien à un
// admin qui lit le journal : cette table traduit chaque action connue en
// description compréhensible. Les codes non répertoriés (nouvelle action
// pas encore ajoutée ici) tombent sur un replis lisible plutôt qu'une
// erreur — le code brut mis en forme (underscores → espaces, majuscule).
const ACTION_DESCRIPTIONS: Record<string, string> = {
  // IA — génération de contenu pédagogique
  generate_remediation: "Génération par IA d'un plan de remédiation pour un élève en difficulté",
  generate_placement_test: "Génération par IA du test de positionnement",
  generate_adaptive_content: "Génération par IA du contenu adaptatif d'une leçon",
  generate_chapter_revision: "Génération par IA d'une fiche de révision de chapitre",
  generate_lesson_comment: "Génération par IA d'un commentaire sur une leçon",
  generate_periodic_advice: "Génération par IA d'un conseil périodique pour un parent",
  generate_parent_report: "Génération par IA du rapport de suivi envoyé à un parent",
  ia_teacher_content_request: "Génération par IA d'exercices/quiz par un enseignant",
  ia_extract_document: "Extraction de contenu depuis un document importé (IA)",
  ia_exam_exercise_request: "Génération par IA d'un exercice d'examen",
  ia_editorial_request: "Utilisation de l'assistant éditorial IA",
  ia_chat_request: "Message envoyé à l'assistant IA (chat)",
  // Paiement et abonnement
  record_payment: "Paiement enregistré (activation d'un abonnement)",
  // Compte et sécurité
  password_change_request: "Demande de changement de mot de passe",
  password_change_confirm: "Changement de mot de passe confirmé",
  password_change_code_requested: "Code de vérification demandé (changement de mot de passe)",
  user_deleted: "Suppression d'un compte utilisateur",
  user_updated: "Modification d'un compte utilisateur par un administrateur",
  profile_updated: "Mise à jour de son propre profil",
  create_child_account: "Création d'un compte enfant par un parent",
  join_class_attempt: "Tentative de rejoindre une classe avec un code",
  link_code_attempt: "Tentative de liaison d'un compte enfant par code",
  // Contenu pédagogique et communication
  course_sent_to_review: "Contenu envoyé en relecture par un pédagogue",
  send_bulk_notification: "Envoi d'une notification groupée",
  // Maintenance automatique (RGPD)
  delete_old_activity_logs: "Nettoyage automatique des anciens logs d'activité (RGPD)",
  delete_expired_parental_consent_tokens: "Nettoyage des demandes de consentement parental expirées",
  delete_old_contact_messages: "Nettoyage des anciens messages de contact",
};

export function describeAction(action: string, details: Json | null | undefined): string {
  const base = ACTION_DESCRIPTIONS[action]
    ?? action.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

  if (action === "user_deleted" && details && typeof details === "object" && !Array.isArray(details)) {
    const selfDelete = (details as Record<string, unknown>).self_delete;
    if (selfDelete === true) return "Suppression de son propre compte";
    if (selfDelete === false) return "Suppression du compte d'un autre utilisateur";
  }

  return base;
}
