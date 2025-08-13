import { Router } from 'express';
import { SolicitudImpresionController } from '../controllers/solicitud-impresion.controller';
import { MongoSolicitudImpresionDatasource } from '../../infrastructure/datasources/solicitud-impresion.datasource';
import { SolicitudImpresionRepositoryImpl } from '../../infrastructure/repositories/solicitud-impresion.repository.impl';
import { CreateSolicitudImpresionUseCase } from '../../application/use-cases/solicitud-impresion/create-solicitud-impresion.use-case';
import { GetAllSolicitudesUseCase } from '../../application/use-cases/solicitud-impresion/get-all-solicitudes.use-case';
import { GetSolicitudByIdUseCase } from '../../application/use-cases/solicitud-impresion/get-solicitud-by-id.use-case';
import { UpdateSolicitudEstadoUseCase } from '../../application/use-cases/solicitud-impresion/update-solicitud-estado.use-case';
import { uploadFields, uploadFieldsFlexible, uploadRobust, uploadBusboy } from '../../lib/fileUpload';
import { requireAuth } from '../../lib/auth';

const router = Router();

// Inicializar dependencias
const datasource = new MongoSolicitudImpresionDatasource();
const repository = new SolicitudImpresionRepositoryImpl(datasource);

const createSolicitudUseCase = new CreateSolicitudImpresionUseCase(repository);
const getAllSolicitudesUseCase = new GetAllSolicitudesUseCase(repository);
const getSolicitudByIdUseCase = new GetSolicitudByIdUseCase(repository);
const updateSolicitudEstadoUseCase = new UpdateSolicitudEstadoUseCase(repository);

const controller = new SolicitudImpresionController(
  createSolicitudUseCase,
  getAllSolicitudesUseCase,
  getSolicitudByIdUseCase,
  updateSolicitudEstadoUseCase
);

// Rutas públicas (para el frontend de fotocopias)
router.post('/', uploadFields, controller.createSolicitud);

// Ruta con middleware flexible para archivos opcionales
router.post('/flexible', uploadFieldsFlexible, controller.createSolicitud);

// Ruta con middleware robusto (recomendada)
router.post('/robust', uploadRobust, controller.createSolicitud);

// Ruta con middleware busboy (nueva implementación)
router.post('/busboy', uploadBusboy, controller.createSolicitud);

// Ruta para solicitudes solo con libros (sin archivos)
router.post('/sin-archivos', controller.createSolicitudSinArchivos);

// Ruta de prueba para debuggear el cálculo (sin archivos)
router.post('/test-calculo', controller.testCalculo);

// Rutas protegidas (para el admin)
router.get('/', requireAuth, controller.getAllSolicitudes);
router.get('/:id', requireAuth, controller.getSolicitudById);
router.patch('/:id/estado', requireAuth, controller.updateEstado);

export class SolicitudImpresionRoutes {
  static get routes(): Router {
    return router;
  }
} 