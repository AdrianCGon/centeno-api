import { Router } from 'express';

const router = Router();

// Endpoint público para verificar que el servidor esté funcionando
router.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export class HealthRoutes {
  static get routes(): Router {
    return router;
  }
} 