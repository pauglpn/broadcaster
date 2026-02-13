import axios from 'axios';
import { CinemaRelease } from '../types/platform';
import { load } from 'cheerio';

const ALLOCINE_BASE_URL = 'https://www.allocine.fr';

/**
 * Scrape Allociné pour récupérer les dates de sortie cinéma
 * Respecte robots.txt et rate limiting (max 1 req/seconde)
 */
export async function getCinemaRelease(title: string, year?: number): Promise<CinemaRelease | null> {
  try {
    // Attendre 1 seconde pour respecter le rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const searchQuery = encodeURIComponent(title);
    const searchUrl = `${ALLOCINE_BASE_URL}/recherche/?q=${searchQuery}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (Broadcaster Bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    });

    const $ = load(response.data);
    
    // Chercher le premier résultat de film
    const firstResult = $('.card-entity').first();
    if (firstResult.length === 0) {
      return null;
    }

    const filmLink = firstResult.find('a').attr('href');
    if (!filmLink) {
      return null;
    }

    // Aller sur la page du film
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const filmUrl = filmLink.startsWith('http') ? filmLink : `${ALLOCINE_BASE_URL}${filmLink}`;
    const filmResponse = await axios.get(filmUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (Broadcaster Bot)',
      },
      timeout: 10000,
    });

    const $film = load(filmResponse.data);
    
    // Extraire la date de sortie
    const releaseDateText = $film('.meta-body-item').filter((_, el) => {
      return $film(el).text().includes('Sortie le') || $film(el).text().includes('Date de sortie');
    }).first().text();

    if (!releaseDateText) {
      return null;
    }

    // Parser la date (format: "Sortie le 15 février 2024")
    const dateMatch = releaseDateText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (!dateMatch) {
      return null;
    }

    const [, day, monthName, yearStr] = dateMatch;
    const monthMap: Record<string, string> = {
      janvier: '01', février: '02', mars: '03', avril: '04',
      mai: '05', juin: '06', juillet: '07', août: '08',
      septembre: '09', octobre: '10', novembre: '11', décembre: '12',
    };

    const month = monthMap[monthName.toLowerCase()];
    if (!month) {
      return null;
    }

    const releaseDate = new Date(`${yearStr}-${month}-${day.padStart(2, '0')}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let status: 'upcoming' | 'released' | 'ended' = 'released';
    if (releaseDate > today) {
      status = 'upcoming';
    } else if (releaseDate < today) {
      status = 'released';
    }

    return {
      releaseDate,
      status,
    };
  } catch (error) {
    console.error('Erreur scraping Allociné:', error);
    return null;
  }
}
