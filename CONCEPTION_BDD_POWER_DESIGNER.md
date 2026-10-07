# CONCEPTION COMPLÈTE DE LA BASE DE DONNÉES - NIO-FAR
## Guide Power Designer : MCD → MPD → Script SQL

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du système](#vue-densemble-du-système)
2. [Création du MCD (Modèle Conceptuel de Données)](#création-du-mcd)
3. [Passage au MPD (Modèle Physique de Données)](#passage-au-mpd)
4. [Génération du script SQL](#génération-du-script-sql)
5. [Règles de gestion métier](#règles-de-gestion-métier)

---

## 🎯 VUE D'ENSEMBLE DU SYSTÈME

### Contexte
Plateforme sociale pour personnes en situation de handicap comprenant :
- Gestion des utilisateurs (5 rôles)
- Forum de discussion
- Système de messagerie
- Notifications
- Vérification d'identité
- Contenu multimédia (podcasts, témoignages)
- Annuaire de services
- Offres d'emploi
- Ressources éducatives

### Technologies
- **SGBD** : PostgreSQL
- **ORM** : SQLAlchemy (Python)
- **Migrations** : Alembic

---

## 🔷 CRÉATION DU MCD (MODÈLE CONCEPTUEL DE DONNÉES)

### ENTITÉS ET ATTRIBUTS

#### 1. ENTITÉ : UTILISATEUR
**Description** : Représente tous les acteurs de la plateforme

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `nom` : Nom de famille (Chaîne 100, Obligatoire)
- `prenom` : Prénom (Chaîne 100, Obligatoire)
- `email` : Adresse email (Chaîne 200, Obligatoire, Unique)
- `username` : Nom d'utilisateur (Chaîne 100, Unique, Optionnel)
- `mot_de_passe` : Mot de passe haché (Chaîne 255, Obligatoire)
- `role` : Rôle utilisateur (Énumération, Obligatoire)
  - Valeurs possibles : `user`, `expert`, `entreprise`, `ong`, `admin`
  - Valeur par défaut : `user`
- `est_actif` : Compte actif (Booléen, Défaut : true)
- `email_verified` : Email vérifié (Booléen, Défaut : false)
- `avatar_url` : URL de l'avatar (Chaîne 500, Optionnel)
- `bio` : Biographie (Chaîne 500, Optionnel)
- `type_handicap` : Type de handicap (Chaîne 200, Optionnel)
- `ville` : Ville de résidence (Chaîne 100, Optionnel)

**Attributs spécifiques entreprises/ONG :**
- `entreprise_nom` : Nom de l'entreprise (Chaîne 200, Optionnel)
- `contact` : Contact (Chaîne 100, Optionnel)
- `domaine_intervention` : Domaine d'intervention (Chaîne 300, Optionnel)

**Attributs spécifiques experts :**
- `specialite` : Spécialité (Chaîne 200, Optionnel)

**Attributs de vérification (système LinkedIn) :**
- `is_verified` : Compte vérifié (Booléen, Défaut : false)
- `verification_type` : Type de vérification (Chaîne 20, Optionnel)
  - Valeurs : `email_pro`, `kyc`
- `verified_at` : Date de vérification (DateTime avec timezone, Optionnel)
- `pro_email` : Email professionnel vérifié (Chaîne 200, Optionnel)

**Attributs temporels :**
- `cree_le` : Date de création (DateTime avec timezone, Auto)
- `modifie_le` : Date de modification (DateTime avec timezone, Auto)

---

#### 2. ENTITÉ : FORUM
**Description** : Espace de discussion thématique

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `titre` : Titre du forum (Chaîne 300, Obligatoire)
- `description` : Description (Texte, Optionnel)
- `est_actif` : Forum actif (Booléen, Défaut : true)
- `createur_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `cree_le` : Date de création (DateTime avec timezone, Auto)
- `modifie_le` : Date de modification (DateTime avec timezone, Auto)

---

#### 3. ENTITÉ : POST
**Description** : Publication dans un forum

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `titre` : Titre du post (Chaîne 300, Obligatoire)
- `contenu` : Contenu du post (Texte, Obligatoire)
- `statut` : Statut de modération (Énumération, Défaut : en_attente)
  - Valeurs : `brouillon`, `en_attente`, `approuve`, `refuse`
- `est_publie` : Post publié (Booléen, Défaut : false)
- `vues` : Nombre de vues (Entier, Défaut : 0)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `forum_id` : Référence vers FORUM (Entier, Obligatoire)
- `cree_le` : Date de création (DateTime avec timezone, Auto)
- `modifie_le` : Date de modification (DateTime avec timezone, Auto)

---

#### 4. ENTITÉ : COMMENTAIRE
**Description** : Commentaire sur un post

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `contenu` : Contenu du commentaire (Texte, Obligatoire)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `post_id` : Référence vers POST (Entier, Obligatoire)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 5. ENTITÉ : MESSAGE
**Description** : Message privé entre utilisateurs

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `sender_id` : Expéditeur - Référence vers UTILISATEUR (Entier, Obligatoire)
- `receiver_id` : Destinataire - Référence vers UTILISATEUR (Entier, Obligatoire)
- `post_id` : Post lié (Référence vers POST, Optionnel)
- `contenu` : Contenu du message (Chaîne 1000, Obligatoire)
- `lu` : Message lu (Booléen, Défaut : false)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 6. ENTITÉ : NOTIFICATION
**Description** : Notification système pour utilisateur

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `type` : Type de notification (Chaîne 50, Obligatoire)
  - Exemples : `nouveau_message`, `nouveau_like`, `nouveau_commentaire`
- `title` : Titre (Chaîne 200, Obligatoire)
- `content` : Contenu (Chaîne 500, Obligatoire)
- `data` : Données JSON (Chaîne 1000, Optionnel)
- `read` : Notification lue (Booléen, Défaut : false)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 7. ENTITÉ : VERIFICATION
**Description** : Sessions de vérification (OTP email et KYC)

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `type` : Type de vérification (Chaîne 20, Obligatoire)
  - Valeurs : `email_otp`, `kyc_session`
- `token_hash` : Hash SHA-256 du token (Chaîne 64, Obligatoire)
- `expires_at` : Date d'expiration (DateTime avec timezone, Obligatoire)
- `used_at` : Date d'utilisation (DateTime avec timezone, Optionnel)
- `status` : Statut (Chaîne 20, Défaut : pending)
  - Valeurs : `pending`, `completed`, `expired`, `failed`
- `attempts` : Nombre de tentatives (Entier, Défaut : 0)
- `meta` : Métadonnées JSON (JSON, Optionnel)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 8. ENTITÉ : PODCAST
**Description** : Contenu audio/vidéo

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `titre` : Titre (Chaîne 300, Obligatoire)
- `description` : Description (Texte, Optionnel)
- `format` : Format média (Énumération, Défaut : audio)
  - Valeurs : `audio`, `video`
- `media_url` : URL du fichier média (Chaîne 500, Obligatoire)
- `couverture_url` : URL de la couverture (Chaîne 500, Optionnel)
- `duree_secondes` : Durée en secondes (Entier, Optionnel)
- `est_publie` : Publié (Booléen, Défaut : false)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 9. ENTITÉ : TEMOIGNAGE
**Description** : Témoignage utilisateur

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `titre` : Titre (Chaîne 300, Obligatoire)
- `contenu` : Contenu (Texte, Obligatoire)
- `note` : Note sur 5 (Entier 1-5, Optionnel)
- `service` : Service concerné (Chaîne 100, Optionnel)
  - Valeurs : `forum`, `emploi`, `education`, `medias`, `services`
- `photo_url` : URL de la photo (Chaîne 500, Optionnel)
- `est_publie` : Publié (Booléen, Défaut : true)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 10. ENTITÉ : JOB (OFFRE D'EMPLOI)
**Description** : Offre d'emploi

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `titre` : Titre du poste (Chaîne 300, Obligatoire)
- `entreprise` : Nom de l'entreprise (Chaîne 200, Obligatoire)
- `description` : Description (Texte, Obligatoire)
- `lieu` : Lieu (Chaîne 200, Optionnel)
- `type_contrat` : Type de contrat (Chaîne 100, Optionnel)
  - Exemples : `CDI`, `CDD`, `Stage`, `Freelance`
- `est_actif` : Offre active (Booléen, Défaut : true)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `expire_le` : Date d'expiration (DateTime avec timezone, Optionnel)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 11. ENTITÉ : EXPERT
**Description** : Profil d'expert référencé

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `nom` : Nom complet (Chaîne 200, Obligatoire)
- `specialite` : Spécialité (Chaîne 200, Obligatoire)
- `organisation` : Organisation (Chaîne 200, Optionnel)
- `email` : Email (Chaîne 200, Optionnel)
- `telephone` : Téléphone (Chaîne 50, Optionnel)
- `ville` : Ville (Chaîne 100, Optionnel)
- `photo_url` : URL de la photo (Chaîne 500, Optionnel)
- `est_actif` : Actif (Booléen, Défaut : true)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 12. ENTITÉ : RESSOURCE
**Description** : Ressource éducative

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `titre` : Titre (Chaîne 300, Obligatoire)
- `description` : Description (Texte, Obligatoire)
- `categorie` : Catégorie (Chaîne 100, Obligatoire)
  - Exemples : `formation`, `guide`, `tutoriel`, `document`
- `duree` : Durée (Chaîne 100, Optionnel)
- `niveau` : Niveau (Chaîne 100, Optionnel)
  - Exemples : `debutant`, `intermediaire`, `avance`
- `lien` : Lien vers la ressource (Chaîne 500, Optionnel)
- `est_actif` : Active (Booléen, Défaut : true)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 13. ENTITÉ : ANNUAIRE_SERVICE
**Description** : Service référencé dans l'annuaire

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `nom` : Nom du service (Chaîne 300, Obligatoire)
- `sigle` : Sigle (Chaîne 50, Optionnel)
- `categorie` : Catégorie (Chaîne 100, Obligatoire)
  - Exemples : `sante`, `social`, `emploi`, `education`, `juridique`
- `description` : Description (Texte, Obligatoire)
- `missions` : Missions (Texte, Optionnel)
- `telephone` : Téléphone (Chaîne 50, Optionnel)
- `email` : Email (Chaîne 200, Optionnel)
- `site` : Site web (Chaîne 500, Optionnel)
- `adresse` : Adresse physique (Chaîne 300, Optionnel)
- `villes` : Villes couvertes (Chaîne 300, Optionnel)
- `horaires` : Horaires (Chaîne 200, Optionnel)
- `gratuit` : Service gratuit (Booléen, Défaut : true)
- `est_actif` : Actif (Booléen, Défaut : true)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 14. ENTITÉ : PHOTO
**Description** : Photo de galerie

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `titre` : Titre (Chaîne 300, Obligatoire)
- `lieu` : Lieu (Chaîne 200, Optionnel)
- `image_url` : URL de l'image (Chaîne 500, Obligatoire)
- `est_publie` : Publiée (Booléen, Défaut : true)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

#### 15. ENTITÉ : SIGNALEMENT
**Description** : Signalement de contenu inapproprié

**Attributs :**
- `id` : Identifiant (Entier, Clé primaire)
- `cible_type` : Type de cible (Chaîne 50, Obligatoire)
  - Valeurs : `post`, `commentaire`, `temoignage`, `podcast`
- `cible_id` : ID de la cible (Entier, Obligatoire)
- `raison` : Raison du signalement (Texte, Obligatoire)
- `est_traite` : Signalement traité (Booléen, Défaut : false)
- `user_id` : Référence vers UTILISATEUR (Entier, Obligatoire)
- `cree_le` : Date de création (DateTime avec timezone, Auto)

---

### ASSOCIATIONS (RELATIONS)

#### Association 1 : CRÉER_FORUM
**Entre** : UTILISATEUR (1,n) ↔ (0,n) FORUM

**Cardinalités :**
- Un UTILISATEUR peut créer 0 à N forums
- Un FORUM est créé par 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `createur_id` dans FORUM → `id` dans UTILISATEUR
**Suppression** : CASCADE (si utilisateur supprimé, ses forums sont supprimés)

---

#### Association 2 : PUBLIER_POST
**Entre** : UTILISATEUR (1,n) ↔ (0,n) POST

**Cardinalités :**
- Un UTILISATEUR peut publier 0 à N posts
- Un POST est publié par 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `user_id` dans POST → `id` dans UTILISATEUR
**Suppression** : CASCADE

---

#### Association 3 : CONTENIR_POST
**Entre** : FORUM (1,n) ↔ (0,n) POST

**Cardinalités :**
- Un FORUM peut contenir 0 à N posts
- Un POST appartient à 1 et 1 seul FORUM

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `forum_id` dans POST → `id` dans FORUM
**Suppression** : CASCADE

---

#### Association 4 : COMMENTER_POST
**Entre** : UTILISATEUR (1,n) ↔ (0,n) COMMENTAIRE
**Et** : POST (1,n) ↔ (0,n) COMMENTAIRE

**Cardinalités :**
- Un UTILISATEUR peut écrire 0 à N commentaires
- Un COMMENTAIRE est écrit par 1 et 1 seul UTILISATEUR
- Un POST peut avoir 0 à N commentaires
- Un COMMENTAIRE concerne 1 et 1 seul POST

**Type** : Association ternaire (implique 2 relations)
**Clés étrangères** :
- `user_id` dans COMMENTAIRE → `id` dans UTILISATEUR
- `post_id` dans COMMENTAIRE → `id` dans POST
**Suppression** : CASCADE sur post_id, RESTRICT sur user_id

---

#### Association 5 : LIKER (Like)
**Entre** : UTILISATEUR (0,n) ↔ (0,n) POST

**Cardinalités :**
- Un UTILISATEUR peut liker 0 à N posts
- Un POST peut être liké par 0 à N utilisateurs

**Type** : Association many-to-many avec table intermédiaire LIKE
**Table intermédiaire** : LIKE
**Attributs de l'association** :
- `id` : Identifiant du like
- `user_id` : Référence vers UTILISATEUR
- `post_id` : Référence vers POST
- `cree_le` : Date du like
**Contrainte** : UNIQUE sur (user_id, post_id) - un utilisateur ne peut liker qu'une fois un post
**Suppression** : CASCADE sur les deux clés

---

#### Association 6 : PARTAGER (Share)
**Entre** : UTILISATEUR (0,n) ↔ (0,n) POST

**Cardinalités :**
- Un UTILISATEUR peut partager 0 à N posts
- Un POST peut être partagé 0 à N fois

**Type** : Association many-to-many avec table intermédiaire SHARE
**Table intermédiaire** : SHARE
**Attributs de l'association** :
- `id` : Identifiant du partage
- `user_id` : Partageur - Référence vers UTILISATEUR
- `post_id` : Référence vers POST
- `receiver_id` : Destinataire - Référence vers UTILISATEUR (optionnel)
- `type` : Type de partage (Chaîne 50, Défaut : external)
  - Valeurs : `external`, `internal`
- `cree_le` : Date du partage
**Suppression** : CASCADE sur toutes les clés

---

#### Association 7 : ENVOYER_MESSAGE
**Entre** : UTILISATEUR (émetteur) (1,n) ↔ (0,n) MESSAGE
**Et** : UTILISATEUR (récepteur) (1,n) ↔ (0,n) MESSAGE

**Cardinalités :**
- Un UTILISATEUR peut envoyer 0 à N messages
- Un MESSAGE est envoyé par 1 et 1 seul UTILISATEUR
- Un UTILISATEUR peut recevoir 0 à N messages
- Un MESSAGE est reçu par 1 et 1 seul UTILISATEUR

**Type** : Association auto-référentielle avec 2 rôles
**Clés étrangères** :
- `sender_id` dans MESSAGE → `id` dans UTILISATEUR
- `receiver_id` dans MESSAGE → `id` dans UTILISATEUR
- `post_id` dans MESSAGE → `id` dans POST (optionnel, pour contexte)
**Suppression** : CASCADE sur toutes les clés

---

#### Association 8 : RECEVOIR_NOTIFICATION
**Entre** : UTILISATEUR (1,n) ↔ (0,n) NOTIFICATION

**Cardinalités :**
- Un UTILISATEUR peut recevoir 0 à N notifications
- Une NOTIFICATION est destinée à 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `user_id` dans NOTIFICATION → `id` dans UTILISATEUR
**Suppression** : CASCADE

---

#### Association 9 : AVOIR_VERIFICATION
**Entre** : UTILISATEUR (1,n) ↔ (0,n) VERIFICATION

**Cardinalités :**
- Un UTILISATEUR peut avoir 0 à N sessions de vérification
- Une VERIFICATION concerne 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `user_id` dans VERIFICATION → `id` dans UTILISATEUR
**Suppression** : CASCADE

---

#### Association 10 : CRÉER_PODCAST
**Entre** : UTILISATEUR (1,n) ↔ (0,n) PODCAST

**Cardinalités :**
- Un UTILISATEUR peut créer 0 à N podcasts
- Un PODCAST est créé par 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `user_id` dans PODCAST → `id` dans UTILISATEUR
**Suppression** : RESTRICT (préserver les podcasts si utilisateur supprimé)

---

#### Association 11 : ÉCRIRE_TEMOIGNAGE
**Entre** : UTILISATEUR (1,n) ↔ (0,n) TEMOIGNAGE

**Cardinalités :**
- Un UTILISATEUR peut écrire 0 à N témoignages
- Un TEMOIGNAGE est écrit par 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `user_id` dans TEMOIGNAGE → `id` dans UTILISATEUR
**Suppression** : RESTRICT

---

#### Association 12 : POSTER_JOB
**Entre** : UTILISATEUR (1,n) ↔ (0,n) JOB

**Cardinalités :**
- Un UTILISATEUR peut poster 0 à N offres d'emploi
- Un JOB est posté par 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `user_id` dans JOB → `id` dans UTILISATEUR
**Suppression** : RESTRICT

---

#### Association 13 : SIGNALER
**Entre** : UTILISATEUR (1,n) ↔ (0,n) SIGNALEMENT

**Cardinalités :**
- Un UTILISATEUR peut faire 0 à N signalements
- Un SIGNALEMENT est fait par 1 et 1 seul UTILISATEUR

**Type** : Association binaire avec clé étrangère
**Clé étrangère** : `user_id` dans SIGNALEMENT → `id` dans UTILISATEUR
**Suppression** : RESTRICT

---

### DIAGRAMME MCD - INSTRUCTIONS POWER DESIGNER

#### Étape 1 : Créer un nouveau Modèle Conceptuel de Données
1. Ouvrir Power Designer
2. Fichier → Nouveau modèle → Modèle Conceptuel de Données
3. Nommer le modèle : `NIO-FAR_MCD`
4. SGBD cible : PostgreSQL

#### Étape 2 : Créer les Entités
Pour chaque entité listée ci-dessus :
1. Cliquer sur l'outil "Entité" dans la palette
2. Placer l'entité sur le diagramme
3. Double-cliquer pour ouvrir les propriétés
4. Onglet "Général" : Saisir le nom et le code
5. Onglet "Attributs" : Ajouter tous les attributs avec :
   - Nom
   - Code
   - Type de données
   - Obligatoire (M)
   - Identifiant (P) pour les clés primaires

**Ordre de création recommandé :**
1. UTILISATEUR (centrale)
2. FORUM
3. POST
4. COMMENTAIRE
5. LIKE
6. SHARE
7. MESSAGE
8. NOTIFICATION
9. VERIFICATION
10. PODCAST
11. TEMOIGNAGE
12. JOB
13. EXPERT
14. RESSOURCE
15. ANNUAIRE_SERVICE
16. PHOTO
17. SIGNALEMENT

#### Étape 3 : Créer les Associations
Pour chaque association listée ci-dessus :
1. Cliquer sur l'outil "Association" dans la palette
2. Cliquer sur l'entité source puis l'entité cible
3. Double-cliquer sur l'association pour ouvrir les propriétés
4. Onglet "Général" : Saisir le nom de l'association
5. Onglet "Cardinalités" : 
   - Définir les cardinalités minimales et maximales de chaque côté
   - Exemple : 0,n pour "zéro à plusieurs", 1,1 pour "un et un seul"

**Rappel des cardinalités UML/Merise :**
- `0,1` : Zéro ou un
- `1,1` : Un et un seul (obligatoire)
- `0,n` : Zéro à plusieurs
- `1,n` : Un à plusieurs (au moins un)

#### Étape 4 : Définir les Identifiants et Index
1. Pour chaque entité, vérifier que l'attribut `id` est marqué comme identifiant primaire
2. Ajouter des index sur :
   - `email` dans UTILISATEUR (unique)
   - `username` dans UTILISATEUR (unique)
   - Toutes les clés étrangères
   - `statut` dans POST
   - `cible_type` et `cible_id` dans SIGNALEMENT
   - `est_traite` dans SIGNALEMENT
   - `read` dans NOTIFICATION

#### Étape 5 : Ajouter les Contraintes
1. **Contraintes d'unicité :**
   - (user_id, post_id) dans LIKE
   - email dans UTILISATEUR
   - username dans UTILISATEUR

2. **Contraintes de domaine :**
   - `role` : Énumération {user, expert, entreprise, ong, admin}
   - `statut` dans POST : Énumération {brouillon, en_attente, approuve, refuse}
   - `format` dans PODCAST : Énumération {audio, video}
   - `verification_type` : Énumération {email_pro, kyc}
   - `type` dans VERIFICATION : Énumération {email_otp, kyc_session}
   - `status` dans VERIFICATION : Énumération {pending, completed, expired, failed}
   - `note` dans TEMOIGNAGE : CHECK (note >= 1 AND note <= 5)

#### Étape 6 : Documenter le MCD
1. Ajouter des notes pour chaque entité importante
2. Utiliser des couleurs pour grouper les entités par domaine :
   - 🔵 Bleu : Gestion utilisateurs (UTILISATEUR, VERIFICATION)
   - 🟢 Vert : Forum et interactions (FORUM, POST, COMMENTAIRE, LIKE, SHARE)
   - 🟡 Jaune : Communication (MESSAGE, NOTIFICATION)
   - 🟠 Orange : Contenu (PODCAST, TEMOIGNAGE, PHOTO)
   - 🔴 Rouge : Services (JOB, EXPERT, RESSOURCE, ANNUAIRE_SERVICE)
   - ⚫ Gris : Modération (SIGNALEMENT)

---

## 🔶 PASSAGE AU MPD (MODÈLE PHYSIQUE DE DONNÉES)

### Transformation automatique MCD → MPD

#### Étape 1 : Générer le MPD depuis le MCD
1. Dans Power Designer, avec le MCD ouvert
2. Menu "Outils" → "Générer un Modèle Physique de Données"
3. Sélectionner le SGBD : **PostgreSQL 12.x ou supérieur**
4. Options de génération :
   - ☑ Créer les clés primaires
   - ☑ Créer les clés étrangères
   - ☑ Créer les index
   - ☑ Créer les contraintes
   - ☑ Transformer les associations many-to-many en tables
5. Cliquer sur "OK"

Power Designer va automatiquement :
- Transformer chaque entité en table
- Transformer les associations en clés étrangères
- Créer les tables intermédiaires pour les relations many-to-many (LIKE, SHARE)
- Générer les index

#### Étape 2 : Vérifier et Affiner le MPD

##### Tables générées (doit correspondre à) :

**Tables principales :**
1. `users` (17 colonnes + timestamps)
2. `forums` (5 colonnes + timestamps)
3. `posts` (9 colonnes + timestamps)
4. `commentaires` (4 colonnes + timestamp)
5. `likes` (3 colonnes + timestamp)
6. `shares` (5 colonnes + timestamp)
7. `messages` (6 colonnes + timestamp)
8. `notifications` (7 colonnes + timestamp)
9. `verifications` (9 colonnes + timestamp)
10. `podcasts` (9 colonnes + timestamp)
11. `temoignages` (8 colonnes + timestamp)
12. `jobs` (9 colonnes + timestamp)
13. `experts` (9 colonnes + timestamp)
14. `ressources` (8 colonnes + timestamp)
15. `annuaire_services` (15 colonnes + timestamp)
16. `photos` (5 colonnes + timestamp)
17. `signalements` (6 colonnes + timestamp)

##### Clés étrangères à vérifier :

| Table | Colonne FK | Référence | On Delete |
|-------|-----------|-----------|-----------|
| forums | createur_id | users(id) | CASCADE |
| posts | user_id | users(id) | CASCADE |
| posts | forum_id | forums(id) | CASCADE |
| commentaires | user_id | users(id) | RESTRICT |
| commentaires | post_id | posts(id) | CASCADE |
| likes | user_id | users(id) | CASCADE |
| likes | post_id | posts(id) | CASCADE |
| shares | user_id | users(id) | CASCADE |
| shares | post_id | posts(id) | CASCADE |
| shares | receiver_id | users(id) | CASCADE |
| messages | sender_id | users(id) | CASCADE |
| messages | receiver_id | users(id) | CASCADE |
| messages | post_id | posts(id) | CASCADE |
| notifications | user_id | users(id) | CASCADE |
| verifications | user_id | users(id) | CASCADE |
| podcasts | user_id | users(id) | RESTRICT |
| temoignages | user_id | users(id) | RESTRICT |
| jobs | user_id | users(id) | RESTRICT |
| signalements | user_id | users(id) | RESTRICT |

#### Étape 3 : Définir les Types de Données PostgreSQL

Power Designer va proposer des types. Voici les ajustements à faire :

**Types à utiliser :**
```sql
-- Entiers
id                    : SERIAL PRIMARY KEY
vues, duree_secondes  : INTEGER
note                  : SMALLINT CHECK (note >= 1 AND note <= 5)
attempts              : INTEGER DEFAULT 0

-- Chaînes de caractères
nom, prenom           : VARCHAR(100)
email, pro_email      : VARCHAR(200)
titre                 : VARCHAR(300)
bio                   : VARCHAR(500)
avatar_url, media_url : VARCHAR(500)
mot_de_passe          : VARCHAR(255)
contenu (messages)    : VARCHAR(1000)
description, contenu  : TEXT

-- Booléens
est_actif, est_publie : BOOLEAN DEFAULT TRUE
email_verified        : BOOLEAN DEFAULT FALSE
is_verified           : BOOLEAN DEFAULT FALSE
lu, read              : BOOLEAN DEFAULT FALSE
est_traite            : BOOLEAN DEFAULT FALSE
gratuit               : BOOLEAN DEFAULT TRUE

-- Énumérations (créer des types ENUM PostgreSQL)
role                  : user_role_enum
statut                : post_statut_enum
format                : media_format_enum
verification_type     : verification_type_enum
type (verification)   : verification_session_type_enum
status (verification) : verification_status_enum

-- Dates et heures
cree_le               : TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
modifie_le            : TIMESTAMP WITH TIME ZONE
verified_at           : TIMESTAMP WITH TIME ZONE
expires_at            : TIMESTAMP WITH TIME ZONE
used_at               : TIMESTAMP WITH TIME ZONE
expire_le             : TIMESTAMP WITH TIME ZONE

-- JSON
meta, data            : JSONB

-- Hash
token_hash            : VARCHAR(64)
```

#### Étape 4 : Définir les Index

**Index à créer manuellement dans le MPD :**

```sql
-- Index sur les colonnes fréquemment recherchées
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_posts_statut ON posts(statut);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_forum_id ON posts(forum_id);
CREATE INDEX idx_commentaires_post_id ON commentaires(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_shares_post_id ON shares(post_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read, cree_le);
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_token_hash ON verifications(token_hash);
CREATE INDEX idx_signalements_cible ON signalements(cible_type, cible_id);
CREATE INDEX idx_signalements_traite ON signalements(est_traite);
CREATE INDEX idx_ressources_categorie ON ressources(categorie);
CREATE INDEX idx_annuaire_categorie ON annuaire_services(categorie);
```

**Dans Power Designer :**
1. Sélectionner une table
2. Onglet "Index"
3. Ajouter les index listés ci-dessus
4. Pour chaque index, spécifier :
   - Nom de l'index
   - Colonnes impliquées
   - Type (UNIQUE ou non)
   - Méthode (BTREE par défaut)

#### Étape 5 : Ajouter les Triggers et Fonctions

**Triggers pour updated_at (modifie_le) :**

Power Designer permet de définir des triggers. Voici le code à ajouter :

```sql
-- Fonction pour mettre à jour automatiquement modifie_le
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modifie_le = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur chaque table ayant modifie_le
CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_forums_modtime 
    BEFORE UPDATE ON forums 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_posts_modtime 
    BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

---

## 📜 GÉNÉRATION DU SCRIPT SQL

### Étape 1 : Générer le Script depuis le MPD

1. Dans Power Designer, avec le MPD ouvert
2. Menu "Base de données" → "Générer une base de données"
3. Options de génération :
   - ☑ Supprimer les tables existantes (DROP TABLE IF EXISTS)
   - ☑ Créer les tables
   - ☑ Créer les clés primaires
   - ☑ Créer les clés étrangères
   - ☑ Créer les index
   - ☑ Créer les contraintes CHECK
   - ☑ Créer les triggers
   - ☑ Ajouter des commentaires
4. Format : **Script SQL**
5. Options PostgreSQL :
   - Version : PostgreSQL 12+
   - ☑ Utiliser CASCADE pour les suppressions
   - ☑ Générer les ENUM types
6. Cliquer sur "Aperçu" pour visualiser
7. Enregistrer le script : `nio-far_creation_bdd.sql`

### Étape 2 : Structure du Script SQL Généré

Le script doit avoir la structure suivante :

```sql
-- ============================================
-- SCRIPT DE CRÉATION DE LA BASE DE DONNÉES
-- Projet : NIO-FAR
-- SGBD : PostgreSQL 12+
-- Date : [Date de génération]
-- Outil : Power Designer
-- ============================================

-- ============================================
-- SECTION 1 : SUPPRESSION DES OBJETS EXISTANTS
-- ============================================

DROP TABLE IF EXISTS signalements CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS annuaire_services CASCADE;
DROP TABLE IF EXISTS ressources CASCADE;
DROP TABLE IF EXISTS experts CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS temoignages CASCADE;
DROP TABLE IF EXISTS podcasts CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS commentaires CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS forums CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS post_statut_enum CASCADE;
DROP TYPE IF EXISTS media_format_enum CASCADE;
DROP TYPE IF EXISTS verification_type_enum CASCADE;
DROP TYPE IF EXISTS verification_session_type_enum CASCADE;
DROP TYPE IF EXISTS verification_status_enum CASCADE;

-- ============================================
-- SECTION 2 : CRÉATION DES TYPES ÉNUMÉRÉS
-- ============================================

CREATE TYPE user_role_enum AS ENUM (
    'user',
    'expert',
    'entreprise',
    'ong',
    'admin'
);

CREATE TYPE post_statut_enum AS ENUM (
    'brouillon',
    'en_attente',
    'approuve',
    'refuse'
);

CREATE TYPE media_format_enum AS ENUM (
    'audio',
    'video'
);

CREATE TYPE verification_type_enum AS ENUM (
    'email_pro',
    'kyc'
);

CREATE TYPE verification_session_type_enum AS ENUM (
    'email_otp',
    'kyc_session'
);

CREATE TYPE verification_status_enum AS ENUM (
    'pending',
    'completed',
    'expired',
    'failed'
);

-- ============================================
-- SECTION 3 : CRÉATION DES TABLES
-- ============================================

-- Table : users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    username VARCHAR(100) UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'user',
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url VARCHAR(500),
    bio VARCHAR(500),
    type_handicap VARCHAR(200),
    ville VARCHAR(100),
    entreprise_nom VARCHAR(200),
    contact VARCHAR(100),
    domaine_intervention VARCHAR(300),
    specialite VARCHAR(200),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_type VARCHAR(20),
    verified_at TIMESTAMP WITH TIME ZONE,
    pro_email VARCHAR(200),
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE users IS 'Utilisateurs de la plateforme';
COMMENT ON COLUMN users.role IS 'Rôle : user, expert, entreprise, ong, admin';
COMMENT ON COLUMN users.is_verified IS 'Compte vérifié (badge LinkedIn-style)';

-- Table : forums
CREATE TABLE forums (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(300) NOT NULL,
    description TEXT,
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    createur_id INTEGER NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_forum_createur FOREIGN KEY (createur_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE forums IS 'Espaces de discussion thématiques';

-- Table : posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(300) NOT NULL,
    contenu TEXT NOT NULL,
    statut post_statut_enum NOT NULL DEFAULT 'en_attente',
    est_publie BOOLEAN NOT NULL DEFAULT FALSE,
    vues INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    forum_id INTEGER NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_post_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_forum FOREIGN KEY (forum_id) 
        REFERENCES forums(id) ON DELETE CASCADE
);

COMMENT ON TABLE posts IS 'Publications dans les forums';
COMMENT ON COLUMN posts.statut IS 'Statut de modération : brouillon, en_attente, approuve, refuse';

-- Table : commentaires
CREATE TABLE commentaires (
    id SERIAL PRIMARY KEY,
    contenu TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_commentaire_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_commentaire_post FOREIGN KEY (post_id) 
        REFERENCES posts(id) ON DELETE CASCADE
);

COMMENT ON TABLE commentaires IS 'Commentaires sur les posts';

-- Table : likes
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_like_post FOREIGN KEY (post_id) 
        REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT uq_like_user_post UNIQUE (user_id, post_id)
);

COMMENT ON TABLE likes IS 'Likes sur les posts (un utilisateur ne peut liker qu\'une fois)';

-- Table : shares
CREATE TABLE shares (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    receiver_id INTEGER,
    type VARCHAR(50) NOT NULL DEFAULT 'external',
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_share_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_share_post FOREIGN KEY (post_id) 
        REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_share_receiver FOREIGN KEY (receiver_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE shares IS 'Partages de posts (interne ou externe)';
COMMENT ON COLUMN shares.type IS 'Type : external (partage externe), internal (partage vers un utilisateur)';

-- Table : messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    post_id INTEGER,
    contenu VARCHAR(1000) NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_post FOREIGN KEY (post_id) 
        REFERENCES posts(id) ON DELETE CASCADE
);

COMMENT ON TABLE messages IS 'Messages privés entre utilisateurs';
COMMENT ON COLUMN messages.post_id IS 'Post lié au message (contexte optionnel)';

-- Table : notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content VARCHAR(500) NOT NULL,
    data VARCHAR(1000),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE notifications IS 'Notifications système pour les utilisateurs';
COMMENT ON COLUMN notifications.type IS 'Type : nouveau_message, nouveau_like, nouveau_commentaire, etc.';
COMMENT ON COLUMN notifications.data IS 'Données JSON pour le contexte de la notification';

-- Table : verifications
CREATE TABLE verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type verification_session_type_enum NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    status verification_status_enum NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    meta JSONB,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE verifications IS 'Sessions de vérification (OTP email et KYC)';
COMMENT ON COLUMN verifications.type IS 'Type : email_otp, kyc_session';
COMMENT ON COLUMN verifications.token_hash IS 'Hash SHA-256 du token (jamais stocké en clair)';
COMMENT ON COLUMN verifications.status IS 'Statut : pending, completed, expired, failed';
COMMENT ON COLUMN verifications.meta IS 'Métadonnées JSON (domaine email, session_id KYC, etc.)';

-- Table : podcasts
CREATE TABLE podcasts (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(300) NOT NULL,
    description TEXT,
    format media_format_enum NOT NULL DEFAULT 'audio',
    media_url VARCHAR(500) NOT NULL,
    couverture_url VARCHAR(500),
    duree_secondes INTEGER,
    est_publie BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_podcast_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

COMMENT ON TABLE podcasts IS 'Contenu audio ou vidéo';
COMMENT ON COLUMN podcasts.format IS 'Format : audio, video';

-- Table : temoignages
CREATE TABLE temoignages (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(300) NOT NULL,
    contenu TEXT NOT NULL,
    note SMALLINT CHECK (note >= 1 AND note <= 5),
    service VARCHAR(100),
    photo_url VARCHAR(500),
    est_publie BOOLEAN NOT NULL DEFAULT TRUE,
    user_id INTEGER NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_temoignage_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

COMMENT ON TABLE temoignages IS 'Témoignages utilisateurs';
COMMENT ON COLUMN temoignages.note IS 'Note de 1 à 5 sur le service';
COMMENT ON COLUMN temoignages.service IS 'Service concerné : forum, emploi, education, medias, services';

-- Table : jobs
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(300) NOT NULL,
    entreprise VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    lieu VARCHAR(200),
    type_contrat VARCHAR(100),
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    user_id INTEGER NOT NULL,
    expire_le TIMESTAMP WITH TIME ZONE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

COMMENT ON TABLE jobs IS 'Offres d\'emploi';
COMMENT ON COLUMN jobs.type_contrat IS 'Type : CDI, CDD, Stage, Freelance, etc.';

-- Table : experts
CREATE TABLE experts (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    specialite VARCHAR(200) NOT NULL,
    organisation VARCHAR(200),
    email VARCHAR(200),
    telephone VARCHAR(50),
    ville VARCHAR(100),
    photo_url VARCHAR(500),
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE experts IS 'Annuaire des experts référencés';

-- Table : ressources
CREATE TABLE ressources (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    duree VARCHAR(100),
    niveau VARCHAR(100),
    lien VARCHAR(500),
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ressources IS 'Ressources éducatives';
COMMENT ON COLUMN ressources.categorie IS 'Catégorie : formation, guide, tutoriel, document';
COMMENT ON COLUMN ressources.niveau IS 'Niveau : debutant, intermediaire, avance';

-- Table : annuaire_services
CREATE TABLE annuaire_services (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(300) NOT NULL,
    sigle VARCHAR(50),
    categorie VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    missions TEXT,
    telephone VARCHAR(50),
    email VARCHAR(200),
    site VARCHAR(500),
    adresse VARCHAR(300),
    villes VARCHAR(300),
    horaires VARCHAR(200),
    gratuit BOOLEAN NOT NULL DEFAULT TRUE,
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE annuaire_services IS 'Annuaire des services et organisations';
COMMENT ON COLUMN annuaire_services.categorie IS 'Catégorie : sante, social, emploi, education, juridique';

-- Table : photos
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(300) NOT NULL,
    lieu VARCHAR(200),
    image_url VARCHAR(500) NOT NULL,
    est_publie BOOLEAN NOT NULL DEFAULT TRUE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE photos IS 'Galerie de photos';

-- Table : signalements
CREATE TABLE signalements (
    id SERIAL PRIMARY KEY,
    cible_type VARCHAR(50) NOT NULL,
    cible_id INTEGER NOT NULL,
    raison TEXT NOT NULL,
    est_traite BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_signalement_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

COMMENT ON TABLE signalements IS 'Signalements de contenu inapproprié';
COMMENT ON COLUMN signalements.cible_type IS 'Type de contenu signalé : post, commentaire, temoignage, podcast';
COMMENT ON COLUMN signalements.cible_id IS 'ID du contenu signalé';

-- ============================================
-- SECTION 4 : CRÉATION DES INDEX
-- ============================================

-- Index sur users
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);

-- Index sur posts
CREATE INDEX idx_posts_statut ON posts(statut);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_forum_id ON posts(forum_id);
CREATE INDEX idx_posts_forum_statut ON posts(forum_id, statut);

-- Index sur commentaires
CREATE INDEX idx_commentaires_post_id ON commentaires(post_id);
CREATE INDEX idx_commentaires_user_id ON commentaires(user_id);

-- Index sur likes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);

-- Index sur shares
CREATE INDEX idx_shares_post_id ON shares(post_id);
CREATE INDEX idx_shares_user_id ON shares(user_id);

-- Index sur messages
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_receiver_lu ON messages(receiver_id, lu);

-- Index sur notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, cree_le DESC);

-- Index sur verifications
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_token_hash ON verifications(token_hash);
CREATE INDEX idx_verifications_status ON verifications(status, expires_at);

-- Index sur signalements
CREATE INDEX idx_signalements_cible ON signalements(cible_type, cible_id);
CREATE INDEX idx_signalements_traite ON signalements(est_traite);
CREATE INDEX idx_signalements_user_id ON signalements(user_id);

-- Index sur ressources et annuaire
CREATE INDEX idx_ressources_categorie ON ressources(categorie);
CREATE INDEX idx_annuaire_categorie ON annuaire_services(categorie);

-- Index sur les autres tables
CREATE INDEX idx_forums_createur_id ON forums(createur_id);
CREATE INDEX idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX idx_temoignages_user_id ON temoignages(user_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_actif_expire ON jobs(est_actif, expire_le);

-- ============================================
-- SECTION 5 : TRIGGERS POUR MAJ AUTOMATIQUE
-- ============================================

-- Fonction pour mettre à jour modifie_le
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modifie_le = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers sur les tables avec modifie_le
CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_forums_modtime 
    BEFORE UPDATE ON forums 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_posts_modtime 
    BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================
-- SECTION 6 : DONNÉES D'EXEMPLE (OPTIONNEL)
-- ============================================

-- Insertion d'un utilisateur admin par défaut
-- (À personnaliser avec vos propres valeurs)
-- INSERT INTO users (nom, prenom, email, mot_de_passe, role, email_verified)
-- VALUES ('Admin', 'Système', 'admin@nio-far.org', 'HASH_A_REMPLACER', 'admin', TRUE);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
```

### Étape 3 : Ajustements Post-Génération

Après la génération, vérifier et ajuster :

1. **Ordre des DROP TABLE** : Les tables doivent être supprimées dans l'ordre inverse des dépendances (signalements en premier, users en dernier)

2. **CASCADE sur les clés étrangères** :
   - Vérifier que `ON DELETE CASCADE` est bien présent où nécessaire
   - Vérifier que `ON DELETE RESTRICT` est présent pour préserver les données (podcasts, jobs, etc.)

3. **Valeurs par défaut** :
   - `DEFAULT CURRENT_TIMESTAMP` sur tous les `cree_le`
   - Valeurs par défaut sur les booléens

4. **Commentaires** :
   - Ajouter des `COMMENT ON TABLE` et `COMMENT ON COLUMN` pour documenter

### Étape 4 : Exécution du Script

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE niofar_db;

# Se connecter à la base
\c niofar_db

# Exécuter le script
\i nio-far_creation_bdd.sql

# Vérifier les tables créées
\dt

# Vérifier les contraintes
\d+ users
```

---

## 📊 RÈGLES DE GESTION MÉTIER

### Règles Fondamentales

1. **RG001 - Unicité Email** : Un email ne peut être associé qu'à un seul compte utilisateur.

2. **RG002 - Unicité Username** : Un username, s'il est fourni, doit être unique dans le système.

3. **RG003 - Modération Posts** : Tout nouveau post doit passer par l'état "en_attente" avant d'être publié (sauf pour les admins).

4. **RG004 - Like Unique** : Un utilisateur ne peut liker qu'une fois un post donné.

5. **RG005 - Suppression Cascade Forums** : Si un utilisateur est supprimé, tous ses forums sont supprimés en cascade.

6. **RG006 - Suppression Cascade Posts** : Si un forum est supprimé, tous ses posts sont supprimés en cascade.

7. **RG007 - Préservation Contenu** : Les podcasts, témoignages et jobs doivent être préservés même si l'utilisateur est supprimé (ON DELETE RESTRICT).

8. **RG008 - Hash Token** : Les tokens de vérification ne sont jamais stockés en clair, uniquement leur hash SHA-256.

9. **RG009 - Expiration Vérification** : Toute session de vérification doit avoir une date d'expiration.

10. **RG010 - Note Témoignage** : La note d'un témoignage doit être comprise entre 1 et 5.

### Règles de Sécurité

11. **RG011 - Mot de passe haché** : Les mots de passe sont stockés hashés (bcrypt ou argon2).

12. **RG012 - Anti-bruteforce** : Le champ `attempts` dans `verifications` limite les tentatives (max 3-5).

13. **RG013 - Token unique** : Un token_hash ne peut être utilisé qu'une seule fois (`used_at` NOT NULL après utilisation).

### Règles de Cohérence

14. **RG014 - Message Self** : Un utilisateur ne devrait pas pouvoir s'envoyer un message à lui-même (à implémenter en application ou trigger).

15. **RG015 - Post publié** : Un post ne peut être publié (`est_publie = TRUE`) que si son statut est "approuve".

16. **RG016 - Vérification email pro** : Si `verification_type = 'email_pro'`, alors `pro_email` doit être renseigné.

17. **RG017 - Job expiré** : Un job dont la date `expire_le` est dépassée doit avoir `est_actif = FALSE` (cron job ou trigger).

---

## 🎨 CONSEILS POUR POWER DESIGNER

### Organisation du Diagramme

1. **Disposer les entités logiquement** :
   - Centre : UTILISATEUR (entité centrale)
   - Autour : Tables dépendantes directes (FORUM, POST, MESSAGE, etc.)
   - Périphérie : Tables de contenu (PODCAST, JOB, EXPERT, etc.)

2. **Utiliser les couleurs et groupes** :
   - Créer des packages par domaine fonctionnel
   - Utiliser des couleurs pour différencier visuellement

3. **Nommer clairement** :
   - Noms d'entités en MAJUSCULES
   - Noms d'associations en verbes à l'infinitif
   - Noms d'attributs en snake_case

### Génération et Maintenance

4. **Versionner le modèle** :
   - Sauvegarder le fichier .mcd Power Designer dans Git
   - Créer une version par itération majeure

5. **Synchroniser avec le code** :
   - Comparer régulièrement le MPD avec les modèles SQLAlchemy
   - Maintenir la cohérence MCD ↔ MPD ↔ Code

6. **Documenter** :
   - Ajouter des notes dans Power Designer
   - Générer le rapport de conception (RTF ou PDF)

---

## ✅ CHECKLIST FINALE

Avant de valider votre conception, vérifier :

### MCD
- [ ] Toutes les entités sont créées avec leurs attributs complets
- [ ] Les identifiants primaires sont définis
- [ ] Toutes les associations ont des cardinalités correctes
- [ ] Les associations many-to-many sont identifiées
- [ ] Les contraintes métier sont documentées
- [ ] Le diagramme est lisible et organisé

### MPD
- [ ] Toutes les tables ont une clé primaire
- [ ] Toutes les clés étrangères sont définies avec leurs règles ON DELETE
- [ ] Les types de données PostgreSQL sont corrects
- [ ] Les contraintes UNIQUE sont présentes
- [ ] Les contraintes CHECK sont définies (note de 1 à 5, etc.)
- [ ] Les index sont créés sur les colonnes fréquemment recherchées
- [ ] Les valeurs par défaut sont définies

### Script SQL
- [ ] Le script se génère sans erreur
- [ ] L'ordre des DROP TABLE est correct
- [ ] Les ENUM types sont créés avant les tables
- [ ] Les triggers pour `modifie_le` sont présents
- [ ] Les commentaires sont ajoutés
- [ ] Le script s'exécute sans erreur dans PostgreSQL
- [ ] Les données de test peuvent être insérées

---

## 🚀 PROCHAINES ÉTAPES

Après avoir créé la base de données avec Power Designer :

1. **Exécuter le script SQL** dans votre environnement de développement
2. **Mettre à jour Alembic** : Générer une nouvelle migration initiale
3. **Synchroniser les modèles SQLAlchemy** avec le MPD
4. **Créer les fixtures** : Données d'exemple pour le développement
5. **Implémenter les tests** : Tests d'intégrité référentielle
6. **Documenter l'API** : Documenter les endpoints basés sur ce schéma

---

## 📚 RESSOURCES

### Documentation PostgreSQL
- Types de données : https://www.postgresql.org/docs/current/datatype.html
- Contraintes : https://www.postgresql.org/docs/current/ddl-constraints.html
- Index : https://www.postgresql.org/docs/current/indexes.html

### Power Designer
- Guide de modélisation conceptuelle
- Guide de génération de scripts SQL
- Best practices pour PostgreSQL

---

**Créé le** : [Date]  
**Version** : 1.0  
**Auteur** : Équipe NIO-FAR  
**Outil** : Power Designer + PostgreSQL

---

*Ce document doit être utilisé comme référence principale pour toute modification ou évolution de la base de données.*
