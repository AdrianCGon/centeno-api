import { Router } from 'express';
import { ExcelController } from '../controllers/excel.controller';

const router = Router();

// Ruta principal para comparar archivos Excel
router.post('/compare', (req, res) => ExcelController.compareExcelFiles(req, res));

// Ruta de prueba para verificar que el servicio funciona
router.get('/test', (req, res) => ExcelController.testExcelService(req, res));

// Ruta de debug para extraer texto de un archivo Excel
router.post('/extract-text', (req, res) => ExcelController.extractTextFromExcel(req, res));

// Ruta de debug para buscar comisiones en un archivo Excel
router.post('/find-comisiones', (req, res) => ExcelController.findComisionesInExcel(req, res));

// RUTAS DE TEST PARA DEBUGGING
router.get('/test-basic', (req, res) => ExcelController.testBasicFunctionality(req, res));
router.get('/test-known-data', (req, res) => ExcelController.testWithKnownData(req, res));

export class ExcelRoutes {
  static get routes(): Router {
    return router;
  }
} 