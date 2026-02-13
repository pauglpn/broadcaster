import { PlatformAvailability, TVBroadcast, CinemaRelease } from './platform';

export interface SearchParams {
  title: string;
  director?: string;
  year?: number;
  type: 'movie' | 'series';
  season?: number;
  episode?: number;
}

export interface MovieResult {
  id: number;
  title: string;
  originalTitle: string;
  year: number;
  director: string;
  poster?: string;
  overview: string;

  cinema?: CinemaRelease;
  svod: PlatformAvailability[];
  tv: TVBroadcast[];
}

export interface SeriesResult extends MovieResult {
  numberOfSeasons: number;
  numberOfEpisodes: number;
}

