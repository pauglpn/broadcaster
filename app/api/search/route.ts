import { NextRequest, NextResponse } from 'next/server';
import { searchTMDB, getWatchProviders } from '@/lib/api/tmdb';
import { getSVODPlatforms } from '@/lib/api/justwatch';
import { getCinemaRelease } from '@/lib/api/allocine';
import { getTVBroadcasts } from '@/lib/api/tv-schedules';
import { SearchParams } from '@/lib/types/movie';
import {
  cache,
  getCacheKey,
  getSVODCacheKey,
  getCinemaCacheKey,
  getTVCacheKey,
} from '@/lib/utils/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const params: SearchParams = {
    title: searchParams.get('title') || '',
    director: searchParams.get('director') || undefined,
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
    type: (searchParams.get('type') as 'movie' | 'series') || 'movie',
    season: searchParams.get('season') ? parseInt(searchParams.get('season')!) : undefined,
    episode: searchParams.get('episode') ? parseInt(searchParams.get('episode')!) : undefined,
  };

  if (!params.title || params.title.length < 2) {
    return NextResponse.json({ error: 'Le nom du programme est requis (minimum 2 caractères)' }, { status: 400 });
  }

  try {
    // Vérifier le cache d'abord
    const cacheKey = getCacheKey(
      params.type,
      params.title,
      params.director,
      params.year,
      params.season,
      params.episode,
    );
    
    const cachedResult = cache.get<any>(cacheKey);
    if (cachedResult) {
      return NextResponse.json({ results: cachedResult });
    }

    // Recherche TMDB
    const results = await searchTMDB(params);
    
    // Enrichir chaque résultat avec toutes les sources de données
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        // Récupérer les données en parallèle avec cache
        const [svodPlatforms, cinemaRelease, tvBroadcasts] = await Promise.all([
          // SVOD : JustWatch (avec cache)
          (async () => {
            const svodCacheKey = getSVODCacheKey(result.title, params.type, result.year);
            const cachedSVOD = cache.get(svodCacheKey);
            if (cachedSVOD) return cachedSVOD;
            
            const svod = await getSVODPlatforms(result.title, params.type, result.year);
            cache.set(svodCacheKey, svod);
            return svod;
          })(),
          
          // Cinéma : Allociné (uniquement pour les films, avec cache)
          (async () => {
            if (params.type !== 'movie') return null;
            
            const cinemaCacheKey = getCinemaCacheKey(result.title, result.year);
            const cachedCinema = cache.get(cinemaCacheKey);
            if (cachedCinema) return cachedCinema;
            
            const cinema = await getCinemaRelease(result.title, result.year);
            if (cinema) cache.set(cinemaCacheKey, cinema);
            return cinema;
          })(),
          
          // TV : Grilles TV (avec cache)
          (async () => {
            const tvCacheKey = getTVCacheKey(result.title, params.type, params.season, params.episode);
            const cachedTV = cache.get(tvCacheKey);
            if (cachedTV) return cachedTV;
            
            const tv = await getTVBroadcasts(result.title, params.type, params.season, params.episode);
            cache.set(tvCacheKey, tv);
            return tv;
          })(),
        ]);

        // Essayer aussi les providers TMDB en complément de JustWatch
        const tmdbProviders = await getWatchProviders(result.id, params.type);
        const tmdbSVOD = tmdbProviders?.flatrate?.map((p: any) => ({
          platform: mapProviderName(p.provider_name) as any,
          availableDate: new Date(),
          url: tmdbProviders.link,
          isAvailable: true,
          type: 'subscription' as const,
        })) || [];

        // Fusionner les plateformes SVOD (JustWatch + TMDB), éviter les doublons
        const allSVOD = [...svodPlatforms];
        for (const tmdbPlatform of tmdbSVOD) {
          if (!allSVOD.find((p) => p.platform === tmdbPlatform.platform)) {
            allSVOD.push(tmdbPlatform);
          }
        }

        return {
          ...result,
          cinema: cinemaRelease || undefined,
          svod: allSVOD,
          tv: tvBroadcasts,
        };
      })
    );

    // Mettre en cache les résultats complets
    cache.set(cacheKey, enrichedResults);

    return NextResponse.json({ results: enrichedResults });
  } catch (error) {
    console.error('Erreur recherche:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}

function mapProviderName(name: string): string {
  const mapping: Record<string, string> = {
    'Netflix': 'Netflix',
    'Amazon Prime Video': 'Prime Video',
    'Disney Plus': 'Disney+',
    'Canal+': 'Canal+',
    'Apple TV Plus': 'Apple TV+',
    'Crunchyroll': 'Crunchyroll',
    'Animation Digital Network': 'ADN',
    'France TV': 'France.tv',
    'Arte': 'Arte.tv',
    'HBO Max': 'HBO Max',
    'Paramount Plus': 'Paramount+',
  };
  return mapping[name] || name;
}
