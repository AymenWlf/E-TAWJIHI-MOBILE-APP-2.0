# Sons des notifications push (mobile)

Fichiers audio utilisés par l’app **E-Tawjihi** pour les notifications Expo (iOS + Android).

## Fichiers usine (configuration par défaut backoffice)

| Fichier | Usage |
|---------|--------|
| `notification.mp3` | Annonces concours, écoles suivies, statut candidature |
| `cash_commande.mp3` | Nouvelle commande boutique (admin) |
| `cash_transaction.mp3` | Commande terminée + transaction CRM (admin) |
| *(son système)* | Tous les autres types (`default` dans le backoffice) |

## Emplacement

```
E-TAWJIHI-MOBILE-SHELL/assets/sounds/
```

## Backoffice

**Admin → Sons des notifications push** (`/admin/push-notification-sounds`)

- Au premier chargement, si la table est vide, la configuration usine est créée automatiquement.
- Bouton **Réinitialiser la configuration par défaut** : recrée toute la config (MP3 ci-dessus + catégories `default`).

## Règles techniques

- **iOS** : champ « Son iOS » = nom du fichier avec extension (ex. `notification.mp3`). iOS distant peut exiger `.wav`/`.caf` selon la version ; tester sur appareil réel.
- **Android** : champ « Son Android » = nom **sans** extension (ex. `notification`) — le canal utilise la ressource `res/raw/notification.mp3` après build.
- Après ajout ou remplacement : **rebuild natif** (EAS Build ou `npx expo prebuild`).

## Enregistrement dans le projet

Les fichiers listés dans `app.json` → plugin `expo-notifications` → `sounds` sont copiés dans le binaire au build :

```json
"sounds": [
  "./assets/sounds/notification.mp3",
  "./assets/sounds/cash_commande.mp3",
  "./assets/sounds/cash_transaction.mp3"
]
```
