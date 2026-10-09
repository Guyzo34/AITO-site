-- ============================================================
--  MIA Montpellier -- Schema Supabase PostgreSQL
--  Copier-coller ce script dans : Supabase > SQL Editor > New query
-- ============================================================

-- ── MEMBRES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membres (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom              text NOT NULL,
  prenom           text NOT NULL,
  email            text UNIQUE,
  telephone        text,
  formule          text NOT NULL DEFAULT 'Adherent',  -- Adherent | Soutien | Etudiant | Honneur
  date_adhesion    date DEFAULT CURRENT_DATE,
  statut_cotisation text DEFAULT 'en_attente',        -- paye | en_attente | exonere
  montant          numeric(8,2) DEFAULT 30,
  notes            text,
  created_at       timestamptz DEFAULT now()
);

-- ── EVENEMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evenements (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mois             int NOT NULL CHECK (mois BETWEEN 1 AND 12),
  titre            text NOT NULL,
  statut           text DEFAULT 'planifie',           -- planifie | en_cours | termine
  responsable      text,
  budget_alloue    numeric(10,2) DEFAULT 0,
  budget_depense   numeric(10,2) DEFAULT 0,
  notes            text,
  created_at       timestamptz DEFAULT now()
);

-- ── PV DE REUNION ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pv_reunions (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre            text NOT NULL,
  date_reunion     date NOT NULL,
  presents         text,
  ordre_du_jour    text,
  decisions        text,
  created_by       uuid REFERENCES auth.users(id),
  created_at       timestamptz DEFAULT now()
);

-- ── ACTUALITES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actualites (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre            text NOT NULL,
  contenu          text NOT NULL,
  categorie        text DEFAULT 'Annonce',
  date_publication date DEFAULT CURRENT_DATE,
  publie           boolean DEFAULT false,
  image_url        text,
  created_by       uuid REFERENCES auth.users(id),
  created_at       timestamptz DEFAULT now()
);

-- ── FINANCES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finances (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type             text NOT NULL CHECK (type IN ('recette','depense')),
  categorie        text NOT NULL,
  montant          numeric(10,2) NOT NULL,
  date_operation   date DEFAULT CURRENT_DATE,
  description      text,
  membre_id        uuid REFERENCES membres(id),
  created_by       uuid REFERENCES auth.users(id),
  created_at       timestamptz DEFAULT now()
);

-- ── COURRIERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courriers (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type             text DEFAULT 'Convocation',
  destinataire     text NOT NULL,
  objet            text NOT NULL,
  date_envoi       date DEFAULT CURRENT_DATE,
  statut           text DEFAULT 'envoye',
  created_by       uuid REFERENCES auth.users(id),
  created_at       timestamptz DEFAULT now()
);

-- ── PARTENAIRES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partenaires (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom              text NOT NULL,
  type             text DEFAULT 'Sponsor',
  statut_convention text DEFAULT 'a_signer',          -- a_signer | signe | renouvele
  contact          text,
  montant          numeric(10,2) DEFAULT 0,
  notes            text,
  created_at       timestamptz DEFAULT now()
);

-- ── DEMANDES D'ADHESION ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS demandes_adhesion (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom              text NOT NULL,
  prenom           text NOT NULL,
  email            text NOT NULL,
  telephone        text,
  formule          text DEFAULT 'Adherent',
  message          text,
  statut           text DEFAULT 'en_attente',         -- en_attente | valide | refuse
  created_at       timestamptz DEFAULT now()
);

-- ── CONTACTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom              text NOT NULL,
  email            text NOT NULL,
  sujet            text,
  message          text NOT NULL,
  statut           text DEFAULT 'non_lu',
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE membres              ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pv_reunions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances             ENABLE ROW LEVEL SECURITY;
ALTER TABLE courriers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE partenaires          ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes_adhesion    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts             ENABLE ROW LEVEL SECURITY;

-- EVENEMENTS : lecture publique, ecriture bureau
CREATE POLICY "evenements_public_read"  ON evenements FOR SELECT USING (true);
CREATE POLICY "evenements_auth_write"   ON evenements FOR ALL USING (auth.role() = 'authenticated');

-- ACTUALITES : lecture publique si publie=true, ecriture bureau
CREATE POLICY "actualites_public_read"  ON actualites FOR SELECT USING (publie = true);
CREATE POLICY "actualites_auth_all"     ON actualites FOR ALL USING (auth.role() = 'authenticated');

-- MEMBRES : bureau uniquement
CREATE POLICY "membres_auth_all"        ON membres FOR ALL USING (auth.role() = 'authenticated');

-- FINANCES : bureau uniquement
CREATE POLICY "finances_auth_all"       ON finances FOR ALL USING (auth.role() = 'authenticated');

-- PV : bureau uniquement
CREATE POLICY "pv_auth_all"             ON pv_reunions FOR ALL USING (auth.role() = 'authenticated');

-- COURRIERS : bureau uniquement
CREATE POLICY "courriers_auth_all"      ON courriers FOR ALL USING (auth.role() = 'authenticated');

-- PARTENAIRES : bureau uniquement
CREATE POLICY "partenaires_auth_all"    ON partenaires FOR ALL USING (auth.role() = 'authenticated');

-- DEMANDES ADHESION : insert public, lecture bureau
CREATE POLICY "demandes_public_insert"  ON demandes_adhesion FOR INSERT WITH CHECK (true);
CREATE POLICY "demandes_auth_read"      ON demandes_adhesion FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "demandes_auth_update"    ON demandes_adhesion FOR UPDATE USING (auth.role() = 'authenticated');

-- CONTACTS : insert public, lecture bureau
CREATE POLICY "contacts_public_insert"  ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_auth_read"      ON contacts FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
--  DONNEES INITIALES (evenements 2026)
-- ============================================================
INSERT INTO evenements (mois, titre, statut, responsable, budget_alloue) VALUES
  (1,  'Assemblee Generale',              'termine',   'Bureau complet',       190),
  (2,  'Conference Montpellier-Ivoire',   'termine',   'VP & Commission',      150),
  (3,  'Brunch de printemps',             'termine',   'Commission Accueil',   120),
  (4,  'Sortie nature & randonnee',       'en_cours',  'Vice-President',        80),
  (5,  'Tournoi sportif MIA',             'en_cours',  'Commission Sport',     200),
  (6,  'Soiree Cuisine Ivoirienne',       'planifie',  'A designer',           180),
  (8,  'Fete de l''Independance CI',      'planifie',  'Bureau complet',      2150),
  (9,  'Rentree des membres',             'planifie',  'Secretaire',           100),
  (10, 'Conference partenaires',          'planifie',  'A designer',           150),
  (11, 'Soiree des Talents MIA',          'planifie',  'Commission Culture',   220),
  (12, 'Fete de fin d''annee',            'planifie',  'A designer',           300);

INSERT INTO partenaires (nom, type, statut_convention, montant) VALUES
  ('Orange Money Europe', 'Sponsor', 'signe',    500),
  ('Waabeme',             'Sponsor', 'a_signer',   0),
  ('Le Maquis',           'Partenaire', 'a_signer', 0),
  ('Maison des Francophones', 'Institutionnel', 'signe', 0);
