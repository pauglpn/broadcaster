import axios from 'axios';
import { SearchParams, MovieResult } from '../types/movie';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'fr-FR',
  },
});

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

export interface TMDBCredits {
  crew: Array<{
    job: string;
    name: string;
  }>;
}

export async function searchTMDB(params: SearchParams): Promise<MovieResult[]> {
  try {
    const endpoint = params.type === 'movie' ? '/search/movie' : '/search/tv';

    const response = await tmdbClient.get(endpoint, {
      params: {
        query: params.title,
        year: params.year,
        page: 1,
      },
    });

    const results = await Promise.all(
      response.data.results.slice(0, 10).map(async (item: any) => {
        const credits = await getCredits(item.id, params.type);
        const director = credits.crew.find((c) => c.job === 'Director')?.name || 'Inconnu';

        if (params.director && !director.toLowerCase().includes(params.director.toLowerCase())) {
          return null;
        }

        return {
          id: item.id,
          title: item.title || item.name,
          originalTitle: item.original_title || item.original_name,
          year: new Date(item.release_date || item.first_air_date).getFullYear(),
          director,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
          overview: item.overview,
          svod: [],
          tv: [],
        } as MovieResult;
      }),
    );

    return results.filter((r) => r !== null) as MovieResult[];
  } catch (error) {
    console.error('Erreur TMDB:', error);
    throw new Error('Erreur lors de la recherche sur TMDB');
  }
}

async function getCredits(id: number, type: 'movie' | 'series'): Promise<TMDBCredits> {
  const endpoint = type === 'movie' ? `/movie/${id}/credits` : `/tv/${id}/credits`;
  const response = await tmdbClient.get(endpoint);
  return response.data;
}

export async function getWatchProviders(id: number, type: 'movie' | 'series') {
  try {
    const endpoint = type === 'movie' ? `/movie/${id}/watch/providers` : `/tv/${id}/watch/providers`;

    const response = await tmdbClient.get(endpoint);
    return response.data.results?.FR || null;
  } catch (error) {
    console.error('Erreur récupération providers:', error);
    return null;
  }
}

