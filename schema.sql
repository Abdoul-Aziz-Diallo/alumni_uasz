CREATE DATABASE IF NOT EXISTS alumni_uasz CHARACTER SET utf8mb4;
USE alumni_uasz;
CREATE TABLE utilisateur(id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(80) NOT NULL, prenom VARCHAR(80) NOT NULL,
 email VARCHAR(120) UNIQUE NOT NULL, mot_de_passe VARCHAR(255) NOT NULL, statut ENUM('actif','desactive') DEFAULT 'actif',
 role ENUM('alumni','enseignant','coordinateur_master','responsable_filiere','chef_departement') NOT NULL);
CREATE TABLE promotion(code VARCHAR(20) PRIMARY KEY, annee INT, filiere VARCHAR(80));
CREATE TABLE diplome(id INT AUTO_INCREMENT PRIMARY KEY, intitule VARCHAR(120), annee_obtention INT);
CREATE TABLE alumni(utilisateur_id INT PRIMARY KEY, telephone VARCHAR(30), adresse VARCHAR(200), annee_entree INT, annee_sortie INT,
 filiere VARCHAR(80), promotion_code VARCHAR(20), diplome_id INT,
 FOREIGN KEY(utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
 FOREIGN KEY(promotion_code) REFERENCES promotion(code), FOREIGN KEY(diplome_id) REFERENCES diplome(id));
CREATE TABLE enseignant(utilisateur_id INT PRIMARY KEY, grade_academique VARCHAR(60), domaine_enseignement VARCHAR(100), statut VARCHAR(40),
 coordonnees VARCHAR(150), date_prise_fonction DATE, filiere_master VARCHAR(80), perimetre_supervision VARCHAR(150),
 date_debut_mandat DATE, date_fin_mandat DATE, niveau_droits_admin VARCHAR(40),
 FOREIGN KEY(utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE);
CREATE TABLE entreprise(id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(120) UNIQUE NOT NULL, secteur_activite VARCHAR(100), adresse VARCHAR(200));
CREATE TABLE stage(id INT AUTO_INCREMENT PRIMARY KEY, alumni_id INT NOT NULL, entreprise_id INT NOT NULL, date_debut DATE, date_fin DATE,
 poste_occupe VARCHAR(100), description TEXT, FOREIGN KEY(alumni_id) REFERENCES alumni(utilisateur_id) ON DELETE CASCADE,
 FOREIGN KEY(entreprise_id) REFERENCES entreprise(id));
CREATE TABLE emploi(id INT AUTO_INCREMENT PRIMARY KEY, alumni_id INT NOT NULL, entreprise_id INT NOT NULL, date_debut DATE, date_fin DATE,
 fonction_occupee VARCHAR(100), type_contrat VARCHAR(40), FOREIGN KEY(alumni_id) REFERENCES alumni(utilisateur_id) ON DELETE CASCADE,
 FOREIGN KEY(entreprise_id) REFERENCES entreprise(id));
CREATE TABLE activite(id INT AUTO_INCREMENT PRIMARY KEY, titre VARCHAR(150) NOT NULL, description TEXT, date DATE NOT NULL, lieu VARCHAR(150) NOT NULL,
 createur_id INT, FOREIGN KEY(createur_id) REFERENCES utilisateur(id));
CREATE TABLE participation_activite(id INT AUTO_INCREMENT PRIMARY KEY, alumni_id INT NOT NULL, activite_id INT NOT NULL,
 date_inscription DATE, presence BOOLEAN DEFAULT FALSE, UNIQUE(alumni_id,activite_id),
 FOREIGN KEY(alumni_id) REFERENCES alumni(utilisateur_id) ON DELETE CASCADE, FOREIGN KEY(activite_id) REFERENCES activite(id) ON DELETE CASCADE);
CREATE TABLE rapport(id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(20), date_generation DATETIME, contenu TEXT, genere_par INT,
 FOREIGN KEY(genere_par) REFERENCES utilisateur(id));
