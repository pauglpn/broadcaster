import ExcelJS from 'exceljs';
import { TVBroadcast } from '../types/platform';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function generateTVScheduleExcel(
  title: string,
  broadcasts: TVBroadcast[],
  contentType: 'movie' | 'series' = 'movie',
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Diffusions TV');

  // Définir les colonnes selon les spécifications
  worksheet.columns = [
    { header: 'Programme', key: 'programme', width: 30 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Épisode', key: 'episode', width: 30 },
    { header: 'Référence', key: 'reference', width: 12 },
    { header: 'Chaîne', key: 'channel', width: 20 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Heure', key: 'time', width: 10 },
    { header: 'Date complète', key: 'dateComplete', width: 20 },
  ];

  // Formatage de l'en-tête : fond bleu foncé, texte blanc, gras
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 11, name: 'Arial', color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' }, // Bleu foncé
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  // Trier les diffusions par date et heure (ordre chronologique)
  const sortedBroadcasts = [...broadcasts].sort((a, b) => {
    const dateA = new Date(`${format(a.date, 'yyyy-MM-dd')} ${a.time}`);
    const dateB = new Date(`${format(b.date, 'yyyy-MM-dd')} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Ajouter les lignes de données
  sortedBroadcasts.forEach((broadcast) => {
    const dateStr = format(broadcast.date, 'dd/MM/yyyy', { locale: fr });
    const dateComplete = `${dateStr} ${broadcast.time}`;
    const type = broadcast.type || contentType;
    const reference = broadcast.reference || 
      (type === 'series' && broadcast.season && broadcast.episode
        ? `S${String(broadcast.season).padStart(2, '0')}E${String(broadcast.episode).padStart(2, '0')}`
        : '');

    worksheet.addRow({
      programme: title,
      type: type === 'movie' ? 'Film' : 'Série',
      episode: broadcast.episodeTitle || '',
      reference: reference,
      channel: broadcast.channel,
      date: dateStr,
      time: broadcast.time,
      dateComplete: dateComplete,
    });
  });

  // Formatage des cellules : police Arial taille 11, bordures, alignement
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11 };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (rowNumber > 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // Activer les filtres sur toutes les colonnes
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 8 },
  };

  // Auto-ajuster la largeur des colonnes
  worksheet.columns.forEach((column) => {
    if (column.width) {
      column.width = Math.max(column.width || 10, 10);
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

