import fs from 'fs';
import pdfParse from 'pdf-parse';

export interface PdfInfo {
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export const getPdfInfo = async (filePath: string): Promise<PdfInfo> => {
  try {
    // Leer el archivo PDF
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parsear el PDF
    const data = await pdfParse(dataBuffer);
    
    return {
      pages: data.numpages,
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      subject: data.info?.Subject || undefined,
      creator: data.info?.Creator || undefined,
      producer: data.info?.Producer || undefined,
      creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
      modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
    };
  } catch (error) {
    console.error('Error al leer PDF:', error);
    throw new Error('No se pudo procesar el archivo PDF');
  }
};

export const getPdfPageCount = async (filePath: string): Promise<number> => {
  try {
    const info = await getPdfInfo(filePath);
    return info.pages;
  } catch (error) {
    console.error('Error al contar páginas del PDF:', error);
    return 0; // Retornar 0 si no se puede leer
  }
};