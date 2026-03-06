import jsPDF from 'jspdf';

export interface ExportSongData {
  imageBase64: string;
  mimeType: string;
  title?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateSetlistPdf(songs: ExportSongData[]): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const maxW = pageWidth - margin * 2;
  const maxH = (pageHeight - margin * 2) * 0.78; // image ~78%, top ~22% free

  for (let i = 0; i < songs.length; i++) {
    if (i > 0) doc.addPage();

    const song = songs[i];
    const imgData = `data:${song.mimeType};base64,${song.imageBase64}`;

    const img = await loadImage(imgData);
    const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    const x = margin + (maxW - w) / 2;

    // Image starts after the top free area
    const topFree = (pageHeight - margin * 2) * 0.22;
    const y = margin + topFree;

    // Light dashed separator
    doc.setDrawColor(210);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);
    doc.setLineDashPattern([], 0);

    const format = song.mimeType.includes('png') ? 'PNG' : 'JPEG';
    doc.addImage(imgData, format, x, y, w, h);
  }

  doc.save('콘티.pdf');
}
