import { Router } from 'express';
import { PDFController } from '../controllers/pdf.controller';

const router = Router();
const pdfController = new PDFController();

// Ruta para comparar dos PDFs y encontrar coincidencias por comisión
router.post('/compare', pdfController.comparePDFs);

// Ruta de prueba para extraer texto de un PDF
router.post('/extract-text', pdfController.extractTextFromPDF);

// Ruta de prueba para buscar comisiones en un PDF
router.post('/find-comisiones', pdfController.findComisionesInPDF);

// Endpoint de debug para extraer texto y buscar patrones
router.post('/debug-cpo', async (req: any, res: any) => {
  try {
    if (!req.files || !req.files.archivo1) {
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    }

    const archivo = req.files.archivo1 as any;
    
    // Extraer texto del PDF usando el controlador
    const resultado = await pdfController.extractTextFromPDF(req, res);
    
    // Extraer texto directamente del PDF
    const fs = require('fs');
    const pdfParse = require('pdf-parse');
    
    const dataBuffer = fs.readFileSync(archivo.tempFilePath || archivo.path);
    const data = await pdfParse(dataBuffer);
    const texto = data.text;
    
    // Buscar patrones específicos
    const patrones = ['66U', '6X3', '7E9', '0508', '4699', '7F2', '7J6', '7Q8', '7T3'];
    const encontrados = patrones.filter(patron => texto.includes(patron));
    
    // Buscar líneas que contengan estos patrones
    const lineas = texto.split('\n');
    const lineasConPatrones = lineas
      .filter((linea: string) => patrones.some(patron => linea.includes(patron)))
      .slice(0, 20); // Solo las primeras 20 líneas
    
    return res.json({
      success: true,
      filename: archivo.name,
      textLength: texto.length,
      patronesEncontrados: encontrados,
      totalPatrones: encontrados.length,
      lineasConPatrones: lineasConPatrones,
      muestraTexto: texto.substring(0, 500) // Primeros 500 caracteres
    });
  } catch (error) {
    console.error('Error en debug-cpo:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export class PDFRoutes {
  static get routes(): Router {
    return router;
  }
} 