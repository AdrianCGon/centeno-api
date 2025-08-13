import { Router } from 'express';
import { SolicitudImpresionRoutes } from './routes/solicitud-impresion.routes';
import { LibrosRoutes } from './routes/libros.routes';
import { AuthRoutes } from './routes/auth.routes';
import { HealthRoutes } from './routes/health.routes';
import { PDFRoutes } from './routes/pdf.routes';
import { ExcelRoutes } from './routes/excel.routes';
import { ComisionRoutes } from './routes/comision.routes';
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
    
    // Rutas de PDF (públicas)
    router.use('/api/pdf', PDFRoutes.routes);
    
    // Rutas de Excel (públicas)
    router.use('/api/excel', ExcelRoutes.routes);

    // Rutas de Comisiones (públicas)
    router.use('/api/comisiones', ComisionRoutes.routes);

    return router;
  }
}

