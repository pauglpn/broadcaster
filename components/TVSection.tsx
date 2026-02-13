'use client';

import { TVBroadcast } from '@/lib/types/platform';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateTVScheduleExcel } from '@/lib/utils/exportExcel';
import { useState } from 'react';

interface TVSectionProps {
  broadcasts: TVBroadcast[];
  title: string;
}

export default function TVSection({ broadcasts, title }: TVSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!broadcasts || broadcasts.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Diffusion TV</h2>
        <p className="text-gray-600">Aucune diffusion TV programmée</p>
      </section>
    );
  }

  // Trier par date et heure (prochaines diffusions en premier)
  const sortedBroadcasts = [...broadcasts].sort((a, b) => {
    const dateA = new Date(`${format(a.date, 'yyyy-MM-dd')} ${a.time}`);
    const dateB = new Date(`${format(b.date, 'yyyy-MM-dd')} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const displayedBroadcasts = showAll ? sortedBroadcasts : sortedBroadcasts.slice(0, 10);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Déterminer le type de contenu depuis les broadcasts
      const contentType = sortedBroadcasts[0]?.type || 'movie';
      const buffer = await generateTVScheduleExcel(title, sortedBroadcasts, contentType);
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = format(new Date(), 'ddMMyyyy', { locale: fr });
      link.href = url;
      link.download = `Grille_TV_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export Excel:', error);
      alert('Erreur lors de l\'export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Diffusion TV</h2>
        <button
          onClick={handleExportExcel}
          disabled={isExporting}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isExporting ? 'Export en cours...' : 'Télécharger la grille TV (Excel)'}
        </button>
      </div>
      <div className="space-y-4">
        {displayedBroadcasts.map((broadcast, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">{broadcast.channel}</span>
                </div>
                <div className="text-gray-600">
                  <p>
                    {format(broadcast.date, 'dd/MM/yyyy', { locale: fr })} à {broadcast.time}
                  </p>
                  {broadcast.episodeTitle && (
                    <p className="mt-1">
                      <span className="font-medium">{broadcast.episodeTitle}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedBroadcasts.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-blue-600 hover:text-blue-800 underline"
        >
          {showAll ? 'Voir moins' : `Voir plus (${sortedBroadcasts.length - 10} autres diffusions)`}
        </button>
      )}
    </section>
  );
}
