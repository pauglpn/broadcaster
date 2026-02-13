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

    const results = response.data.results.slice(0, limit).map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      originalTitle: item.original_title || item.original_name,
      year: new Date(item.release_date || item.first_air_date || '').getFullYear(),
      poster: item.poster_path,
      type: type === 'movie' ? 'movie' : 'tv',
    }));

    return NextResponse.json({ suggestions: results });
  } catch (error) {
    console.error('Erreur autocomplete:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
