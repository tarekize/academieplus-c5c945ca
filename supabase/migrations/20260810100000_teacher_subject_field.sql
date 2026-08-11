-- Le profil enseignant n'a aucun champ "Matière" alors que c'est une
-- information de base attendue de son compte (anomalie signalée).
ALTER TABLE public.profiles ADD COLUMN subject text;
