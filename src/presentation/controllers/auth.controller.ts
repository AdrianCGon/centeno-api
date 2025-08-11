import { Request, Response } from 'express';
import { verifyCredentials, generateToken } from '../../lib/auth';

export class AuthController {
  constructor() {}

  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          ok: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }

      if (verifyCredentials(username, password)) {
        // Establecer sesión
        req.session.isAuthenticated = true;
        req.session.user = username;
        
        // Generar token
        const token = generateToken();

        res.json({
          ok: true,
          message: 'Login exitoso',
          data: {
            user: username,
            token
          }
        });
      } else {
        res.status(401).json({
          ok: false,
          message: 'Credenciales inválidas'
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor'
      });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      // Destruir sesión
      req.session.destroy((err) => {
        if (err) {
          console.error('Error al destruir sesión:', err);
          return res.status(500).json({
            ok: false,
            message: 'Error al cerrar sesión'
          });
        }

        res.json({
          ok: true,
          message: 'Sesión cerrada exitosamente'
        });
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor'
      });
    }
  };

  checkAuth = async (req: Request, res: Response) => {
    try {
      if (req.session && req.session.isAuthenticated) {
        res.json({
          ok: true,
          message: 'Usuario autenticado',
          data: {
            user: req.session.user,
            isAuthenticated: true
          }
        });
      } else {
        res.status(401).json({
          ok: false,
          message: 'Usuario no autenticado',
          data: {
            isAuthenticated: false
          }
        });
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor'
      });
    }
  };
} 