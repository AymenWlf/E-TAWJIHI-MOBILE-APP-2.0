# E-TAWJIHI Mobile (Dev2)

Application mobile Expo (remplace `Dev/TawjihPlusMobileApp`), API **apinew.e-tawjihi.ma**.

## Identité store (phase 1)

| Champ | Valeur |
|-------|--------|
| iOS bundle | `com.educalogy.etawjihi` |
| Android package | `com.educalogy.etawjihi` |
| Scheme / deep links | `etawjihi` |
| Version | `1.5.0` (iOS build `62`, Android `versionCode` `63`) |
| EAS project | `8607d592-f821-41d9-a62e-75c4c190d41e` |

## Config

- Copier `.env.example` → `.env` (prod : `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_EAS_PROJECT_ID`).
- `google-services.json` : Firebase Android (copié depuis l’app Dev).

## Build / OTA

```bash
npm install
eas build --platform all --profile production
eas submit --platform all --profile production
npm run update:prod   # OTA JS (channel production)
```
