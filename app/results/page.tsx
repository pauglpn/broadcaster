'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MovieResult } from '@/lib/types/movie';
import CinemaSection from '@/components/CinemaSection';
import TVSection from '@/components/TVSection';
import SVODSection from '@/components/SVODSection';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la recherche');
        }

        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.get('title')) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Aucun résultat trouvé</h1>
          <p className="text-gray-600 mb-6">
            Aucun programme ne correspond à votre recherche. Essayez avec d'autres critères.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            Nouvelle recherche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {results.map((result) => (
          <div key={result.id} className="space-y-6">
            {/* Informations générales */}
            <section className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {result.poster && (
                  <img
                    src={result.poster}
                    alt={result.title}
                    className="w-full sm:w-48 h-auto sm:h-72 object-cover rounded-lg mx-auto sm:mx-0"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{result.title}</h1>
                  {result.originalTitle !== result.title && (
                    <p className="text-base sm:text-lg text-gray-600 mb-4">{result.originalTitle}</p>
                  )}
                  <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                    <p>
                      <span className="font-semibold">Réalisateur :</span> {result.director}
                    </p>
                    <p>
                      <span className="font-semibold">Année :</span> {result.year}
                    </p>
                    {result.overview && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Synopsis :</p>
                        <p className="text-gray-600">{result.overview}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section Cinéma */}
            <CinemaSection cinema={result.cinema} title={result.title} />

            {/* Section TV */}
            <TVSection broadcasts={result.tv} title={result.title} />

            {/* Section SVOD */}
            <SVODSection platforms={result.svod} />
          </div>
        ))}
      </div>
    </div>
  );
}
