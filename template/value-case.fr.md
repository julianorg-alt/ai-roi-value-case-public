# Dossier de valeur : [nom du déploiement]

Remplir chaque section en une demi-page au plus. Une affirmation sans mesure ni source reste marquée « hypothèse ».

## 1. Décision demandée

Une phrase : ce qu’on demande (étendre, prolonger le pilote, arrêter), à qui, avant quelle date.

## 2. Tâche visée et périmètre

- Tâche : une seule, fréquente et chronométrable (exemple : rédiger la réponse à une réclamation de niveau 1).
- Qui la fait aujourd’hui, combien de personnes, combien de fois par mois.
- Hors périmètre : ce que le déploiement ne touche pas.

## 3. Situation de départ

| Élément | Valeur | Comment c’est mesuré | Date | Source |
|---|---|---|---|---|
| Durée moyenne par tâche | | chronométrage sur un échantillon de [n] tâches | | |
| Volume mensuel | | export de l’outil métier | | |
| Taux d’erreur ou de reprise | | relecture d’un échantillon | | |
| Coût horaire chargé | | contrôle de gestion | | |

## 4. Indicateurs

| Indicateur | Type | Départ | Cible | Source | Fréquence |
|---|---|---|---|---|---|
| Adoption (utilisateurs actifs / équipés) | avancé | | | journaux de l’outil | hebdomadaire |
| Durée par tâche, relecture comprise | résultat | | | chronométrage | mensuelle |
| Part des sorties à reprendre | qualité | | | relecture d’échantillon | mensuelle |
| Coût d’API ou de licence par tâche | coût | | | facture, console | mensuelle |
| Satisfaction des utilisateurs | avancé | | | questionnaire court | mensuelle |

Un indicateur avancé dit tôt si le déploiement prend ; un indicateur de résultat dit s’il paie.

## 5. Mesure avant et après

1. Même tâche, même méthode de mesure, même type d’échantillon avant et après.
2. Mesure de départ faite avant le déploiement, pas reconstituée après.
3. La relecture humaine est comptée dans la durée après.
4. Les sorties à reprendre sont comptées avec leur temps de reprise.
5. Écarts de méthode notés ici : [aucun / lesquels].

## 6. Calcul

Coller ici le Markdown copié depuis le calculateur (`index.html`, bouton « Copier pour le dossier de valeur »), avec la fourchette prudente et favorable, puis indiquer pour chaque paramètre s’il est mesuré ou supposé. Si les durées viennent de chronométrages, joindre les mesures brutes et l’intervalle du gain par tâche donné par la page.

## 7. Ce qui n’est pas chiffré

- Qualité : erreurs évitées ou introduites.
- Risque et conformité : données traitées, hébergement, journalisation, revue de sécurité.
- Effets sur les personnes : charge, formation, acceptation.

## 8. Risques et conditions d’arrêt

| Risque | Signal | Seuil d’arrêt ou de révision | Responsable |
|---|---|---|---|
| Adoption trop faible | utilisateurs actifs | moins de [x] % à 60 jours | |
| Qualité insuffisante | part des sorties à reprendre | plus de [x] % | |
| Coût qui dérive | coût par tâche | plus de [x] € | |

## 9. Revues

| Échéance | Date | Adoption | Durée par tâche | Reprises | Net mensuel | Décision |
|---|---|---|---|---|---|---|
| 30 jours | | | | | | |
| 60 jours | | | | | | |
| 90 jours | | | | | | |

## 10. Sources

Chaque chiffre du dossier renvoie ici : document, date, personne ou outil qui l’a produit.
