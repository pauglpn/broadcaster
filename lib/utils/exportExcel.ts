import ExcelJS from 'exceljs';
import { TVBroadcast } from '../types/platform';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function generateTVScheduleExcel(title: string, broadcasts: TVBroadcast[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Diffusions TV');

  worksheet.columns = [
    { header: 'Programme', key: 'programme', width: 30 },
    { header: 'Épisode', key: 'episode', width: 30 },
    { header: 'Chaîne', key: 'channel', width: 15 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Heure', key: 'time', width: 10 },
  ];

  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };

  broadcasts.forEach((broadcast) => {
    worksheet.addRow({
      programme: title,
      episode: broadcast.episodeTitle || '-',
      channel: broadcast.channel,
      date: format(broadcast.date, 'dd/MM/yyyy', { locale: fr }),
      time: broadcast.time,
    });
  });

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (rowNumber > 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

