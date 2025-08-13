import express, { Router } from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import fileUpload from 'express-fileupload';

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}

export class Server {
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;
  }

  async start() {
    //* Middlewares
    this.app.use(cors({
      origin: [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'http://localhost:5174', 
        'http://localhost:5175',
        'http://143.198.185.191:3000',
        'http://143.198.185.191:5173',
        'http://143.198.185.191:5174',
        'http://143.198.185.191:5175',
	'https://fotocopias.lacentenoderecho.com',
	'https://plataforma.lacentenoderecho.com'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-HTTP-Method-Override'
      ],
      exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
      maxAge: 86400 // 24 hours
    }));

    //* Middleware adicional para asegurar headers CORS
    this.app.use((req, res, next) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000', 
        'http://localhost:5174',
        'http://localhost:5175',
        'http://143.198.185.191:3000',
        'http://143.198.185.191:5173',
        'http://143.198.185.191:5174',
        'http://143.198.185.191:5175',
	'https://fotocopias.lacentenoderecho.com',
	'https://plataforma.lacentenoderecho.com/'
      ];
      
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
      
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      next();
    });

    //* Session middleware
    this.app.use(session({
      secret: 'centeno-secret-key-2024', // Should be in envs in production
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Change to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    this.app.use(express.json()); // raw
    this.app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
    
    //* File upload middleware - COMENTADO TEMPORALMENTE PARA EVITAR CONFLICTOS
    // this.app.use(fileUpload({
    //   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    //   useTempFiles: true,
    //   tempFileDir: '/tmp/',
    //   createParentPath: true,
    //   abortOnLimit: true,
    //   responseOnLimit: 'Archivo demasiado grande. Máximo 50MB.',
    //   debug: false
    // }));

    //* Public Folder
    this.app.use(express.static(this.publicPath));

    //* Files route - para servir archivos subidos
    this.app.use('/uploads', express.static('public/uploads'));

    //* Routes
    this.app.use(this.routes);

    //* SPA /^\/(?!api).*/  <== Únicamente si no empieza con la palabra api
    this.app.get('*', (req, res) => {
      const indexPath = path.join(__dirname + `../../../${this.publicPath}/index.html`);
      res.sendFile(indexPath);
    });

    this.serverListener = this.app.listen(this.port, () => {
      console.log(`🚀 Servidor iniciado en puerto ${this.port}`);
    });
  }

  public close() {
    this.serverListener?.close();
  }
}
