import { Request, Response, NextFunction } from 'express';

// Extender la interfaz de sesión para incluir propiedades personalizadas
declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    user?: string;
  }
}

// Extender la interfaz de Request para incluir propiedades de autenticación
declare global {
  namespace Express {
    interface Request {
      isAuthenticated?: boolean;
      user?: string;
    }
  }
}

// Credenciales hardcodeadas (en producción deberían estar en variables de entorno)
const ADMIN_USERNAME = 'admincento';
const ADMIN_PASSWORD = 'lacenteno1504';

// Middleware de autenticación
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Verificar si hay una sesión válida
  if (req.session && req.session.isAuthenticated) {
    req.isAuthenticated = true;
    req.user = req.session.user;
    return next();
  }

  // Si no hay sesión, verificar token en headers (para API calls)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Aquí podrías verificar un JWT token si lo implementas
    // Por ahora, verificamos si es un token simple
    if (token === 'admin-token') {
      req.isAuthenticated = true;
      req.user = ADMIN_USERNAME;
      return next();
    }
  }

  // Si no está autenticado, devolver error
  return res.status(401).json({
    ok: false,
    message: 'Acceso no autorizado. Debes iniciar sesión.'
  });
};

// Función para verificar credenciales
export const verifyCredentials = (username: string, password: string): boolean => {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
};

// Función para generar token simple (en producción usar JWT)
export const generateToken = (): string => {
  return 'admin-token';
}; 