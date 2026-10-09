-- ============================================================
--  AIMH — Amicale des Ivoiriens de Montpellier Hérault
--  Schéma Supabase PostgreSQL — Partie 1/2 : Structure & Seed
--
--  Ordre d'exécution :
--    1. Ce fichier (aimh-01-schema.sql)
--    2. Puis aimh-02-rls.sql (politiques de sécurité)
--
--  À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ============================================================
--  PARTIE 0 — RESET (tables vides, donc destructif sans risque)
--  ATTENTION : si tu as ajouté des données depuis, sauvegarde avant.
-- ============================================================
DROP TABLE IF EXISTS contacts                CASCADE;
DROP TABLE IF EXISTS demandes_adhesion       CASCADE;
DROP TABLE IF EXISTS partenaires             CASCADE;
DROP TABLE IF EXISTS courriers               CASCADE;
DROP TABLE IF EXISTS finances                CASCADE;
DROP TABLE IF EXISTS actualites              CASCADE;
DROP TABLE IF EXISTS pv_reunions             CASCADE;
DROP TABLE IF EXISTS evenements              CASCADE;
DROP TABLE IF EXISTS propositions            CASCADE;
DROP TABLE IF EXISTS commissariats_membres   CASCADE;
DROP TABLE IF EXISTS commissariats           CASCADE;
DROP TABLE IF EXISTS membres                 CASCADE;
DROP TABLE IF EXISTS profils                 CASCADE;

DROP FUNCTION IF EXISTS public.current_user_role()        CASCADE;
DROP FUNCTION IF EXISTS public.is_admin()                 CASCADE;
DROP FUNCTION IF EXISTS public.is_bureau()                CASCADE;
DROP FUNCTION IF EXISTS public.is_chef_pole(text)         CASCADE;
DROP FUNCTION IF EXISTS public.is_membre_pole(text)       CASCADE;

-- ============================================================
--  PARTIE 1 — PROFILS (lié à auth.users)
-- ============================================================
--  La table profils étend auth.users de Supabase avec les infos
--  applicatives (rôle, nom, prénom). Le pattern recommandé par
--  Supabase est de NE PAS stocker ces infos dans auth.users
--  directement (qui est géré par Supabase).
-- ============================================================
CREATE TABLE profils (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text UNIQUE NOT NULL,
  prenom        text,
  nom           text,
  telephone     text,
  role          text NOT NULL DEFAULT 'membre'
                CHECK (role IN ('admin','president','vicepresident',
                                'secretaire','tresorier','commissaire','membre')),
  avatar_url    text,
  actif         boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_profils_role ON profils(role);

-- Trigger : créer automatiquement un profil quand un user s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profils (id, email, prenom, nom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'membre')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
--  PARTIE 2 — COMMISSARIATS (les 6 pôles thématiques)
-- ============================================================
CREATE TABLE commissariats (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text UNIQUE NOT NULL,
  nom           text NOT NULL,
  description   text,
  emoji         text,
  couleur       text,                            -- code hex #XXXXXX
  page_publique text,                            -- ex: 'commissariat-culture.html'
  actif         boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Seed : les 6 pôles définis dans le frontend
INSERT INTO commissariats (slug, nom, description, emoji, couleur, page_publique) VALUES
  ('culture',    'Culture',                      'Promotion de la culture ivoirienne',           '🎭', '#7C3AED', 'commissariat-culture.html'),
  ('relations',  'Relations & Communication',    'Relations extérieures, partenariats',          '🤝', '#1d4ed8', 'commissariat-relations.html'),
  ('solidarite', 'Solidarité',                   'Aides, soutien, fonds de solidarité',          '🤲', '#059669', 'commissariat-solidarite.html'),
  ('etudiants',  'Étudiants',                    'Accompagnement des étudiants ivoiriens',       '🎓', '#F77F00', 'commissariat-etudiants.html'),
  ('loisirs',    'Loisirs & Détente',            'Animations, sorties, détente',                 '🎉', '#0891b2', 'commissariat-loisirs.html'),
  ('projets',    'Projets',                      'Projets à impact, montage et suivi',           '📊', '#b45309', 'commissariat-projets.html');

-- ============================================================
--  PARTIE 3 — COMMISSARIATS_MEMBRES (hiérarchie chef / membre)
-- ============================================================
--  Liaison N-N entre profils et commissariats avec un booléen
--  chef pour la hiérarchie. Contrainte : un seul chef par
--  commissariat (gérée par index unique partiel).
-- ============================================================
CREATE TABLE commissariats_membres (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profil_id       uuid NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  commissariat_id uuid NOT NULL REFERENCES commissariats(id) ON DELETE CASCADE,
  chef            boolean DEFAULT false,
  date_arrivee    date DEFAULT CURRENT_DATE,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (profil_id, commissariat_id)            -- pas de doublon user/pôle
);

-- Un seul chef par commissariat (index unique partiel)
CREATE UNIQUE INDEX idx_one_chef_per_commissariat
  ON commissariats_membres (commissariat_id) WHERE chef = true;

CREATE INDEX idx_commissariats_membres_profil ON commissariats_membres(profil_id);

-- ============================================================
--  PARTIE 4 — PROPOSITIONS (workflow chef-valide-membre)
-- ============================================================
--  Quand un membre fait une proposition (activité, dépense,
--  événement), elle entre en statut "en_attente". Le chef de
--  pôle peut la valider ou la refuser.
-- ============================================================
CREATE TABLE propositions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  commissariat_id uuid NOT NULL REFERENCES commissariats(id) ON DELETE CASCADE,
  auteur_id       uuid NOT NULL REFERENCES profils(id) ON DELETE SET NULL,
  type            text NOT NULL CHECK (type IN ('activite','depense','evenement','autre')),
  titre           text NOT NULL,
  description     text,
  budget_estime   numeric(10,2) DEFAULT 0,
  statut          text DEFAULT 'en_attente'
                  CHECK (statut IN ('en_attente','validee','refusee','realisee')),
  decision_par    uuid REFERENCES profils(id),
  decision_date   timestamptz,
  decision_motif  text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_propositions_commissariat ON propositions(commissariat_id);
CREATE INDEX idx_propositions_statut       ON propositions(statut);

-- ============================================================
--  PARTIE 5 — TABLES MÉTIER EXISTANTES (réécrites proprement)
-- ============================================================

-- ── MEMBRES de l'association (≠ profils utilisateur)
--    Un membre peut exister sans être utilisateur du site
--    (cotisation papier, etc.)
CREATE TABLE membres (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom               text NOT NULL,
  prenom            text NOT NULL,
  email             text UNIQUE,
  telephone         text,
  formule           text NOT NULL DEFAULT 'Adherent',
                    -- Adherent | Soutien | Etudiant | Honneur
  date_adhesion     date DEFAULT CURRENT_DATE,
  statut_cotisation text DEFAULT 'en_attente',
                    -- paye | en_attente | exonere
  montant           numeric(8,2) DEFAULT 30,
  notes             text,
  profil_id         uuid REFERENCES profils(id),  -- lien optionnel
  created_at        timestamptz DEFAULT now()
);

-- ── EVENEMENTS
CREATE TABLE evenements (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mois            int NOT NULL CHECK (mois BETWEEN 1 AND 12),
  annee           int NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  titre           text NOT NULL,
  description     text,
  statut          text DEFAULT 'planifie',
                  -- planifie | en_cours | termine | annule
  responsable     text,
  commissariat_id uuid REFERENCES commissariats(id),  -- pôle organisateur
  budget_alloue   numeric(10,2) DEFAULT 0,
  budget_depense  numeric(10,2) DEFAULT 0,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

-- ── PV DE REUNION
CREATE TABLE pv_reunions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre         text NOT NULL,
  date_reunion  date NOT NULL,
  presents      text,
  ordre_du_jour text,
  decisions     text,
  pdf_url       text,
  created_by    uuid REFERENCES profils(id),
  created_at    timestamptz DEFAULT now()
);

-- ── ACTUALITES
CREATE TABLE actualites (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre            text NOT NULL,
  contenu          text NOT NULL,
  categorie        text DEFAULT 'Annonce',
  date_publication date DEFAULT CURRENT_DATE,
  publie           boolean DEFAULT false,
  image_url        text,
  created_by       uuid REFERENCES profils(id),
  created_at       timestamptz DEFAULT now()
);

-- ── FINANCES
CREATE TABLE finances (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type            text NOT NULL CHECK (type IN ('recette','depense')),
  categorie       text NOT NULL,
  montant         numeric(10,2) NOT NULL,
  date_operation  date DEFAULT CURRENT_DATE,
  description     text,
  membre_id       uuid REFERENCES membres(id),
  commissariat_id uuid REFERENCES commissariats(id),
  proposition_id  uuid REFERENCES propositions(id),
  created_by      uuid REFERENCES profils(id),
  created_at      timestamptz DEFAULT now()
);

-- ── COURRIERS
CREATE TABLE courriers (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type         text DEFAULT 'Convocation',
  destinataire text NOT NULL,
  objet        text NOT NULL,
  contenu      text,
  date_envoi   date DEFAULT CURRENT_DATE,
  statut       text DEFAULT 'envoye',
  created_by   uuid REFERENCES profils(id),
  created_at   timestamptz DEFAULT now()
);

-- ── PARTENAIRES
CREATE TABLE partenaires (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom               text NOT NULL,
  type              text DEFAULT 'Sponsor',
  statut_convention text DEFAULT 'a_signer',
  contact           text,
  email             text,
  telephone         text,
  montant           numeric(10,2) DEFAULT 0,
  notes             text,
  logo_url          text,
  created_at        timestamptz DEFAULT now()
);

-- ── DEMANDES D'ADHESION (formulaire public)
CREATE TABLE demandes_adhesion (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom         text NOT NULL,
  prenom      text NOT NULL,
  email       text NOT NULL,
  telephone   text,
  formule     text DEFAULT 'Adherent',
  message     text,
  statut      text DEFAULT 'en_attente',
              -- en_attente | valide | refuse
  traite_par  uuid REFERENCES profils(id),
  traite_date timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- ── CONTACTS (formulaire public)
CREATE TABLE contacts (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        text NOT NULL,
  email      text NOT NULL,
  sujet      text,
  message    text NOT NULL,
  statut     text DEFAULT 'non_lu',
             -- non_lu | lu | traite
  lu_par     uuid REFERENCES profils(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
--  PARTIE 6 — FONCTIONS HELPER (utilisées par les politiques RLS)
-- ============================================================

-- Récupère le rôle de l'utilisateur authentifié actuel
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role FROM profils WHERE id = auth.uid()
$$;

-- True si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT current_user_role() = 'admin'
$$;

-- True si l'utilisateur fait partie du bureau (large : admin + 4 rôles bureau)
CREATE OR REPLACE FUNCTION public.is_bureau()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT current_user_role() IN ('admin','president','vicepresident','secretaire','tresorier')
$$;

-- True si l'utilisateur est chef du pôle dont le slug est passé en paramètre
CREATE OR REPLACE FUNCTION public.is_chef_pole(p_slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM commissariats_membres cm
    JOIN commissariats c ON c.id = cm.commissariat_id
    WHERE cm.profil_id = auth.uid()
      AND c.slug = p_slug
      AND cm.chef = true
  )
$$;

-- True si l'utilisateur est membre (chef ou non) du pôle slug
CREATE OR REPLACE FUNCTION public.is_membre_pole(p_slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM commissariats_membres cm
    JOIN commissariats c ON c.id = cm.commissariat_id
    WHERE cm.profil_id = auth.uid()
      AND c.slug = p_slug
  )
$$;

-- ============================================================
--  FIN PARTIE 1 — Vérification
--  Après exécution, lance ces requêtes pour vérifier :
--
--    SELECT * FROM commissariats;
--      -- doit retourner 6 lignes
--
--    SELECT table_name FROM information_schema.tables
--      WHERE table_schema = 'public' ORDER BY table_name;
--      -- doit lister 12 tables
--
--    SELECT proname FROM pg_proc
--      WHERE pronamespace = 'public'::regnamespace
--      AND proname LIKE 'is_%' OR proname = 'current_user_role';
--      -- doit lister 5 fonctions
-- ============================================================
