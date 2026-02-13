import axios from 'axios';
import { PlatformAvailability, SVODPlatform } from '../types/platform';

const JUSTWATCH_API_URL = 'https://apis.justwatch.com/content';
const JUSTWATCH_WEB_URL = 'https://www.justwatch.com';

interface JustWatchProvider {
  id: number;
  technical_name: string;
  short_name: string;
  clear_name: string;
  monetization_types: string[];
  icon_url: string;
}

interface JustWatchResult {
  id: number;
  title: string;
  full_path: string;
  poster: string;
  offers?: Array<{
    provider_id: number;
    monetization_type: string;
    retail_price?: number;
    currency: string;
    presentation_type: string;
    date_created: string;
    url: string;
  }>;
}

const platformMapping: Record<string, SVODPlatform> = {
  netflix: 'Netflix',
  amazon_prime_video: 'Prime Video',
  disney: 'Disney+',
  canal_plus: 'Canal+',
  apple_tv_plus: 'Apple TV+',
  crunchyroll: 'Crunchyroll',
  animation_digital_network: 'ADN',
  france_tv: 'France.tv',
  arte: 'Arte.tv',
  hbo_max: 'HBO Max',
  paramount_plus: 'Paramount+',
};

/**
 * Récupère les providers disponibles depuis JustWatch
 */
async function getProviders(): Promise<Map<number, JustWatchProvider>> {
  try {
    const response = await axios.get(`${JUSTWATCH_API_URL}/providers/locale/fr_FR`);
    const providers = new Map<number, JustWatchProvider>();
    
    response.data.forEach((provider: JustWatchProvider) => {
      providers.set(provider.id, provider);
    });
    
    return providers;
  } catch (error) {
    console.error('Erreur récupération providers JustWatch:', error);
    return new Map();
  }
}

/**
 * Recherche un programme sur JustWatch via API
 */
export async function searchJustWatchAPI(
  title: string,
  type: 'movie' | 'series',
  year?: number,
): Promise<PlatformAvailability[]> {
  try {
    const providers = await getProviders();
    const contentType = type === 'movie' ? 'movie' : 'show';
    
    const response = await axios.get(`${JUSTWATCH_API_URL}/titles/fr_FR/popular`, {
      params: {
        body: JSON.stringify({
          query: title,
          content_types: [contentType],
          ...(year && { release_year_from: year, release_year_until: year }),
        }),
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    const item = response.data.items[0] as JustWatchResult;
    const platforms: PlatformAvailability[] = [];

    if (item.offers) {
      for (const offer of item.offers) {
        const provider = providers.get(offer.provider_id);
        if (!provider) continue;

        const platformName = platformMapping[provider.technical_name];
        if (!platformName) continue;

        // Filtrer uniquement les abonnements (flatrate)
        if (offer.monetization_type !== 'flatrate') continue;

        platforms.push({
          platform: platformName,
          availableDate: new Date(offer.date_created),
          url: offer.url || `${JUSTWATCH_WEB_URL}${item.full_path}`,
          isAvailable: true,
          type: 'subscription',
        });
      }
    }

    return platforms;
  } catch (error) {
    console.error('Erreur JustWatch API:', error);
    // Fallback sur le scraping si l'API échoue
    return searchJustWatchScraping(title, type, year);
  }
}

/**
 * Scraping JustWatch.com en fallback si l'API n'est pas accessible
 */
async function searchJustWatchScraping(
  title: string,
  type: 'movie' | 'series',
  year?: number,
): Promise<PlatformAvailability[]> {
  try {
    const searchQuery = encodeURIComponent(`${title} ${year || ''}`.trim());
    const contentType = type === 'movie' ? 'movie' : 'show';
    const url = `${JUSTWATCH_WEB_URL}/fr/recherche?q=${searchQuery}&content_type=${contentType}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    // Parser le HTML pour extraire les plateformes
    // Note: Cette implémentation est simplifiée, une vraie implémentation nécessiterait un parser HTML robuste
    const html = response.data;
    const platforms: PlatformAvailability[] = [];

    // Chercher les logos des plateformes dans le HTML
    for (const [key, platformName] of Object.entries(platformMapping)) {
      const regex = new RegExp(`data-provider="${key}"`, 'i');
      if (regex.test(html)) {
        platforms.push({
          platform: platformName as SVODPlatform,
          availableDate: new Date(),
          url: url,
          isAvailable: true,
          type: 'subscription',
        });
      }
    }

    return platforms;
  } catch (error) {
    console.error('Erreur scraping JustWatch:', error);
    return [];
  }
}

/**
 * Fonction principale pour récupérer les plateformes SVOD
 */
export async function getSVODPlatforms(
  title: string,
  type: 'movie' | 'series',
  year?: number,
): Promise<PlatformAvailability[]> {
  // Essayer d'abord l'API, puis le scraping en fallback
  const apiResults = await searchJustWatchAPI(title, type, year);
  if (apiResults.length > 0) {
    return apiResults;
  }
  
  return searchJustWatchScraping(title, type, year);
}
