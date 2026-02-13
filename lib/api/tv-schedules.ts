import axios from 'axios';
import { TVBroadcast } from '../types/platform';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const TELERAMA_API_URL = 'https://www.telerama.fr/api';
const TVMAG_URL = 'https://www.tvmag.lefigaro.fr';

interface TVScheduleSource {
  channel: string;
  date: Date;
  time: string;
  title: string;
  episodeTitle?: string;
  season?: number;
  episode?: number;
}

/**
 * Recherche les diffusions TV pour un programme donné
 * Essaie plusieurs sources : Télérama API, TVmag scraping, etc.
 */
export async function getTVBroadcasts(
  title: string,
  type: 'movie' | 'series',
  season?: number,
  episode?: number,
): Promise<TVBroadcast[]> {
  const broadcasts: TVBroadcast[] = [];

  // Essayer Télérama API d'abord
  const teleramaResults = await getTeleRamaSchedules(title, type, season, episode);
  broadcasts.push(...teleramaResults);

  // Si pas assez de résultats, essayer TVmag
  if (broadcasts.length < 5) {
    const tvmagResults = await getTVmagSchedules(title, type, season, episode);
    broadcasts.push(...tvmagResults);
  }

  // Trier par date et heure
  return broadcasts.sort((a, b) => {
    const dateA = new Date(`${format(a.date, 'yyyy-MM-dd')} ${a.time}`);
    const dateB = new Date(`${format(b.date, 'yyyy-MM-dd')} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Récupère les grilles depuis Télérama (si API accessible)
 */
async function getTeleRamaSchedules(
  title: string,
  type: 'movie' | 'series',
  season?: number,
  episode?: number,
): Promise<TVBroadcast[]> {
  try {
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const searchQuery = encodeURIComponent(title);
    const response = await axios.get(`${TELERAMA_API_URL}/programmes/search`, {
      params: {
        q: searchQuery,
        type: type === 'movie' ? 'film' : 'serie',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const broadcasts: TVBroadcast[] = [];
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30); // Chercher sur les 30 prochains jours

    // Parser les résultats (structure dépend de l'API Télérama)
    if (response.data && Array.isArray(response.data)) {
      for (const item of response.data.slice(0, 20)) {
        const broadcastDate = new Date(item.date || item.diffusion_date);
        if (broadcastDate >= today && broadcastDate <= maxDate) {
          broadcasts.push({
            channel: item.channel || item.chain || 'Chaîne inconnue',
            date: broadcastDate,
            time: item.time || item.horaire || '20:00',
            episodeTitle: item.episode_title || item.title,
            season: item.season || season,
            episode: item.episode || episode,
            type: type,
            reference: item.season && item.episode 
              ? `S${String(item.season).padStart(2, '0')}E${String(item.episode).padStart(2, '0')}`
              : undefined,
          });
        }
      }
    }

    return broadcasts;
  } catch (error) {
    console.error('Erreur Télérama API:', error);
    return [];
  }
}

/**
 * Scrape TVmag pour les grilles TV
 */
async function getTVmagSchedules(
  title: string,
  type: 'movie' | 'series',
  season?: number,
  episode?: number,
): Promise<TVBroadcast[]> {
  try {
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const searchQuery = encodeURIComponent(title);
    const searchUrl = `${TVMAG_URL}/recherche?q=${searchQuery}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    // Parser le HTML (simplifié, nécessiterait cheerio pour une vraie implémentation)
    const broadcasts: TVBroadcast[] = [];
    
    // Note: Cette implémentation est simplifiée
    // Une vraie implémentation nécessiterait un parsing HTML robuste avec cheerio
    
    return broadcasts;
  } catch (error) {
    console.error('Erreur scraping TVmag:', error);
    return [];
  }
}

/**
 * Liste des chaînes TNT à couvrir
 */
export const TNT_CHANNELS = [
  'TF1',
  'France 2',
  'France 3',
  'Canal+',
  'M6',
  'Arte',
  'C8',
  'TMC',
  'OCS',
  'Ciné+',
];
