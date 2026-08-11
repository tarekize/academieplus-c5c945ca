-- Le format de jeton de protection LaTeX/HTML de translate-text (§§N§§)
-- pouvait revenir de MyMemory avec un espace inséré entre chaque §
-- ("§ §16 § §"), cassant le regex de restauration et laissant du charabia
-- dans le contenu de leçon traduit. Corrigé côté edge function (jeton
-- alphanumérique + regex de restauration tolérant aux espaces). Purge les
-- entrées de cache déjà polluées par l'ancien bug pour qu'elles soient
-- régénérées proprement au prochain affichage.
delete from public.translation_cache where translated_text ~ '§';
