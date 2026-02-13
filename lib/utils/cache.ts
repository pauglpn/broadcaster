/**
 * Système de cache simple en mémoire pour éviter les requêtes répétées
 * Cache valide 24h par défaut
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 heures

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Cache expiré
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Supprime une clé du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Instance singleton
export const cache = new SimpleCache();

/**
 * Génère une clé de cache pour une recherche
 */
export function getCacheKey(
  type: 'movie' | 'series',
  title: string,
  director?: string,
  year?: number,
  season?: number,
  episode?: number,
): string {
  const parts = [
    type,
    title.toLowerCase().trim(),
    director?.toLowerCase().trim() || '',
    year?.toString() || '',
    season?.toString() || '',
    episode?.toString() || '',
  ];
  return `search:${parts.join(':')}`;
}

/**
 * Génère une clé de cache pour les plateformes SVOD
 */
export function getSVODCacheKey(title: string, type: 'movie' | 'series', year?: number): string {
  return `svod:${type}:${title.toLowerCase().trim()}:${year || ''}`;
}

/**
 * Génère une clé de cache pour les dates cinéma
 */
export function getCinemaCacheKey(title: string, year?: number): string {
  return `cinema:${title.toLowerCase().trim()}:${year || ''}`;
}

/**
 * Génère une clé de cache pour les grilles TV
 */
export function getTVCacheKey(
  title: string,
  type: 'movie' | 'series',
  season?: number,
  episode?: number,
): string {
  return `tv:${type}:${title.toLowerCase().trim()}:${season || ''}:${episode || ''}`;
}
