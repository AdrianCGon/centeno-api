import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import Busboy from 'busboy';

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'public/uploads/';
    
    // Determinar la carpeta según el tipo de archivo
    if (file.fieldname === 'comprobanteFile') {
      uploadPath = 'public/uploads/comprobantes/';
    } else if (file.fieldname.startsWith('materialImprimir')) {
      uploadPath = 'public/uploads/materiales/';
    }
    
    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de archivos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, JPG, JPEG y PNG'));
  }
};

// Configuración de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Configuración para múltiples campos de archivo
// Nota: Los nombres de los campos deben coincidir exactamente con los que envía el frontend
export const uploadFields = upload.fields([
  { name: 'materialImprimir1File', maxCount: 1 },
  { name: 'materialImprimir2File', maxCount: 1 },
  { name: 'materialImprimir3File', maxCount: 1 },
  { name: 'comprobanteFile', maxCount: 1 }
]);

// Versión más flexible que permite campos opcionales
export const uploadFieldsFlexible = upload.any();

// Middleware personalizado que procesa correctamente FormData
export const uploadRobust = (req: any, res: any, next: any) => {
  // Configurar multer para procesar FormData correctamente
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB
    }
  }).fields([
    { name: 'materialImprimir1File', maxCount: 1 },
    { name: 'materialImprimir2File', maxCount: 1 },
    { name: 'materialImprimir3File', maxCount: 1 },
    { name: 'comprobanteFile', maxCount: 1 }
  ]);
  
  upload(req, res, (err: any) => {
    if (err) {
      console.error('❌ Error en middleware de archivos:', err);
      // Si hay error, continuar sin archivos
      req.files = [];
    }
    
    // Asegurar que req.files exista
    if (!req.files) {
      req.files = [];
    }
    
    // Procesar manualmente los campos de texto del FormData
    if (req.body) {
      console.log('📋 req.body recibido en middleware:', req.body);
      console.log('📋 Tipos de campos:');
      Object.keys(req.body).forEach(key => {
        console.log(`  - ${key}:`, req.body[key], 'tipo:', typeof req.body[key]);
      });
      
      // Asegurar que los campos obligatorios estén presentes
      if (!req.body.nombreApellido) {
        console.log('⚠️ nombreApellido no encontrado en req.body');
      }
      if (!req.body.telefono) {
        console.log('⚠️ telefono no encontrado en req.body');
      }
      if (!req.body.textoNecesario) {
        console.log('⚠️ textoNecesario no encontrado en req.body');
      }
    } else {
      console.log('⚠️ req.body está vacío o undefined');
    }
    
    console.log('📁 Archivos recibidos en middleware robusto:', req.files.length);
    next();
  });
};

// Middleware personalizado que procesa correctamente FormData usando busboy
export const uploadBusboy = (req: any, res: any, next: any) => {
  console.log('🚀 INICIO - uploadBusboy middleware');
  console.log('📋 Content-Type:', req.headers['content-type']);
  
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('⚠️ No es multipart/form-data, continuando...');
    return next();
  }
  
  const busboy = Busboy({ 
    headers: req.headers,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB
    }
  });
  
  const fields: any = {};
  const files: any = {};
  
  // Procesar campos de texto
  busboy.on('field', (fieldname, val) => {
    console.log(`📝 Campo recibido: ${fieldname} = ${val}`);
    fields[fieldname] = val;
  });
  
  // Procesar archivos
  busboy.on('file', (fieldname, file, info) => {
    console.log(`📁 Archivo recibido: ${fieldname}`);
    const { filename, encoding, mimeType } = info;
    
    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../../../public/uploads/materiales');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(filename);
    const newFilename = `${fieldname}-${timestamp}-${randomId}${extension}`;
    const filepath = path.join(uploadDir, newFilename);
    
    // Guardar archivo
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);
    
    files[fieldname] = [{
      fieldname,
      originalname: filename,
      encoding,
      mimetype: mimeType,
      filename: newFilename,
      path: filepath,
      size: 0 // Se calculará después
    }];
    
    writeStream.on('finish', () => {
      const stats = fs.statSync(filepath);
      files[fieldname][0].size = stats.size;
      console.log(`✅ Archivo guardado: ${newFilename} (${stats.size} bytes)`);
    });
  });
  
  // Finalizar procesamiento
  busboy.on('finish', () => {
    console.log('🏁 Procesamiento de FormData completado');
    console.log('📋 Campos de texto:', fields);
    console.log('📁 Archivos:', Object.keys(files));
    
    // Asignar a req.body y req.files
    req.body = fields;
    req.files = files;
    
    next();
  });
  
  // Manejar errores
  busboy.on('error', (err) => {
    console.error('❌ Error en busboy:', err);
    req.body = {};
    req.files = {};
    next();
  });
  
  // Pipe del request a busboy
  req.pipe(busboy);
};

// Función para obtener información del archivo
export const getFileInfo = async (file: Express.Multer.File) => {
  const relativePath = file.path.replace('public/', '');
  let pages = 0;
  
  // Contar páginas si es PDF
  if (file.mimetype === 'application/pdf') {
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdf(dataBuffer);
      pages = data.numpages;
    } catch (error) {
      console.error('Error al contar páginas del PDF:', error);
      pages = 0;
    }
  }
  
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: relativePath,
    size: file.size,
    mimetype: file.mimetype,
    pages
  };
}; 