import { Router } from 'express';
import { SolicitudImpresionRoutes } from './routes/solicitud-impresion.routes';
import { LibrosRoutes } from './routes/libros.routes';
import { AuthRoutes } from './routes/auth.routes';
import { HealthRoutes } from './routes/health.routes';
import { requireAuth } from '../lib/auth';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    
    // Ruta de health check (pública)
    router.use('/api/health', HealthRoutes.routes);
    
    // Rutas de autenticación (públicas)
    router.use('/api/auth', AuthRoutes.routes);
    
    // Rutas de solicitudes de impresión (públicas para crear, protegidas para admin)
    router.use('/api/solicitudes', SolicitudImpresionRoutes.routes);
    
    // Rutas de libros (públicas y protegidas)
    router.use('/api/libros', LibrosRoutes.routes);

    return router;
  }
}

