# Architecture ChoreQuest

## Objectif
Construire sur Windows une application mobile-first pour gamifier les tâches ménagères en multijoueur, avec objectif mensuel, progression individuelle et collective, calendrier annuel, pénalités de retard, et validation de tâches par NFC à terme.

## Stratégie générale
Comme le développement iPhone natif complet avec SwiftUI, Core NFC et Xcode nécessite macOS, la stratégie recommandée est de développer d'abord une PWA/web app mobile-first sur Windows.

Cette version doit permettre de valider :
- le game design,
- les règles de score,
- l'UX mobile,
- le modèle multijoueur,
- la planification des tâches,
- la logique de pénalité,
- la future compatibilité avec une migration vers iPhone natif.

## Stack recommandée

### Front-end
Option 1 : HTML/CSS/JavaScript simple pour prototypage rapide.
Option 2 : React + Vite pour une vraie base produit.

Recommandation :
- V1 prototype : HTML/CSS/JS.
- V2 produit : React + Vite + TypeScript.

### Back-end
Deux options cohérentes pour ton profil :
- FastAPI, très rapide pour prototyper une API propre.
- Django + Django REST Framework, plus structurant si tu veux aussi une interface admin.

Recommandation : FastAPI pour la vitesse au début.

### Base de données
- SQLite pour le développement local.
- PostgreSQL pour la version partagée réelle.

### Temps réel / multijoueur
Options :
- Supabase,
- Firebase,
- ou backend maison avec WebSocket.

Recommandation :
- V1/V2 : API REST classique.
- V3 : Supabase Realtime ou WebSocket.

## Modules métier

### 1. Authentification
- création de foyer,
- invitation de joueurs,
- rôles (admin, joueur),
- rattachement d'un joueur à un foyer.

### 2. Tâches
- bibliothèque de tâches récurrentes,
- fréquence : quotidien, hebdo, bihebdo, mensuel, saisonnier, annuel,
- catégorie : ménage, animal, entretien, rangement,
- mode de validation : NFC, manuel.

### 3. Occurrences
Chaque tâche récurrente génère des occurrences datées.

Exemples :
- croquettes de Pep's -> tous les jours,
- vider les poubelles -> chaque semaine,
- changer la litière -> toutes les 2 semaines,
- nettoyer les vitres -> chaque mois.

### 4. Points
Chaque occurrence validée donne des points.

Barème de départ recommandé :
- quotidien simple : 5 à 8,
- quotidien animal : 10 à 12,
- hebdomadaire : 20,
- bihebdo : 35,
- mensuel : 60,
- saisonnier : 120,
- annuel : 250.

### 5. Pénalités
- réduction de points après échéance,
- perte de streak,
- indicateur rouge sur tâches en retard,
- éventuellement dette de foyer.

### 6. Streaks
- streak individuel quotidien,
- streak collectif mensuel,
- bonus de régularité.

### 7. Calendrier
- vue aujourd'hui,
- vue semaine,
- vue mois,
- vue annuelle résumé.

### 8. NFC
Phase Windows :
- simulation de scan par bouton,
- ou remplacement temporaire par QR code.

Phase iPhone native future :
- badge NFC lié à une zone,
- scan réel via Core NFC,
- confirmation d'occurrence.

## Modèle de données minimal

### household
- id
- name
- monthly_target_points
- created_at

### player
- id
- household_id
- username
- role
- avatar
- current_streak
- total_points

### task_template
- id
- household_id
- title
- description
- frequency
- category
- points
- validation_mode
- room
- is_active

### task_occurrence
- id
- task_template_id
- due_date
- status
- assigned_player_id
- completed_by_player_id
- completed_at
- penalty_applied
- earned_points

### nfc_badge
- id
- household_id
- code
- label
- room

### penalty_rule
- id
- household_id
- delay_hours
- percent_loss
- streak_break

## Endpoints API proposés

### Auth
- POST /auth/register
- POST /auth/login
- POST /households
- POST /households/{id}/invite

### Players
- GET /players/me
- GET /households/{id}/players

### Tasks
- GET /tasks/templates
- POST /tasks/templates
- PUT /tasks/templates/{id}
- GET /tasks/occurrences/today
- GET /tasks/occurrences/month
- POST /tasks/occurrences/{id}/complete
- POST /tasks/occurrences/{id}/skip

### Scores
- GET /households/{id}/score
- GET /households/{id}/leaderboard
- GET /households/{id}/streaks

### NFC
- POST /nfc/scan

## Écrans à développer

### 1. Accueil
- score mensuel collectif,
- tâches du jour,
- retards,
- bouton scan NFC,
- progression de mois.

### 2. Équipe
- classement,
- total individuel,
- activité récente,
- objectif du foyer.

### 3. Calendrier
- planning mensuel,
- annualisation,
- grosses tâches à venir.

### 4. Réglages
- barème de points,
- règles de pénalité,
- badges NFC,
- joueurs.

## Roadmap

### V1
- prototype UI mobile,
- données mockées,
- scan NFC simulé,
- score local.

### V2
- backend API,
- auth,
- foyer partagé,
- sauvegarde DB.

### V3
- temps réel,
- historique d'activité,
- notifications.

### V4
- portage iPhone natif,
- Core NFC réel,
- TestFlight.

## Recommandation finale
Le meilleur chemin sur Windows est :
1. prototyper l'UX et les règles en PWA,
2. coder l'API et la base,
3. valider le concept en usage réel,
4. migrer ensuite vers iPhone natif si le produit fonctionne bien.
