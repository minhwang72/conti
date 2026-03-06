import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  SectionType,
  AlignmentType,
  convertMillimetersToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ExportSongData } from './pdf-export';

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function loadImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

function mmToPx(mm: number): number {
  return Math.round(mm * 3.7795);
}

export async function generateSetlistDocx(songs: ExportSongData[]): Promise<void> {
  // A4: 210x297mm, standard margins (top/bottom 25.4mm, left/right 25.4mm)
  const marginMm = 15;
  const pageWidthMm = 210 - marginMm * 2; // usable width
  const pageHeightMm = 297 - marginMm * 2; // usable height
  const imageHeightMm = pageHeightMm * 0.78; // image takes ~78%, top ~22% free for text

  const sections = [];

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const imgData = `data:${song.mimeType};base64,${song.imageBase64}`;
    const { width: natW, height: natH } = await loadImageSize(imgData);

    const ratio = Math.min(pageWidthMm / natW, imageHeightMm / natH);
    const wMm = natW * ratio;
    const hMm = natH * ratio;

    const imageBytes = base64ToUint8Array(song.imageBase64);

    sections.push({
      properties: {
        type: i === 0 ? undefined : SectionType.NEXT_PAGE,
        page: {
          margin: {
            top: convertMillimetersToTwip(marginMm),
            bottom: convertMillimetersToTwip(marginMm),
            left: convertMillimetersToTwip(marginMm),
            right: convertMillimetersToTwip(marginMm),
          },
        },
      },
      children: [
        // Empty paragraphs for song form writing area
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        // Image
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: imageBytes,
              transformation: {
                width: mmToPx(wMm),
                height: mmToPx(hMm),
              },
              type: song.mimeType.includes('png') ? 'png' : 'jpg',
            }),
          ],
        }),
      ],
    });
  }

  const doc = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, '콘티.docx');
}
