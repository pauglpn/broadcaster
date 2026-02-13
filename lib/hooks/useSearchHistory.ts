'use client';

import { useState, useEffect } from 'react';

interface SearchHistoryItem {
  title: string;
  type: 'movie' | 'series';
  timestamp: number;
}

const MAX_HISTORY = 5;
const STORAGE_KEY = 'search-history';

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    // Récupération côté client uniquement
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erreur lecture historique:', e);
    }
  }, []);

  const addToHistory = (title: string, type: 'movie' | 'series') => {
    const newItem: SearchHistoryItem = {
      title,
      type,
      timestamp: Date.now(),
    };

    const newHistory = [newItem, ...history.filter((h) => h.title.toLowerCase() !== title.toLowerCase())].slice(
      0,
      MAX_HISTORY,
    );

    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Erreur sauvegarde historique:', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Erreur suppression historique:', e);
    }
  };

  return { history, addToHistory, clearHistory };
}

