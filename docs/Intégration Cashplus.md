2 Cash Plus 2023
CONTEXTE
Cash Plus permet aux marchands de profiter de son large réseau d’agences pour
récupérerdes paiements clients.
Toutes les requêtes sont en POST et sous le format JSON
GÉNÉRATION DE TOKEN
Génère un token de paiement à communiquer au client final.
URL: /cpws/cpmarchand/index.cfm?endpoint=/generate_token
Requête JSON:
Champ Description Type Obligatoire
request_id Identifiant unique de votre demande string Oui
amount Montant du panier numeric Oui
fees\* Frais liés au panier qui peut être 0 numeric Oui
marchand_code Code marchand délivré par CashPlus string Oui
hmac UPPERCASE(
SHA2 (marchand_code + secret_key + amount)
)
le secret_key est délivré par CashPlus
string Oui
json_data Informations complémentaires sous forme
JSON ex : ‘[{"value": "valeur_champ_1", "key":
"nom_champ_1"},{"value": "valeur_champ_2", "key":
"nom_champ_2"}, {"value": "valeur_champ_3", "key":
"nom_champ_3"} ]’
string non
date_expiration La date d’expiration du paiement token
doit être sous forme "yyyy-mm-dd HH:nn:ss"
Exemple: "2021-01-01 10:00:00"
string non

- Si les frais sont à la charge du marchand, le champs fees doit être égale à 0. La
  commission va être déduite implicitement.
  Si les frais sont à la charge du client, le champs fees doit contenir la valeur de la
  commission définie selon le contrat.
  3 Cash Plus 2023
  Réponse :
  {
  "SUCCESS" : 1,
  "TOKEN" : "cm442xq9k7",
  "DATE_EXPIRATION": "2021-02-01 00:00:00"
  }
  En cas d’erreur “success” est mis à “0” et accompagné par un message d’erreur.
  Exemple échec de la requête :
  {
  "SUCCESS" : 0,
  "MESSAGE" : "La valeur du code marchand est incorrecte"
  }
  STATUT TOKEN
  Ce service renvoie l'état d’un token, payé ou pas sous forme d’un champ de type boolean
  “IS_PAID”, accompagnée par la date de paiement “DATE_PAID”
  Le champ "STATE" donne un peu plus de précision. Ses différentes valeurs sont :
  ● new: nouveau token non expiré
  ● expired: token expiré qui ne peut pas être payé
  ● paid: token payé
  URL: /cpws/cpmarchand/index.cfm?endpoint=/status_token
  4 Cash Plus 2023
  Requête:
  Champ Description Type Obligatoire
  token le token généré string Oui
  marchand_code Code marchand délivré par CashPlus string Oui
  hmac UPPERCASE(SHA2 (marchand_code + secret_key) )
  le secret_key est délivré par CashPlus
  string Oui
  Exemple de requête :
  {
  "hmac": "",
  "token": "",
  "marchand_code": ""
  }
  Exemple succès de la requête :
  {
  "MESSAGE": "",
  "SUCCESS": 1,
  "IS_PAID": true,
  "STATE": "paid",
  "DATE_PAID":"2019-06-24 17:28:46"
  }
  ou bien
  {
  "MESSAGE": "",
  "SUCCESS": 1,
  "IS_PAID": false,
  "STATE": "new"
  }
  Exemple échec de la requête :
  {
  "MESSAGE": "Token non trouvé",
  "SUCCESS": 0
  }
  5 Cash Plus 2023
  STATUT TOKENS PAR PÉRIODE
  Retourne la liste des paiements effectués depuis une date donnée. Le nombre maximum de
  paiements retournés ne doit pas dépasser une limite fixée dans le système.
  URL: /cpws/cpmarchand/index.cfm?endpoint=/token_status_for_period
  Requête:
  Champ Description Type Obligatoire
  date_request Date limite des tokens payés string Oui
  marchand_code Code marchand délivré par
  CashPlus
  string Oui
  hmac UPPERCASE(
  SHA2 (marchand_code + secret_key)
  )
  le secret_key est délivré par CashPlus
  string Oui
  ● Le service renvoie les 100 tokens payés après la « date_request »
  ● La “date_request” est incluse
  ● Le format de la “date_request” est ‘yyyy-MM-dd HH :nn :ss’
  Exemple de requête :
  {
  "hmac": "",
  "date_request": "2018-09-10 18:00:00",
  "marchand_code": ""
  }
  Exemple succès de la requête :
  {
  "MESSAGE": "",
  "SUCCESS": 1,
  "TOKENS_STATUS": [
  {
  "token_code": "cm3wortfaq",
  "request_id": 336,
  "date_paid": "2018-09-11 22:50:22"
  },
  {
  "token_code": "cm10oqa5w9",
  "request_id": 41,
  "date_paid": "2018-09-12 17:36:00"
  },
  ]
  6 Cash Plus 2023
  }
  Exemple échec de la requête :
  {
  "MESSAGE": "Date invalide",
  "SUCCESS": 0,
  "TOKENS_STATUS": []
  }
  CALLBACK PAIEMENT
  Les marchands peuvent recevoir une notification immédiate après le paiement d’un token, ils
  devront pour cela fournir une URL à CashPlus qui sera appelée par le service de paiements
  comme suit :
  https://marchandDomain.com/.../callbackCashplus
  L’appel est en mode POST.
  Paramètres :
  ● request_id contient la valeur envoyée par le marchand lors de la génération du token
  ● hmac = UPPERCASE( SHA2(request_id + secret_key) )
  ● D’autre moyens de callBack peuvent être mis en place si nécessaire pour s’adapter
  au spécificités de chaque marchand.
  Le CallBack doit renvoyer le message “OK” en cas de succès et “NOK” en cas d’ erreur.

---

## Intégration E-Tawjihi (backoffice)

### Modes dev / prod

| Mode | Où sont les clés | Usage |
|------|------------------|--------|
| **dev** | Backoffice → `/admin/cashplus-integration` (sauvegardées en base) | Tests et recette |
| **prod** | Variables d’environnement serveur uniquement | Commandes réelles |

Variables prod (`.env` backend) :

- `CASHPLUS_PROD_MARCHAND_CODE`
- `CASHPLUS_PROD_SECRET_KEY`
- `CASHPLUS_PROD_API_BASE_URL` (optionnel, défaut `https://www.cashplus.ma`) — **base seule** : `https://hote:port`, pas le chemin `/cpws/cpmarchand/...`

**Exemple dev :** `https://moneyservicedev.cashplus.ma:4434` (le backend ajoute `/cpws/cpmarchand/index.cfm?endpoint=...`).

Le **mode actif** (dev ou prod) pour les commandes boutique se choisit dans le backoffice. La console de test peut appeler l’API en dev ou prod indépendamment.

### Callback

URL générée automatiquement : `POST /api/webhooks/cashplus/callback` (affichée dans le backoffice).

### Commandes boutique

Si « Activer l’API Cashplus » est coché, à la création d’une commande Cashplus le backend appelle `generate_token` avec `request_id` = numéro de commande. En cas d’échec, repli sur un code `CP#########` local.

### Dépannage : `SUCCESS: 0` — « La valeur de HMAC est incorrecte »

L’API répond souvent en HTTP 200 ; c’est le champ `SUCCESS` du JSON qui compte.

| Cause fréquente | Vérification |
|-----------------|--------------|
| **Clé secrète ou code marchand incorrect** | Clés **test** fournies par Cashplus pour l’URL **dev** (`https://moneyservicedev.cashplus.ma:4434`). Pas les clés prod sur l’environnement de test. |
| **Clé non enregistrée** | Backoffice : ressaisir la **clé secrète test** (le champ masqué ne suffit pas), puis **Enregistrer**. Badge « Dev configuré » doit être vert. |
| **Mode de test** | Console de test : mode **DEV** si vous utilisez les clés du backoffice. |
| **Montant ≠ HMAC** | HMAC = `SHA256( marchand_code + secret_key + amount )` en majuscules ; `amount` doit être **exactement** la même valeur que dans le JSON (ex. `"100.00"`). |

Formule `generate_token` (doc Cashplus) :

```
HMAC = UPPERCASE( SHA256( marchand_code + secret_key + amount ) )
```

Pour `status_token` : pas de montant — `SHA256( marchand_code + secret_key )` uniquement.
