# Charte graphique E-Tawjihi — extrait du Global Front

Document de référence pour aligner l’app mobile (ou tout autre client) sur le site **E-TAWJIHI-GLOBAL-FRONT**.

**Sources analysées**

| Fichier | Rôle |
|---------|------|
| [E-TAWJIHI-GLOBAL-FRONT/src/index.css](../../E-TAWJIHI-GLOBAL-FRONT/src/index.css) | Variables CSS `:root`, typo de base, `@layer components` (boutons, cartes, badges, formulaires, alertes), utilitaires, mode sombre optionnel, animations |
| [E-TAWJIHI-GLOBAL-FRONT/tailwind.config.js](../../E-TAWJIHI-GLOBAL-FRONT/tailwind.config.js) | Palettes `primary` / `secondary` / `accent` (échelles 50–900), familles de polices, animations, ombres, espacements, rayons |
| [E-TAWJIHI-GLOBAL-FRONT/index.html](../../E-TAWJIHI-GLOBAL-FRONT/index.html) | Chargement Google Fonts : **Inter** et **Poppins** (400–700) |

---

## 1. Principes sémantiques (index.css)

- **Bleu** : confiance, savoir (marque principale).
- **Vert / émeraude** : croissance, succès.
- **Accents** (cyan, teal, indigo, violet) : innovation, sérénité, excellence, créativité — utilisés en soutien, pas en concurrence du bleu principal.
- **Neutres** : lisibilité (slate-like), fonds alternés doux.

---

## 2. Variables CSS (`:root`)

| Token | Valeur | Usage |
|-------|--------|--------|
| `--primary-blue` | `#1E40AF` | Bleu marque (variables `index.css` — nombreux composants) |
| `--primary-blue-hover` | `#1E3A8A` | Survol liens / actions bleues (`index.css`) |
| **Topbar / `Layout`** | **`#333e8f`** | **Bleu barre du haut** authentifié (`Topbar.tsx`, `Layout.tsx` — style inline) ; **référence bleu principal app mobile** |
| `--secondary-emerald` | `#047857` | Vert marque |
| `--secondary-emerald-hover` | `#065F46` | Survol vert |
| `--accent-cyan` | `#0E7490` | Accent innovation |
| `--accent-teal` | `#0F766E` | Accent sérénité |
| `--accent-indigo` | `#3730A3` | Accent excellence |
| `--accent-purple` | `#6B21A8` | Accent créativité |
| `--background` | `#FFFFFF` | Fond page |
| `--background-soft` | `#F8FAFC` | Sections alternées |
| `--background-card` | `#FFFFFF` | Cartes |
| `--text-primary` | `#0F172A` | Texte principal |
| `--text-secondary` | `#475569` | Texte secondaire |
| `--text-muted` | `#64748B` | Métadonnées, légendes |
| `--border` | `#E2E8F0` | Bordures |
| `--border-light` | `#F1F5F9` | Bordures très légères |
| `--success` | `#10B981` | Succès |
| `--warning` | `#F59E0B` | Attention |
| `--error` | `#EF4444` | Erreur |
| `--info` | `#3B82F6` | Information |
| `--solid-primary` | `#1E40AF` | Surface / filet « plein » bleu (`index.css`) |
| `--solid-secondary` | `#047857` | Surface verte |
| `--solid-accent` | `#0E7490` | Surface cyan |
| `--solid-soft` | `#F8FAFC` | Fond doux |

**Note** : certaines classes utilitaires référencent `var(--secondary-purple)` (fichier vers L756 / L777) alors que **`--secondary-purple` n’est pas défini dans `:root`**. À traiter côté front (alias vers `--accent-purple` ou `#7C3AED`) pour éviter des styles vides.

---

## 3. Mode sombre (optionnel)

Sous `@media (prefers-color-scheme: dark)`, la classe **`.dark-mode`** surcharge :

| Token | Valeur |
|-------|--------|
| `--background` | `#0F172A` |
| `--background-soft` | `#1E293B` |
| `--text-primary` | `#F8FAFC` |
| `--text-secondary` | `#CBD5E1` |
| `--border` | `#334155` |

Le site n’applique le dark qu’aux éléments portant `.dark-mode` (pas un basculement global automatique du `:root`).

---

## 4. Typographie

### Polices (index.html + Tailwind)

| Rôle | Famille | Chargement |
|------|---------|--------------|
| Corps, UI | **Inter** | Google Fonts 400, 500, 600, 700 |
| Titres / display | **Poppins** | Idem |
| Fallback | `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif` | body dans index.css |

### Tailwind (`fontFamily`)

- `font-sans` → `Inter`, system-ui, sans-serif  
- `font-display` → `Poppins`, system-ui, sans-serif  

### Échelle titres (`@layer base`, desktop)

| Balise | Taille |
|--------|--------|
| `h1` | `3.5rem` (56px) |
| `h2` | `2.5rem` (40px) |
| `h3` | `2rem` (32px) |
| `h4` | `1.5rem` (24px) |
| `h5` | `1.25rem` (20px) |
| `h6` | `1.125rem` (18px) |

Titres : `font-weight: 700`, `line-height: 1.2`, `letter-spacing: -0.02em`, couleur `var(--text-primary)`.

### Corps

- `html` : `font-size: 16px`, `scroll-behavior: smooth`
- `body` : Inter, `line-height: 1.6`, `letter-spacing: -0.01em`
- `p` : `color: var(--text-secondary)`, `line-height: 1.7`
- `.text-large` : `1.125rem`, line-height 1.6

### Responsive titres (`max-width: 480px`)

- `h1` → `2rem`
- `h2` → `1.75rem`

### Contenu riche (ex. boutique `.shop-product-description-body`)

- Titres internes en **Poppins** 700, couleurs `--text-primary`, tailles dégradées (h1 1.375rem → h6 1rem).
- Liens : `--solid-primary`, survol `--primary-blue-hover`.

---

## 5. Tailwind — couleurs étendues (`theme.extend.colors`)

Trois échelles complètes **50 → 900** (bleu « primary », violet « secondary », vert « accent »). Points clés :

- **Primary** : bleu type `blue` Tailwind, clés 600 `#2563eb`, 800 `#1e40af`, 900 `#1e3a8a`.
- **Secondary** : violet (`purple` / violet).
- **Accent** : vert (`green`).

Les classes utilitaires du site mélangent souvent **`#2563EB`**, **`--primary-blue` / `#1E40AF`**, et le **header authentifié `#333e8f`**. L’app mobile **`E-TAWJIHI-MOBILE-SHELL`** utilise **`#333E8F`** comme bleu principal (`theme/tokens.ts` → `brand.primary`, `theme/homeShell.ts`) pour coller au header « écoles supérieures » / layout connecté.

---

## 6. Composants réutilisables (classes `index.css`)

Résumé des patterns (détail dans le fichier source).

| Catégorie | Exemples de classes |
|-----------|---------------------|
| Boutons | `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-success`, `.btn-warning` |
| Cartes | `.card-education`, `.card-featured`, `.card-school`, `.card-pricing` |
| Badges | `.badge-primary`, `.badge-secondary`, `.badge-success`, `.badge-warning`, `.badge-info`, `.badge-outline`, `.badge-sponsored`, `.badge-public`, `.badge-private`, `.badge-semi-public`, `.badge-military` |
| Sections | `.section-white`, `.section-soft`, `.section-soft-solid` |
| Navigation | `.nav-link`, `.nav-link-active` |
| Formulaires | `.form-input`, `.form-select`, `.form-textarea` |
| Alertes | `.alert-success`, `.alert-warning`, `.alert-info`, `.alert-error` |
| Stats / témoignages | `.stat-card`, `.stat-number`, `.testimonial-card` |
| Timeline | `.timeline-item` (+ pseudo-éléments) |
| Ombres utilitaires | `.shadow-education`, `.shadow-education-lg`, `.shadow-success`, `.shadow-warm` |
| Texte / fond | `.text-primary-education`, `.bg-primary-education`, `.line-clamp-2` … |

Couleurs fréquentes dans les `@apply` : `#2563EB`, `#1D4ED8`, `#7C3AED`, `#059669`, `#047857`, `#EA580C`, `#DC2626`, `#E2E8F0`, `#F8FAFC`, `#0F172A`, `#475569`, `#64748B`.

---

## 7. Ombres, rayons, espacements (Tailwind `extend`)

- **boxShadow** : `soft`, `medium`, `strong`, `glow` (bleu), `glow-purple`.
- **borderRadius** : `4xl` = `2rem`, `5xl` = `2.5rem` (en plus des défauts Tailwind).
- **spacing** : `18` = `4.5rem`, `88` = `22rem`, `128` = `32rem`.
- **backgroundImage** : `gradient-radial`, `gradient-conic`, `hero-pattern` (SVG inline).

---

## 8. Animations (Tailwind + index.css)

Tailwind : `animate-fade-in`, `slide-up`, `slide-down`, `scale-in`, `bounce-slow`, `pulse-slow`, `float`, `scroll`.

Keyframes globales dans `index.css` (exemples) : `fadeIn`, `slideUp`, `slideDown`, `scaleIn`, `float`, `pulse-glow`, etc. — utilisées par les classes décoratives (`.floating-element`, …).

---

## 9. Scrollbars & détails UI (index.css)

- `.scrollbar-hide`, `.filters-scrollbar`, `.info-scrollbar`, `.custom-scrollbar` (couleurs `#f1f5f9`, `#cbd5e1`, `#93c5fd`, …).
- `.slider-thumb` (pouce range `#3b82f6` / hover `#2563eb`).
- `.logo-container` / `.logo-image` (ombre portée légère).

---

## 10. Impression

`@media print` : masque `.no-print`, force texte/fond noir/blanc sur `*`.

---

## 11. Alignement app mobile (Expo / React Native)

Le projet **E-TAWJIHI-MOBILE-SHELL** s’appuie sur [`theme/tokens.ts`](../theme/tokens.ts) et [`theme/homeShell.ts`](../theme/homeShell.ts). Le **bleu principal** est aligné sur le header web **`#333E8F`**. Pistes d’alignement restantes :

1. Charger **Inter** et **Poppins** via `expo-font` (ou assets locaux).
2. Reprendre les hiérarchies `h1`–`h6` et interlignages du §4.
3. Option : unifier `index.css` (`--primary-blue`) avec `#333e8f` côté Global Front pour supprimer l’écart variables vs topbar.

---

## 12. Synthèse « une ligne »

**Marque** : bleu header / mobile **`#333E8F`** (survol **`#2A3478`**, interactif **`#3F4D9F`**), variables CSS historiques `#1E40AF` / `#1E3A8A`, vert `#047857`, accents cyan `#0E7490`, teal `#0F766E`, indigo `#3730A3`, violet `#6B21A8` ; neutres slate ; états vert / ambre / rouge / bleu info ; typo **Inter** + **Poppins** 400–700 ; arrondis généreux (`rounded-xl`, `rounded-2xl`) et ombres douces sur les cartes.

---

*Document généré à partir du dépôt Global Front (analyse statique des fichiers listés en tête). En cas de divergence avec une maquette Figma ultérieure, la maquette prime.*
