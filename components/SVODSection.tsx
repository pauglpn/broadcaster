'use client';

import { PlatformAvailability } from '@/lib/types/platform';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SVODSectionProps {
  platforms: PlatformAvailability[];
}

const platformLogos: Record<string, string> = {
  'Netflix': '/logos/netflix.png',
  'Prime Video': '/logos/prime-video.png',
  'Disney+': '/logos/disney-plus.png',
  'Canal+': '/logos/canal-plus.png',
  'Apple TV+': '/logos/apple-tv.png',
  'Crunchyroll': '/logos/crunchyroll.png',
  'ADN': '/logos/adn.png',
  'France.tv': '/logos/france-tv.png',
  'Arte.tv': '/logos/arte.png',
  'HBO Max': '/logos/hbo-max.png',
  'Paramount+': '/logos/paramount-plus.png',
};

export default function SVODSection({ platforms }: SVODSectionProps) {
  if (!platforms || platforms.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Plateformes SVOD</h2>
        <p className="text-gray-600">Pas encore disponible en streaming en France</p>
      </section>
    );
  }

  // Séparer les plateformes disponibles maintenant et à venir
  const availableNow = platforms.filter((p) => p.isAvailable);
  const comingSoon = platforms.filter((p) => !p.isAvailable);

  // Trier : disponibles maintenant en premier
  const sortedPlatforms = [...availableNow, ...comingSoon];

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Plateformes SVOD</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {sortedPlatforms.map((platform, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                {platformLogos[platform.platform] ? (
                  <img
                    src={platformLogos[platform.platform]}
                    alt={platform.platform}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-xs sm:text-sm text-center px-2">{platform.platform}</span>
                )}
              </div>

              {/* Nom */}
              <h3 className="font-semibold">{platform.platform}</h3>

              {/* Statut */}
              <div className="flex items-center gap-2">
                {platform.isAvailable ? (
                  <>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600 font-medium">Disponible maintenant</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="text-sm text-orange-600 font-medium">
                      Disponible à partir du {format(platform.availableDate, 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </>
                )}
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500">
                {platform.isAvailable
                  ? `Depuis le ${format(platform.availableDate, 'dd/MM/yyyy', { locale: fr })}`
                  : `Disponible le ${format(platform.availableDate, 'dd/MM/yyyy', { locale: fr })}`}
              </p>

              {/* Bouton */}
              {platform.url && (
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Voir sur {platform.platform}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
