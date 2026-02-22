import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'movie';
  const limit = parseInt(searchParams.get('limit') || '8');

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY manquante dans .env.local');
    return NextResponse.json(
      { suggestions: [], error: 'Configuration API manquante' },
      { status: 200 },
    );
  }

  try {
    const endpoint = type === 'movie' ? '/search/movie' : '/search/tv';
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'fr-FR',
        query,
        page: 1,
      },
    });

    const rawResults = response.data.results || [];
    const results = rawResults.slice(0, limit).map((item: any) => {
      const dateStr = item.release_date || item.first_air_date || '';
      const year = dateStr ? new Date(dateStr).getFullYear() : 0;
      return {
        id: item.id,
        title: item.title || item.name,
        originalTitle: item.original_title || item.original_name || '',
        year: Number.isInteger(year) ? year : 0,
        poster: item.poster_path || null,
        type: type === 'movie' ? 'movie' : 'tv',
      };
    });

    return NextResponse.json({ suggestions: results });
  } catch (error) {
    console.error('Erreur autocomplete:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
