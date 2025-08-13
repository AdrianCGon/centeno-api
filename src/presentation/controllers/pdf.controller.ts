import { Request, Response } from 'express';
import { PDFService } from '../../application/services/pdf.service';

// Extender la interfaz Request para incluir files
interface RequestWithFiles extends Request {
  files?: {
    [fieldname: string]: any;
  };
}

export class PDFController {
  private static pdfService = new PDFService();

  async comparePDFs(req: RequestWithFiles, res: Response) {
    try {
      // Verificar que se hayan enviado los archivos
      if (!req.files || !req.files.archivo1 || !req.files.archivo2) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren dos archivos PDF para la comparación'
        });
      }

      const archivo1 = req.files.archivo1 as any;
      const archivo2 = req.files.archivo2 as any;

      // Verificar que sean archivos PDF
      if (archivo1.mimetype !== 'application/pdf' || archivo2.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: 'Ambos archivos deben ser PDFs válidos'
        });
      }

      // Procesar los PDFs y encontrar coincidencias
      const matches = await PDFController.pdfService.comparePDFs(archivo1, archivo2);

      res.json({
        success: true,
        matches: matches,
        message: `Se encontraron ${matches.length} coincidencias`
      });

    } catch (error) {
      console.error('Error al comparar PDFs:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al procesar los PDFs'
      });
    }
  }

  async extractTextFromPDF(req: RequestWithFiles, res: Response) {
    try {
      if (!req.files || !req.files.archivo1) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo PDF'
        });
      }

      const archivo = req.files.archivo1 as any;
      
      if (archivo.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: 'El archivo debe ser un PDF válido'
        });
      }

      // Extraer texto del PDF
      const texto = await PDFController.pdfService.extractTextFromPDF(archivo);
      
      res.json({
        success: true,
        filename: archivo.name,
        textLength: texto.length,
        textPreview: texto.substring(0, 500),
        fullText: texto
      });

    } catch (error) {
      console.error('Error al extraer texto del PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error al extraer texto del PDF'
      });
    }
  }

  async findComisionesInPDF(req: RequestWithFiles, res: Response) {
    try {
      if (!req.files || !req.files.archivo1) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo PDF'
        });
      }

      const archivo = req.files.archivo1 as any;
      
      if (archivo.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: 'El archivo debe ser un PDF válido'
        });
      }

      // Extraer texto del PDF
      const texto = await PDFController.pdfService.extractTextFromPDF(archivo);
      
      // Buscar comisiones
      const comisiones = PDFController.pdfService.findComisiones(texto, archivo.name);
      
      res.json({
        success: true,
        filename: archivo.name,
        textLength: texto.length,
        comisiones: comisiones,
        comisionesCount: comisiones.length
      });

    } catch (error) {
      console.error('Error al buscar comisiones en el PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar comisiones en el PDF'
      });
    }
  }
}