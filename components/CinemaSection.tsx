'use client';

import { CinemaRelease } from '@/lib/types/platform';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CinemaSectionProps {
  cinema?: CinemaRelease;
  title: string;
}

export default function CinemaSection({ cinema, title }: CinemaSectionProps) {
  if (!cinema) {
    return (
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Sortie Cinéma</h2>
        <p className="text-gray-600">Pas de sortie cinéma prévue en France</p>
      </section>
    );
  }

  const releaseDate = cinema.releaseDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const releaseDateOnly = new Date(releaseDate);
  releaseDateOnly.setHours(0, 0, 0, 0);

  let statusText = '';
  let statusColor = '';

  if (cinema.status === 'released' && releaseDateOnly <= today) {
    statusText = 'Disponible en salles';
    statusColor = 'text-green-600';
  } else if (cinema.status === 'upcoming' || releaseDateOnly > today) {
    statusText = `Sortie le ${format(releaseDate, 'dd/MM/yyyy', { locale: fr })}`;
    statusColor = 'text-orange-600';
  } else {
    statusText = `Sorti le ${format(releaseDate, 'dd/MM/yyyy', { locale: fr })}`;
    statusColor = 'text-gray-600';
  }

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Sortie Cinéma</h2>
      <div className="space-y-3">
        <div>
          <p className="text-gray-600 mb-1">Date de sortie en France</p>
          <p className="text-lg font-semibold">{format(releaseDate, 'dd/MM/yyyy', { locale: fr })}</p>
        </div>
        <div>
          <p className={`font-medium ${statusColor}`}>{statusText}</p>
        </div>
        <div>
          <a
            href={`https://www.allocine.fr/recherche/?q=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Voir sur Allociné →
          </a>
        </div>
      </div>
    </section>
  );
}
