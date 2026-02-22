'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAutocomplete } from '@/lib/hooks/useAutocomplete';

export default function SearchForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const [season, setSeason] = useState<number | ''>('');
  const [episode, setEpisode] = useState<number | ''>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { suggestions, isLoading, selectedIndex, clearSuggestions, selectNext, selectPrevious } =
    useAutocomplete(title, { contentType: type, minChars: 2, maxResults: 8 });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  const isFormValid = title.length >= 2;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const params = new URLSearchParams();
    params.set('title', title);
    if (director) params.set('director', director);
    if (year) params.set('year', year.toString());
    params.set('type', type);
    if (type === 'series' && season) params.set('season', season.toString());
    if (type === 'series' && episode) params.set('episode', episode.toString());

    router.push(`/results?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setTitle(suggestion.title);
    clearSuggestions();
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectNext();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectPrevious();
    } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Nom du programme avec autocomplétion */}
      <div className="relative">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Nom du programme <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Inception, Breaking Bad..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
          required
          minLength={2}
        />
        {showSuggestions && title.length >= 2 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-gray-500">Chargement...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {suggestion.poster && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${suggestion.poster}`}
                        alt=""
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{suggestion.title}</div>
                      {suggestion.originalTitle !== suggestion.title && (
                        <div className="text-sm text-gray-500">{suggestion.originalTitle}</div>
                      )}
                      <div className="text-sm text-gray-400">{Number.isNaN(suggestion.year) ? '' : suggestion.year}</div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500">Aucun résultat trouvé.</div>
            )}
          </div>
        )}
      </div>

      {/* Réalisateur */}
      <div>
        <label htmlFor="director" className="block text-sm font-medium mb-2">
          Réalisateur
        </label>
        <input
          id="director"
          type="text"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          placeholder="Ex: Christopher Nolan"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Type et Année */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2">
            Type de contenu
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="movie"
                checked={type === 'movie'}
                onChange={(e) => {
                  setType(e.target.value as 'movie' | 'series');
                  setSeason('');
                  setEpisode('');
                }}
                className="mr-2"
              />
              Film
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="series"
                checked={type === 'series'}
                onChange={(e) => {
                  setType(e.target.value as 'movie' | 'series');
                  setSeason('');
                  setEpisode('');
                }}
                className="mr-2"
              />
              Série
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-2">
            Année de sortie
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les années</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Saison et Épisode (si série) */}
      {type === 'series' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="season" className="block text-sm font-medium mb-2">
              Saison
            </label>
            <input
              id="season"
              type="number"
              value={season}
              onChange={(e) => setSeason(e.target.value ? parseInt(e.target.value) : '')}
              min="1"
              placeholder="Ex: 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="episode" className="block text-sm font-medium mb-2">
              Numéro d'épisode
            </label>
            <input
              id="episode"
              type="number"
              value={episode}
              onChange={(e) => setEpisode(e.target.value ? parseInt(e.target.value) : '')}
              min="1"
              placeholder="Ex: 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Bouton de recherche */}
      <button
        type="submit"
        disabled={!isFormValid}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          isFormValid
            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Rechercher
      </button>
    </form>
  );
}
