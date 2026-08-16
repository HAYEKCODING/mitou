-- ============================================
-- SCHÉMA BASE DE DONNÉES — COUL PROTHÈSE DENTAIRE
-- ============================================

CREATE DATABASE IF NOT EXISTS coul_dentaire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coul_dentaire;

-- ============================================
-- Table : admin_users
-- Comptes autorisés à gérer le contenu du site
-- ============================================
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table : prestations
-- Catégories de services proposés par le cabinet
-- ============================================
CREATE TABLE prestations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(150) NOT NULL,                 -- ex: "Remplacement de dent"
  slug VARCHAR(150) UNIQUE NOT NULL,         -- ex: "remplacement-dent"
  description TEXT,
  icone VARCHAR(50) DEFAULT '🦷',            -- emoji ou nom d'icône
  type_tarification ENUM('flat', 'palier_unitaire', 'palier_forfait', 'fourchette') NOT NULL,
  
  prix_flat INT NULL,                        -- utilisé si type = flat
  prix_min INT NULL,                         -- utilisé si type = fourchette
  prix_max INT NULL,                         -- utilisé si type = fourchette
  necessite_meme_cote BOOLEAN DEFAULT FALSE, -- contrainte "même côté haut/bas"
  image VARCHAR(255),
  ordre_affichage INT DEFAULT 0,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Table : paliers_tarifaires
-- Tranches de prix pour les prestations à quantité variable
-- ============================================
CREATE TABLE paliers_tarifaires (
  id INT PRIMARY KEY AUTO_INCREMENT,
  prestation_id INT NOT NULL,
  dents_min INT NOT NULL,                    -- ex: 1
  dents_max INT NOT NULL,                    -- ex: 3
  prix_unitaire INT NULL,                    -- ex: 8000 (si palier_unitaire : prix x nb dents)
  prix_forfait INT NULL,                     -- ex: 5000 (si palier_forfait : prix fixe de la tranche)
  ordre INT DEFAULT 0,
  FOREIGN KEY (prestation_id) REFERENCES prestations(id) ON DELETE CASCADE
);

-- ============================================
-- Table : demandes
-- Demandes de service envoyées par les visiteurs du site
-- ============================================
CREATE TABLE demandes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom_client VARCHAR(150) NOT NULL,
  telephone VARCHAR(30) NOT NULL,
  prestation_id INT NOT NULL,
  nombre_dents INT NULL,                     -- si applicable
  position_dents ENUM('haut', 'bas') NULL,   -- si applicable (remplacement)
  etat_carie ENUM('legere', 'avancee') NULL, -- si prestation = soin carie
  prix_estime_min INT NULL,
  prix_estime_max INT NULL,
  date_souhaitee DATE NULL,
  message TEXT NULL,
  statut ENUM('en_attente', 'confirme', 'termine', 'annule') DEFAULT 'en_attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prestation_id) REFERENCES prestations(id)
);


CREATE TABLE galerie (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(150) NOT NULL,               -- ex: "Blanchiment dentaire"
  image_avant VARCHAR(255) NOT NULL,
  image_apres VARCHAR(255) NOT NULL,
  prestation_id INT NULL,
  ordre_affichage INT DEFAULT 0,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prestation_id) REFERENCES prestations(id) ON DELETE SET NULL
);

-- ============================================
-- DONNÉES INITIALES — Prestations
-- ============================================
INSERT INTO prestations (nom, slug, description, icone, type_tarification, prix_flat, prix_min, prix_max, necessite_meme_cote, ordre_affichage) VALUES
('Remplacement de dent', 'remplacement-dent', 'Remplacement d''une ou plusieurs dents, haut ou bas', '🦷', 'palier_unitaire', NULL, NULL, NULL, TRUE, 1),
('Soin d''une carie', 'soin-carie', 'Traitement selon l''état de la dent', '🩹', 'fourchette', NULL, 10000, 15000, FALSE, 2),
('Carie avancée (extraction + remplacement)', 'carie-avancee', 'Extraction et remplacement si la carie est trop avancée', '🦷', 'palier_unitaire', NULL, NULL, NULL, FALSE, 3),
('Réparation prothèse cassée', 'reparation-prothese', 'Réparation forfaitaire selon le nombre de dents concernées', '🔧', 'palier_forfait', NULL, NULL, NULL, FALSE, 4),
('Blanchiment dentaire', 'blanchiment', 'Traitement de blanchiment professionnel', '✨', 'flat', 15000, NULL, NULL, FALSE, 5),
('Détartrage', 'detartrage', 'Nettoyage professionnel en profondeur', '🪥', 'flat', 20000, NULL, NULL, FALSE, 6),
('Ajustage de dent', 'ajustage-dent', 'Réglage précis pour un confort optimal', '⚙️', 'flat', NULL, NULL, NULL, FALSE, 7),
('Dent en fer couleur or', 'dent-fer-or', 'Prothèse métallique dorée, esthétique et résistante', '🥇', 'flat', NULL, NULL, NULL, FALSE, 8);

-- ============================================
-- DONNÉES INITIALES — Paliers tarifaires
-- ============================================

-- Remplacement de dent (id = 1) : palier_unitaire, prix/dent selon tranche
INSERT INTO paliers_tarifaires (prestation_id, dents_min, dents_max, prix_unitaire, ordre) VALUES
(1, 1, 3, 8000, 1),
(1, 4, 6, 7000, 2),
(1, 7, 9, 6000, 3),
(1, 10, 14, 5000, 4);

-- Carie avancée (id = 3) : palier_unitaire, prix fixe/dent
INSERT INTO paliers_tarifaires (prestation_id, dents_min, dents_max, prix_unitaire, ordre) VALUES
(3, 1, 14, 13000, 1);


INSERT INTO paliers_tarifaires (prestation_id, dents_min, dents_max, prix_forfait, ordre) VALUES
(4, 1, 5, 5000, 1),
(4, 6, 10, 10000, 2),
(4, 11, 14, 15000, 3);
