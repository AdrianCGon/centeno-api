import { Router } from 'express';
import { ComisionController } from '../controllers/comision.controller';

export class ComisionRoutes {
  static get routes(): Router {
    const router = Router();

    // GET /api/comisiones - Obtener todas las comisiones
    router.get('/', ComisionController.getAll.bind(ComisionController));

    // POST /api/comisiones - Crear nueva comisión
    router.post('/', ComisionController.create.bind(ComisionController));

    // PATCH /api/comisiones/:id/realizada - Actualizar estado de realizada
    router.patch('/:id/realizada', ComisionController.updateRealizada.bind(ComisionController));

    // DELETE /api/comisiones/all - Eliminar todas las comisiones
    router.delete('/all', ComisionController.deleteAll.bind(ComisionController));

    // DELETE /api/comisiones/:id - Eliminar comisión individual
    router.delete('/:id', ComisionController.delete.bind(ComisionController));

    return router;
  }
} 