export type PlatformType = 'SVOD' | 'TV' | 'CINEMA';

export type SVODPlatform =
  | 'Netflix'
  | 'Prime Video'
  | 'Disney+'
  | 'Canal+'
  | 'Apple TV+'
  | 'Crunchyroll'
  | 'ADN'
  | 'France.tv'
  | 'Arte.tv'
  | 'HBO Max'
  | 'Paramount+';

export interface PlatformAvailability {
  platform: SVODPlatform;
  availableDate: Date;
  url?: string;
  isAvailable: boolean;
  type: 'subscription' | 'rent' | 'buy';
  price?: number;
}

export interface TVBroadcast {
  channel: string;
  date: Date;
  time: string;
  episodeTitle?: string;
}

export interface CinemaRelease {
  releaseDate: Date;
  status: 'upcoming' | 'released' | 'ended';
}

