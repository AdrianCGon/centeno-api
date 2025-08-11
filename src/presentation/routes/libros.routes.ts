import { Router } from 'express';
import { LibrosController } from '../controllers/libros.controller';
import { MongoLibroDatasource } from '../../infrastructure/datasources/libro.datasource';
import { LibroRepositoryImpl } from '../../infrastructure/repositories/libro.repository.impl';
import { CreateLibroUseCase } from '../../application/use-cases/libros/create-libro.use-case';
import { GetAllLibrosUseCase } from '../../application/use-cases/libros/get-all-libros.use-case';
import { GetLibroByIdUseCase } from '../../application/use-cases/libros/get-libro-by-id.use-case';
import { UpdateLibroUseCase } from '../../application/use-cases/libros/update-libro.use-case';
import { DeleteLibroUseCase } from '../../application/use-cases/libros/delete-libro.use-case';
import { requireAuth } from '../../lib/auth';

const router = Router();

// Inicializar dependencias
const datasource = new MongoLibroDatasource();
const repository = new LibroRepositoryImpl(datasource);

const createLibroUseCase = new CreateLibroUseCase(repository);
const getAllLibrosUseCase = new GetAllLibrosUseCase(repository);
const getLibroByIdUseCase = new GetLibroByIdUseCase(repository);
const updateLibroUseCase = new UpdateLibroUseCase(repository);
const deleteLibroUseCase = new DeleteLibroUseCase(repository);

const controller = new LibrosController(
  createLibroUseCase,
  getAllLibrosUseCase,
  getLibroByIdUseCase,
  updateLibroUseCase,
  deleteLibroUseCase
);

// Ruta pública para el frontend de fotocopias (sin autenticación)
router.get('/public', controller.getAll);

// Rutas protegidas para el admin
router.post('/', requireAuth, controller.create);
router.get('/', requireAuth, controller.getAll);
router.get('/:id', requireAuth, controller.getById);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.delete);
router.post('/__seed-demo', requireAuth, controller.seedDemo);

export class LibrosRoutes {
  static get routes(): Router {
    return router;
  }
}

