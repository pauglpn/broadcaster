# APIs et Sources de données

Ce dossier contient tous les modules d'intégration avec les différentes sources de données.

## Structure

### `tmdb.ts`
Intégration avec l'API The Movie Database (TMDB).
- Recherche de films et séries
- Récupération des métadonnées (affiches, synopsis, réalisateurs)
- Récupération des providers de streaming (TMDB)

**Configuration requise :**
- Variable d'environnement `TMDB_API_KEY`

### `justwatch.ts`
Intégration avec JustWatch pour les données SVOD.
- Recherche via API JustWatch (si accessible)
- Fallback sur scraping JustWatch.com si API non disponible
- Mapping des plateformes vers le format interne

**Fonctionnalités :**
- Détection automatique de la disponibilité sur les plateformes SVOD
- Support de toutes les plateformes principales (Netflix, Prime Video, Disney+, etc.)
- Filtrage géographique (France uniquement)

### `allocine.ts`
Scraping Allociné pour les dates de sortie cinéma.
- Recherche de films sur Allociné
- Extraction des dates de sortie en France
- Respect du rate limiting (1 requête/seconde)

**Contraintes :**
- Rate limiting strict : 1 requête/seconde minimum
- User-Agent identifiable requis
- Gestion des erreurs (site indisponible, structure HTML modifiée)

### `tv-schedules.ts`
Récupération des grilles TV.
- Intégration avec Télérama API (si accessible)
- Scraping TVmag en fallback
- Support des chaînes TNT principales

**Chaînes couvertes :**
- TNT : TF1, France 2, France 3, Canal+, M6, Arte, C8, TMC
- Câble/Satellite : OCS, Ciné+

## Cache

Toutes les requêtes sont mises en cache pendant 24h pour :
- Éviter les requêtes répétées
- Respecter les limites de rate limiting
- Améliorer les performances

Voir `../utils/cache.ts` pour plus de détails.

## Rate Limiting

Pour respecter les contraintes des sites scrapés :
- **Allociné** : 1 requête/seconde minimum
- **JustWatch** : 1 requête/seconde minimum
- **Télérama** : 1 requête/seconde minimum

Les délais sont automatiquement gérés dans chaque module.

## Gestion des erreurs

Tous les modules gèrent gracieusement les erreurs :
- Site indisponible → retourne `null` ou tableau vide
- Structure HTML modifiée → log l'erreur et continue
- API non accessible → fallback sur scraping si disponible
