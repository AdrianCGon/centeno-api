import { Request, Response } from 'express';
import { getPdfInfo } from '../../lib/pdfUtils';

export class PdfController {
  
  analyzePdf = async (req: Request, res: Response) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          ok: false,
          message: 'No se proporcionó un archivo'
        });
      }

      // Analizar el PDF
      const pdfInfo = await getPdfInfo(file.path);

      res.status(200).json({
        ok: true,
        data: {
          filename: file.originalname,
          size: file.size,
          pages: pdfInfo.pages,
          title: pdfInfo.title,
          author: pdfInfo.author,
          subject: pdfInfo.subject,
          creator: pdfInfo.creator,
          producer: pdfInfo.producer,
          creationDate: pdfInfo.creationDate,
          modificationDate: pdfInfo.modificationDate
        }
      });

    } catch (error) {
      console.error('Error al analizar PDF:', error);
      res.status(400).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Error al procesar el archivo PDF'
      });
    }
  };
}