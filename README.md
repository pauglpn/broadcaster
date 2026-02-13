# Broadcaster

Plateforme de recherche de disponibilité des films et séries en France.

## Fonctionnalités

- 🔍 **Recherche avancée** : Trouvez des films et séries par titre, réalisateur, année et type
- 🎬 **Sorties cinéma** : Consultez les dates de sortie en salles en France
- 📺 **Diffusions TV** : Découvrez quand vos programmes passent à la télévision
- 🎥 **Plateformes SVOD** : Trouvez sur quelles plateformes de streaming vos contenus sont disponibles
- 📊 **Export Excel** : Téléchargez les grilles TV pour consultation hors ligne

## Installation

1. Clonez le repository :
```bash
git clone https://github.com/pauglpn/broadcaster.git
cd broadcaster
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env.local` à la racine du projet :
```env
TMDB_API_KEY=votre_clé_api_tmdb
```

Pour obtenir une clé API TMDB :
1. Créez un compte sur [The Movie Database](https://www.themoviedb.org/)
2. Allez dans Paramètres > API
3. Demandez une clé API
4. Copiez la clé dans votre fichier `.env.local`

4. Lancez le serveur de développement :
```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
broadcaster/
├── app/
│   ├── api/          # Routes API (autocomplete, search)
│   ├── about/        # Page À propos
│   ├── results/      # Page de résultats
│   ├── layout.tsx    # Layout principal
│   └── page.tsx      # Page d'accueil
├── components/       # Composants React
│   ├── CinemaSection.tsx
│   ├── Navigation.tsx
│   ├── SearchForm.tsx
│   ├── SVODSection.tsx
│   └── TVSection.tsx
├── lib/
│   ├── api/          # APIs et scrapers (TMDB, JustWatch, Allociné, TV)
│   ├── hooks/        # Hooks React personnalisés
│   ├── types/        # Types TypeScript
│   └── utils/        # Utilitaires (export Excel, cache)
└── public/           # Fichiers statiques
```

## Technologies utilisées

- **Next.js 16** : Framework React
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styles
- **ExcelJS** : Génération de fichiers Excel
- **TMDB API** : Données films et séries
- **JustWatch API** : Disponibilité SVOD
- **Cheerio** : Scraping HTML
- **Axios** : Requêtes HTTP
- **date-fns** : Manipulation de dates

## Déploiement

Le projet peut être déployé sur [Vercel](https://vercel.com) :

1. Connectez votre compte GitHub
2. Importez le repository `broadcaster`
3. Ajoutez la variable d'environnement `TMDB_API_KEY`
4. Déployez !

## Licence

MIT
