# Exemple rempli : alléger les données d’un logiciel de contrôle de maquettes BIM

Exemple fondé sur deux mesures réelles d’un logiciel en ligne de contrôle de maquettes BIM, qui vérifie des maquettes IFC (bâtiment et infrastructures) contre des exigences. Les deux gains viennent de changements du logiciel écrits avec un agent de code (Claude Code). Aucun appel d’IA n’a lieu pendant la tâche, d’où un coût d’API nul dans le calcul. L’exemple montre la méthode : une mesure avant, une mesure après, et des hypothèses écrites comme telles.

## 1. Décision demandée

Exemple de rédaction : garder l’optimisation dans l’offre standard et l’étendre à toutes les organisations clientes, sur décision du responsable produit avant la fin du trimestre.

## 2. Tâche visée et périmètre

- Tâche : rafraîchir un tableau de bord Power BI branché sur une grosse maquette.
- Qui : les utilisateurs qui suivent la conformité d’un projet dans Power BI.
- Hors périmètre : le contrôle lui-même et la visionneuse 3D.

## 3. Situation de départ et mesure après

| Élément | Avant | Après | Comment c’est mesuré | Statut |
|---|---|---|---|---|
| Rafraîchissement Power BI, maquette IFC de 1,2 Go | environ 10 min | moins de 2 min | banc de mesure | mesuré |
| Bande passante du rafraîchissement | référence | moins 75 % | même banc | mesuré |
| Taille d’un dossier client de 13 maquettes | 1 692 Mo | 484 Mo (moins 71 %), sans perte de données | optimisation avec vérification automatique de la sortie | mesuré |

## 4. Indicateurs

| Indicateur | Type | Départ | Cible | Source |
|---|---|---|---|---|
| Durée d’un rafraîchissement sur la plus grosse maquette | résultat | environ 10 min | moins de 2 min | banc |
| Rafraîchissements en échec ou abandonnés | qualité | à mesurer | | journaux de la passerelle |
| Organisations où l’optimisation est active | avancé | quelques organisations choisies | toutes | configuration |

## 5. Calcul

Seules les durées avant et après sont mesurées. Les autres paramètres sont des hypothèses d’illustration, à remplacer par les volumes réels.

| Paramètre | Valeur | Statut |
|---|---|---|
| Utilisateurs | 10 | hypothèse |
| Adoption | 100 % (côté serveur, sans geste de l’utilisateur) | hypothèse |
| Montée en charge | aucune : adoption cible dès le premier mois | hypothèse (changement côté serveur) |
| Taux d’actualisation | 0 % | horizon d’un an |
| Rafraîchissements par utilisateur et par mois | 20 | hypothèse |
| Durée avant | 10 min | mesuré (environ) |
| Durée après | 2 min | mesuré (borne haute) |
| Coût horaire chargé | 55 €/h | hypothèse |
| Temps d’attente réemployé | 25 % | hypothèse |
| Licence, API, exploitation | 0 € | pas de coût par tâche |
| Mise en place | non chiffrée | le coût de développement n’a pas été suivi |

Résultat du calculateur avec ces valeurs : 200 rafraîchissements par mois, 8 minutes gagnées par rafraîchissement, 26,7 heures par mois, soit 367 € par mois de temps réemployé et 4 400 € sur douze mois. Le retour sur investissement n’est pas calculable sans le coût de mise en place ; le calculateur donne la valeur mensuelle, qui dit combien de mois de développement le gain peut rembourser.

## 6. Ce qui n’est pas chiffré

- La réduction de 71 % du stockage et du transfert, qui n’a pas été convertie en euros.
- Le confort de travail : attendre 2 minutes au lieu de 10.

## 7. Revues

À 30 jours, mesurer le nombre réel de rafraîchissements et la part en échec, puis refaire le calcul avec les volumes réels à la place des hypothèses.

## 8. Sources

- Mesures internes de l’éditeur du logiciel (banc de rafraîchissement Power BI sur une maquette IFC de 1,2 Go ; optimisation d’un dossier client de 13 maquettes), relevées en 2026 par l’auteur. Le détail des bancs n’est pas publié.
- Paramètres marqués « hypothèse » : choisis pour l’exemple, sans mesure.
