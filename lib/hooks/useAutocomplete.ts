'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface AutocompleteSuggestion {
  id: number;
  title: string;
  originalTitle: string;
  year: number;
  poster: string | null;
  type: 'movie' | 'tv';
  director?: string;
}

interface UseAutocompleteOptions {
  minChars?: number;
  maxResults?: number;
  contentType: 'movie' | 'series';
}

export function useAutocomplete(
  query: string,
  options: UseAutocompleteOptions = { minChars: 2, maxResults: 8, contentType: 'movie' },
) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < (options.minChars || 2)) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(searchQuery)}&type=${options.contentType}&limit=${
            options.maxResults || 8
          }`,
        );

        if (!response.ok) throw new Error('Erreur autocomplete');

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        // Erreur silencieuse pour ne pas gêner l’expérience
        console.error('Erreur fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [options.contentType, options.maxResults, options.minChars],
  );

  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSelectedIndex(-1);
  }, []);

  const selectNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
  }, [suggestions.length]);

  const selectPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
  }, []);

  // Réinitialiser l’index sélectionné quand les suggestions changent
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  return {
    suggestions,
    isLoading,
    selectedIndex,
    clearSuggestions,
    selectNext,
    selectPrevious,
    hasSearched: debouncedQuery.length >= (options.minChars || 2),
  };
}

