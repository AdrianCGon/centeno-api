import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';

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