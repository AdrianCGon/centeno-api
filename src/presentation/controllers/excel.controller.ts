import { Request, Response } from 'express';
import { ExcelService, ComisionExcel } from '../../application/services/excel.service';

interface RequestWithFiles extends Request {
  files?: any;
}

export class ExcelController {
  /**
   * Compara dos archivos Excel y encuentra coincidencias
   */
  static async compareExcelFiles(req: RequestWithFiles, res: Response) {
    try {
      if (!req.files || !req.files['archivo1'] || !req.files['archivo2']) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren dos archivos Excel para la comparación'
        });
      }

      const archivo1 = req.files['archivo1'] as any;
      const archivo2 = req.files['archivo2'] as any;

      // Comparar los archivos Excel
      const matches = ExcelService.compareExcelFiles(archivo1, archivo2);

      // Extraer comisiones individuales de cada archivo
      const comisionesArchivo1 = ExcelService.findComisionesInExcel(archivo1);
      const comisionesArchivo2 = ExcelService.findComisionesInExcel(archivo2);

      if (matches.length === 0) {
        return res.json({
          success: true,
          matches: [],
          archivo1: {
            nombre: archivo1.name,
            comisiones: comisionesArchivo1
          },
          archivo2: {
            nombre: archivo2.name,
            comisiones: comisionesArchivo2
          },
          message: 'No se encontraron coincidencias entre los archivos Excel'
        });
      }

      return res.json({
        success: true,
        matches: matches,
        archivo1: {
          nombre: archivo1.name,
          comisiones: comisionesArchivo1
        },
        archivo2: {
          nombre: archivo2.name,
          comisiones: comisionesArchivo2
        },
        message: `Se encontraron ${matches.length} coincidencias entre los archivos Excel`
      });

    } catch (error) {
      console.error('Error al comparar archivos Excel:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al procesar los archivos Excel'
      });
    }
  }

  /**
   * Extrae texto de un archivo Excel (para debug)
   */
  static async extractTextFromExcel(req: RequestWithFiles, res: Response) {
    try {
      if (!req.files || !req.files['archivo1']) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo Excel'
        });
      }

      const archivo = req.files['archivo1'] as any;
      const texto = await ExcelService.extractTextFromExcel(archivo);

      return res.json({
        success: true,
        archivo: archivo.name,
        texto: texto,
        longitud: texto.length
      });

    } catch (error) {
      console.error('Error al extraer texto del Excel:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar el archivo Excel'
      });
    }
  }

  /**
   * Busca comisiones en un archivo Excel (para debug)
   */
  static async findComisionesInExcel(req: RequestWithFiles, res: Response) {
    try {
      if (!req.files || !req.files['archivo1']) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo Excel'
        });
      }

      const archivo = req.files['archivo1'] as any;
      const comisiones = ExcelService.findComisionesInExcel(archivo);

      return res.json({
        success: true,
        archivo: archivo.name,
        comisiones: comisiones,
        total: comisiones.length
      });

    } catch (error) {
      console.error('Error al buscar comisiones en Excel:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar el archivo Excel'
      });
    }
  }

  /**
   * Endpoint de prueba para verificar que el servicio funciona
   */
  static async testExcelService(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        message: 'Servicio de Excel funcionando correctamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en test del servicio Excel:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servicio de Excel'
      });
    }
  }

  /**
   * Endpoint de prueba para verificar funcionalidad básica
   */
  static async testBasicFunctionality(req: Request, res: Response) {
    try {
      const result = ExcelService.testBasicFunctionality();
      return res.json({
        success: true,
        message: 'Test de funcionalidad básica completado',
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en test básico:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en test básico'
      });
    }
  }

  /**
   * Endpoint de prueba con datos conocidos
   */
  static async testWithKnownData(req: Request, res: Response) {
    try {
      const result = ExcelService.testWithKnownData();
      return res.json({
        success: true,
        message: 'Test con datos conocidos completado',
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en test con datos conocidos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en test con datos conocidos'
      });
    }
  }
} 