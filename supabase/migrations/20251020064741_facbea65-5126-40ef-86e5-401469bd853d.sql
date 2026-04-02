-- =====================================================
-- CRÉATION DE LA STRUCTURE CMS ÉDITORIAL
-- =====================================================

-- 1. Table UTILISATEURS (Équipe éditoriale)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    role TEXT CHECK (role IN ('editeur', 'revieur', 'admin')) NOT NULL,
    date_inscription TIMESTAMP DEFAULT NOW(),
    actif BOOLEAN DEFAULT true
);

-- 2. Table MATIERES
CREATE TABLE IF NOT EXISTS matieres (
    id BIGSERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icone TEXT,
    ordre INTEGER,
    active BOOLEAN DEFAULT true
);

-- 3. Table NIVEAUX
CREATE TABLE IF NOT EXISTS niveaux (
    id BIGSERIAL PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    cycle TEXT NOT NULL,
    ordre INTEGER
);

-- 4. Table PROGRAMMES
CREATE TABLE IF NOT EXISTS programmes (
    id BIGSERIAL PRIMARY KEY,
    annee_scolaire VARCHAR(20) NOT NULL,
    niveau_id BIGINT REFERENCES niveaux(id) ON DELETE CASCADE,
    matiere_id BIGINT REFERENCES matieres(id) ON DELETE CASCADE,
    referentiel_json JSONB,
    date_application DATE
);

-- 5. Table COURS (Core)
CREATE TABLE IF NOT EXISTS cours (
    id BIGSERIAL PRIMARY KEY,
    titre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    matiere_id BIGINT REFERENCES matieres(id) ON DELETE SET NULL,
    niveau_id BIGINT REFERENCES niveaux(id) ON DELETE SET NULL,
    programme_id BIGINT REFERENCES programmes(id) ON DELETE SET NULL,
    description TEXT,
    duree_lecture INTEGER,
    difficulte INTEGER CHECK (difficulte >= 1 AND difficulte <= 5),
    statut TEXT CHECK (statut IN ('brouillon', 'en_revision', 'publié', 'archivé')) DEFAULT 'brouillon',
    date_creation TIMESTAMP DEFAULT NOW(),
    date_modification TIMESTAMP DEFAULT NOW(),
    date_publication TIMESTAMP,
    auteur_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    revieur_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    commentaire_revue TEXT,
    meta_title TEXT,
    meta_description TEXT,
    version INTEGER DEFAULT 1
);

-- 6. Table SECTIONS
CREATE TABLE IF NOT EXISTS sections (
    id BIGSERIAL PRIMARY KEY,
    cours_id BIGINT REFERENCES cours(id) ON DELETE CASCADE NOT NULL,
    titre TEXT NOT NULL,
    type TEXT CHECK (type IN ('definition', 'propriete', 'exemple', 'methode', 'remarque')),
    ordre INTEGER NOT NULL,
    contenu_texte TEXT,
    parent_section_id BIGINT REFERENCES sections(id) ON DELETE SET NULL
);

-- 7. Table FORMULES
CREATE TABLE IF NOT EXISTS formules (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    latex_source TEXT NOT NULL,
    display_mode BOOLEAN DEFAULT false,
    position INTEGER,
    legende TEXT
);

-- 8. Table MEDIAS
CREATE TABLE IF NOT EXISTS medias (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('image', 'video', 'document')) NOT NULL,
    url TEXT NOT NULL,
    nom_fichier TEXT,
    alt_text TEXT,
    legende TEXT,
    position INTEGER,
    largeur INTEGER,
    hauteur INTEGER,
    uploader_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_upload TIMESTAMP DEFAULT NOW()
);

-- 9. Table HISTORIQUE_VERSIONS
CREATE TABLE IF NOT EXISTS historique_versions (
    id BIGSERIAL PRIMARY KEY,
    cours_id BIGINT REFERENCES cours(id) ON DELETE CASCADE NOT NULL,
    version_numero INTEGER NOT NULL,
    contenu_snapshot JSONB,
    auteur_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    commentaire TEXT,
    date_version TIMESTAMP DEFAULT NOW(),
    diff_json JSONB
);

-- =====================================================
-- INDEXES POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cours_auteur ON cours(auteur_id);
CREATE INDEX IF NOT EXISTS idx_cours_statut ON cours(statut);
CREATE INDEX IF NOT EXISTS idx_cours_slug ON cours(slug);
CREATE INDEX IF NOT EXISTS idx_cours_matiere ON cours(matiere_id);
CREATE INDEX IF NOT EXISTS idx_cours_niveau ON cours(niveau_id);
CREATE INDEX IF NOT EXISTS idx_sections_cours ON sections(cours_id, ordre);
CREATE INDEX IF NOT EXISTS idx_formules_section ON formules(section_id);
CREATE INDEX IF NOT EXISTS idx_medias_section ON medias(section_id);
CREATE INDEX IF NOT EXISTS idx_historique_cours ON historique_versions(cours_id, version_numero DESC);
CREATE INDEX IF NOT EXISTS idx_programmes_niveau ON programmes(niveau_id);
CREATE INDEX IF NOT EXISTS idx_programmes_matiere ON programmes(matiere_id);

-- =====================================================
-- TRIGGER POUR DATE MODIFICATION AUTOMATIQUE
-- =====================================================

CREATE OR REPLACE FUNCTION update_cours_modification_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cours_modification
    BEFORE UPDATE ON cours
    FOR EACH ROW
    EXECUTE FUNCTION update_cours_modification_date();

-- =====================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE formules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_versions ENABLE ROW LEVEL SECURITY;

-- Policies: Tous les utilisateurs authentifiés peuvent lire les données de référence
CREATE POLICY "Tous peuvent lire matieres" ON matieres FOR SELECT USING (true);
CREATE POLICY "Tous peuvent lire niveaux" ON niveaux FOR SELECT USING (true);
CREATE POLICY "Tous peuvent lire programmes" ON programmes FOR SELECT USING (true);

-- Policies: Accès complet pour les admins (à implémenter avec auth)
-- Note: Ces policies doivent être adaptées selon votre système d'authentification
CREATE POLICY "Admins peuvent tout faire sur utilisateurs" ON utilisateurs FOR ALL USING (true);
CREATE POLICY "Tous peuvent lire utilisateurs" ON utilisateurs FOR SELECT USING (true);

-- Policies: Cours - Les éditeurs peuvent voir et modifier
CREATE POLICY "Tous peuvent lire cours" ON cours FOR SELECT USING (true);
CREATE POLICY "Éditeurs peuvent créer cours" ON cours FOR INSERT WITH CHECK (true);
CREATE POLICY "Auteurs peuvent modifier leurs cours" ON cours FOR UPDATE USING (true);

-- Policies: Sections, Formules, Medias - Liées aux cours
CREATE POLICY "Tous peuvent lire sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Éditeurs peuvent gérer sections" ON sections FOR ALL USING (true);

CREATE POLICY "Tous peuvent lire formules" ON formules FOR SELECT USING (true);
CREATE POLICY "Éditeurs peuvent gérer formules" ON formules FOR ALL USING (true);

CREATE POLICY "Tous peuvent lire medias" ON medias FOR SELECT USING (true);
CREATE POLICY "Éditeurs peuvent gérer medias" ON medias FOR ALL USING (true);

CREATE POLICY "Tous peuvent lire historique" ON historique_versions FOR SELECT USING (true);
CREATE POLICY "Système peut créer historique" ON historique_versions FOR INSERT WITH CHECK (true);