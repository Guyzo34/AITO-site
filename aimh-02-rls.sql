-- ============================================================
--  AIMH — Politiques de sécurité (Row Level Security)
--  Partie 2/2 : RLS différencié par rôle
--
--  À exécuter APRÈS aimh-01-schema.sql
--  Et seulement après avoir vérifié que les tables sont créées
--  et que tu as au moins un compte admin créé dans Supabase Auth.
-- ============================================================

-- ============================================================
--  RAPPEL DES RÔLES (de plus large à plus restreint)
--    admin              → tous droits (technique)
--    president          → tous droits métier
--    vicepresident      → quasi tous droits, sauf certaines validations
--    secretaire         → lecture totale, écriture sur PV/courriers/membres
--    tresorier          → lecture totale, écriture sur finances
--    commissaire (chef) → écriture sur SON pôle uniquement
--    commissaire        → propose dans SON pôle, lit
--    membre             → lit ce qui est public
-- ============================================================

-- ============================================================
--  ACTIVATION RLS sur toutes les tables
-- ============================================================
ALTER TABLE profils                ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissariats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissariats_membres  ENABLE ROW LEVEL SECURITY;
ALTER TABLE propositions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE membres                ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pv_reunions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualites             ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances               ENABLE ROW LEVEL SECURITY;
ALTER TABLE courriers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE partenaires            ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes_adhesion      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts               ENABLE ROW LEVEL SECURITY;

-- ============================================================
--  PROFILS : un user voit son propre profil + bureau voit tout
-- ============================================================
CREATE POLICY profils_self_read   ON profils
  FOR SELECT USING (id = auth.uid() OR is_bureau());

CREATE POLICY profils_self_update ON profils
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profils WHERE id = auth.uid()));
  -- un user peut modifier son profil mais PAS son propre rôle

CREATE POLICY profils_admin_all   ON profils
  FOR ALL USING (is_admin());

CREATE POLICY profils_bureau_role_change ON profils
  FOR UPDATE USING (current_user_role() IN ('president','admin'));
  -- seuls admin et président peuvent changer le rôle des autres

-- ============================================================
--  COMMISSARIATS : lecture publique (vitrine), écriture admin/président
-- ============================================================
CREATE POLICY commissariats_public_read ON commissariats
  FOR SELECT USING (true);

CREATE POLICY commissariats_admin_write ON commissariats
  FOR ALL USING (current_user_role() IN ('admin','president'));

-- ============================================================
--  COMMISSARIATS_MEMBRES : visibilité limitée
--    - Le membre voit son équipe (les autres membres de son pôle)
--    - Le bureau voit tout
--    - Le chef de pôle peut ajouter/retirer des membres de SON pôle
--    - L'admin et le président peuvent tout modifier
-- ============================================================
CREATE POLICY cm_self_team_read ON commissariats_membres
  FOR SELECT USING (
    is_bureau()
    OR EXISTS (
      SELECT 1 FROM commissariats_membres cm2
      WHERE cm2.profil_id = auth.uid()
        AND cm2.commissariat_id = commissariats_membres.commissariat_id
    )
  );

CREATE POLICY cm_chef_manage ON commissariats_membres
  FOR ALL USING (
    current_user_role() IN ('admin','president')
    OR EXISTS (
      SELECT 1 FROM commissariats_membres cm2
      JOIN commissariats c ON c.id = cm2.commissariat_id
      WHERE cm2.profil_id = auth.uid()
        AND cm2.chef = true
        AND cm2.commissariat_id = commissariats_membres.commissariat_id
    )
  );

-- ============================================================
--  PROPOSITIONS : workflow chef-valide-membre
--    - Lecture : membres du pôle + bureau
--    - Insert : membres du pôle (statut forcé à en_attente)
--    - Update : chef du pôle ou bureau (pour valider/refuser)
-- ============================================================
CREATE POLICY propositions_pole_read ON propositions
  FOR SELECT USING (
    is_bureau()
    OR EXISTS (
      SELECT 1 FROM commissariats_membres cm
      WHERE cm.profil_id = auth.uid()
        AND cm.commissariat_id = propositions.commissariat_id
    )
  );

CREATE POLICY propositions_pole_insert ON propositions
  FOR INSERT WITH CHECK (
    auteur_id = auth.uid()
    AND statut = 'en_attente'
    AND EXISTS (
      SELECT 1 FROM commissariats_membres cm
      WHERE cm.profil_id = auth.uid()
        AND cm.commissariat_id = propositions.commissariat_id
    )
  );

CREATE POLICY propositions_chef_decide ON propositions
  FOR UPDATE USING (
    is_bureau()
    OR EXISTS (
      SELECT 1 FROM commissariats_membres cm
      WHERE cm.profil_id = auth.uid()
        AND cm.commissariat_id = propositions.commissariat_id
        AND cm.chef = true
    )
  );

-- ============================================================
--  MEMBRES : bureau lit/écrit, le membre voit sa propre fiche
-- ============================================================
CREATE POLICY membres_bureau_all ON membres
  FOR ALL USING (is_bureau());

CREATE POLICY membres_self_read ON membres
  FOR SELECT USING (profil_id = auth.uid());

-- ============================================================
--  EVENEMENTS : lecture publique, écriture bureau
-- ============================================================
CREATE POLICY evenements_public_read ON evenements
  FOR SELECT USING (true);

CREATE POLICY evenements_bureau_write ON evenements
  FOR ALL USING (is_bureau());

-- ============================================================
--  PV DE REUNION : lecture authentifié, écriture secrétaire/président/admin
-- ============================================================
CREATE POLICY pv_auth_read ON pv_reunions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY pv_secretaire_write ON pv_reunions
  FOR ALL USING (current_user_role() IN ('admin','president','secretaire'));

-- ============================================================
--  ACTUALITES : lecture publique si publié, écriture bureau
-- ============================================================
CREATE POLICY actualites_public_read ON actualites
  FOR SELECT USING (publie = true OR is_bureau());

CREATE POLICY actualites_bureau_write ON actualites
  FOR ALL USING (is_bureau());

-- ============================================================
--  FINANCES : lecture bureau (sensible), écriture trésorier/président/admin
--  Justification : un secrétaire peut lire mais pas modifier les finances
-- ============================================================
CREATE POLICY finances_bureau_read ON finances
  FOR SELECT USING (is_bureau());

CREATE POLICY finances_tresorier_write ON finances
  FOR ALL USING (current_user_role() IN ('admin','president','tresorier'));

-- ============================================================
--  COURRIERS : lecture bureau, écriture secrétaire/président/admin
-- ============================================================
CREATE POLICY courriers_bureau_read ON courriers
  FOR SELECT USING (is_bureau());

CREATE POLICY courriers_secretaire_write ON courriers
  FOR ALL USING (current_user_role() IN ('admin','president','secretaire'));

-- ============================================================
--  PARTENAIRES : lecture publique, écriture bureau
-- ============================================================
CREATE POLICY partenaires_public_read ON partenaires
  FOR SELECT USING (true);

CREATE POLICY partenaires_bureau_write ON partenaires
  FOR ALL USING (is_bureau());

-- ============================================================
--  DEMANDES D'ADHESION : insert public (formulaire), lecture/édit bureau
-- ============================================================
CREATE POLICY demandes_public_insert ON demandes_adhesion
  FOR INSERT WITH CHECK (true);

CREATE POLICY demandes_bureau_all ON demandes_adhesion
  FOR ALL USING (is_bureau());

-- ============================================================
--  CONTACTS : insert public (formulaire), lecture/édit bureau
-- ============================================================
CREATE POLICY contacts_public_insert ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY contacts_bureau_all ON contacts
  FOR ALL USING (is_bureau());

-- ============================================================
--  FIN PARTIE 2
--
--  IMPORTANT — TEST DE SÉCURITÉ POST-DÉPLOIEMENT
--
--  1. Crée un compte admin via Supabase Dashboard > Authentication
--     puis : UPDATE profils SET role = 'admin' WHERE email = 'ton@email';
--
--  2. Teste avec un compte non-bureau que tu ne peux PAS faire :
--     SELECT * FROM finances;  -- doit échouer ou retourner []
--     SELECT * FROM membres;   -- doit échouer ou retourner [self]
--
--  3. Si une politique te bloque alors qu'elle ne devrait pas,
--     tu peux la supprimer ainsi :
--       DROP POLICY nom_de_la_politique ON nom_table;
--     puis la recréer avec la bonne logique.
-- ============================================================
