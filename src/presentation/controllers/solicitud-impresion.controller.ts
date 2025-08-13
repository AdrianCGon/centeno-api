import { Request, Response } from 'express';
import { CreateSolicitudImpresionUseCase } from '../../application/use-cases/solicitud-impresion/create-solicitud-impresion.use-case';
import { GetAllSolicitudesUseCase } from '../../application/use-cases/solicitud-impresion/get-all-solicitudes.use-case';
import { GetSolicitudByIdUseCase } from '../../application/use-cases/solicitud-impresion/get-solicitud-by-id.use-case';
import { UpdateSolicitudEstadoUseCase } from '../../application/use-cases/solicitud-impresion/update-solicitud-estado.use-case';
import { CreateSolicitudImpresionDto } from '../../domain/entities/solicitud-impresion';
import { getFileInfo } from '../../lib/fileUpload';

export class SolicitudImpresionController {
  constructor(
    private readonly createSolicitudUseCase: CreateSolicitudImpresionUseCase,
    private readonly getAllSolicitudesUseCase: GetAllSolicitudesUseCase,
    private readonly getSolicitudByIdUseCase: GetSolicitudByIdUseCase,
    private readonly updateSolicitudEstadoUseCase: UpdateSolicitudEstadoUseCase
  ) {}

  createSolicitud = async (req: Request, res: Response) => {
    try {
      console.log('🚀 INICIO - createSolicitud llamado');
      console.log('📋 Headers recibidos:', req.headers);
      console.log('📋 Content-Type:', req.headers['content-type']);
      console.log('📋 Content-Length:', req.headers['content-length']);
      
      // Para multipart/form-data, los campos de texto vienen en req.body
      // Para application/json, los campos vienen en req.body
      let nombreApellido, telefono, email, textoNecesario, costoImpresion, costoLibros, costoTotal, montoAbonar, librosSeleccionados, recibirInformacion;
      
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // Procesar FormData
        console.log('📁 Procesando FormData (multipart)');
        console.log('📋 req.body:', req.body);
        
        // Los campos de texto vienen como strings en req.body
        nombreApellido = req.body.nombreApellido;
        telefono = req.body.telefono;
        email = req.body.email;
        textoNecesario = req.body.textoNecesario;
        costoImpresion = req.body.costoImpresion;
        costoLibros = req.body.costoLibros;
        costoTotal = req.body.costoTotal;
        montoAbonar = req.body.montoAbonar;
        librosSeleccionados = req.body.librosSeleccionados;
        recibirInformacion = req.body.recibirInformacion;
      } else {
        // Procesar JSON
        console.log('📋 Procesando JSON');
        ({
          nombreApellido,
          telefono,
          email,
          textoNecesario,
          costoImpresion,
          costoLibros,
          costoTotal,
          montoAbonar,
          librosSeleccionados,
          recibirInformacion
        } = req.body);
      }

      // Debug: Log de los valores recibidos
      console.log('🔍 Valores extraídos:');
      console.log('  - nombreApellido:', nombreApellido, 'tipo:', typeof nombreApellido);
      console.log('  - telefono:', telefono, 'tipo:', typeof telefono);
      console.log('  - email:', email, 'tipo:', typeof email);
      console.log('  - textoNecesario:', textoNecesario, 'tipo:', typeof textoNecesario);
      console.log('  - costoImpresion:', costoImpresion, 'tipo:', typeof costoImpresion);
      console.log('  - costoLibros:', costoLibros, 'tipo:', typeof costoLibros);
      console.log('  - costoTotal (frontend):', costoTotal, 'tipo:', typeof costoTotal);
      console.log('  - montoAbonar (frontend):', montoAbonar, 'tipo:', typeof montoAbonar);
      console.log('  - librosSeleccionados:', librosSeleccionados, 'tipo:', typeof librosSeleccionados);
      console.log('  - recibirInformacion:', recibirInformacion, 'tipo:', typeof recibirInformacion);

      // Convertir a números si es necesario
      const costoImpresionNum = Number(costoImpresion) || 0;
      const costoLibrosNum = Number(costoLibros) || 0;
      
      console.log('🔢 Valores convertidos a números:');
      console.log('  - costoImpresionNum:', costoImpresionNum);
      console.log('  - costoLibrosNum:', costoLibrosNum);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Validar que files exista
      if (!files) {
        console.log('⚠️ No se recibieron archivos, creando solicitud solo con datos');
      } else {
        console.log('📁 Archivos recibidos:', Object.keys(files));
        console.log('📁 Detalle de archivos:', JSON.stringify(files, null, 2));
      }

      console.log('🔍 ANTES de procesar archivos');

      // Procesar archivos de material
      let materialImprimir1Path: string | undefined;
      let materialImprimir1Size: number | undefined;
      let materialImprimir1Pages: number | undefined;
      let materialImprimir2Path: string | undefined;
      let materialImprimir2Size: number | undefined;
      let materialImprimir2Pages: number | undefined;
      let materialImprimir3Path: string | undefined;
      let materialImprimir3Size: number | undefined;
      let materialImprimir3Pages: number | undefined;
      let comprobantePath: string | undefined;
      let comprobanteSize: number | undefined;

      try {
        if (files.materialImprimir1File && files.materialImprimir1File[0]) {
          console.log('📄 Procesando materialImprimir1File');
          const fileInfo = await getFileInfo(files.materialImprimir1File[0]);
          materialImprimir1Path = fileInfo.path;
          materialImprimir1Size = fileInfo.size;
          materialImprimir1Pages = fileInfo.pages;
          console.log('✅ materialImprimir1File procesado:', fileInfo);
        }

        if (files.materialImprimir2File && files.materialImprimir2File[0]) {
          console.log('📄 Procesando materialImprimir2File');
          const fileInfo = await getFileInfo(files.materialImprimir2File[0]);
          materialImprimir2Path = fileInfo.path;
          materialImprimir2Size = fileInfo.size;
          materialImprimir2Pages = fileInfo.pages;
          console.log('✅ materialImprimir2File procesado:', fileInfo);
        }

        if (files.materialImprimir3File && files.materialImprimir3File[0]) {
          console.log('📄 Procesando materialImprimir3File');
          const fileInfo = await getFileInfo(files.materialImprimir3File[0]);
          materialImprimir3Path = fileInfo.path;
          materialImprimir3Size = fileInfo.size;
          materialImprimir3Pages = fileInfo.pages;
          console.log('✅ materialImprimir3File procesado:', fileInfo);
        }

        if (files.comprobanteFile && files.comprobanteFile[0]) {
          console.log('📄 Procesando comprobanteFile');
          const fileInfo = await getFileInfo(files.comprobanteFile[0]);
          comprobantePath = fileInfo.path;
          comprobanteSize = fileInfo.size;
          console.log('✅ comprobanteFile procesado:', fileInfo);
        }
      } catch (fileError) {
        console.error('❌ Error procesando archivos:', fileError);
        throw new Error(`Error procesando archivos: ${fileError instanceof Error ? fileError.message : 'Error desconocido'}`);
      }

      const createSolicitudDto: CreateSolicitudImpresionDto = {
        nombreApellido,
        telefono,
        email,
        textoNecesario,
        materialImprimir1Path,
        materialImprimir1Size,
        materialImprimir1Pages,
        materialImprimir2Path,
        materialImprimir2Size,
        materialImprimir2Pages,
        materialImprimir3Path,
        materialImprimir3Size,
        materialImprimir3Pages,
        comprobantePath,
        comprobanteSize,
        costoImpresion: costoImpresionNum,
        costoLibros: costoLibrosNum,
        // Ignorar los valores del frontend y calcular automáticamente
        // costoTotal: undefined, // Se calculará en el use case
        // montoAbonar: undefined, // Se calculará en el use case
        librosSeleccionados: librosSeleccionados ? JSON.parse(librosSeleccionados) : undefined,
        recibirInformacion
      };

      const solicitud = await this.createSolicitudUseCase.execute(createSolicitudDto);

      res.status(201).json({
        ok: true,
        message: 'Solicitud de impresión creada exitosamente',
        data: solicitud
      });
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Método para crear solicitudes solo con libros (sin archivos)
  createSolicitudSinArchivos = async (req: Request, res: Response) => {
    try {
      const {
        nombreApellido,
        telefono,
        email,
        textoNecesario,
        costoImpresion,
        costoLibros,
        librosSeleccionados,
        recibirInformacion
      } = req.body;

      // Debug: Log de los valores recibidos
      console.log('📚 SOLICITUD SOLO LIBROS - Valores recibidos:');
      console.log('  - costoImpresion:', costoImpresion, 'tipo:', typeof costoImpresion);
      console.log('  - costoLibros:', costoLibros, 'tipo:', typeof costoLibros);
      console.log('  - librosSeleccionados:', librosSeleccionados, 'tipo:', typeof librosSeleccionados);
      console.log('  - req.body completo:', JSON.stringify(req.body, null, 2));

      // Convertir a números si es necesario
      const costoImpresionNum = Number(costoImpresion) || 0;
      const costoLibrosNum = Number(costoLibros) || 0;
      
      console.log('🔢 SOLICITUD SOLO LIBROS - Valores convertidos:');
      console.log('  - costoImpresionNum:', costoImpresionNum);
      console.log('  - costoLibrosNum:', costoLibrosNum);

      const createSolicitudDto: CreateSolicitudImpresionDto = {
        nombreApellido,
        telefono,
        email,
        textoNecesario,
        // Sin archivos
        materialImprimir1Path: undefined,
        materialImprimir1Size: undefined,
        materialImprimir1Pages: undefined,
        materialImprimir2Path: undefined,
        materialImprimir2Size: undefined,
        materialImprimir2Pages: undefined,
        materialImprimir3Path: undefined,
        materialImprimir3Size: undefined,
        materialImprimir3Pages: undefined,
        comprobantePath: undefined,
        comprobanteSize: undefined,
        costoImpresion: costoImpresionNum,
        costoLibros: costoLibrosNum,
        // Ignorar los valores del frontend y calcular automáticamente
        // costoTotal: undefined, // Se calculará en el use case
        // montoAbonar: undefined, // Se calculará en el use case
        librosSeleccionados: librosSeleccionados ? JSON.parse(librosSeleccionados) : undefined,
        recibirInformacion
      };

      const solicitud = await this.createSolicitudUseCase.execute(createSolicitudDto);

      res.status(201).json({
        ok: true,
        message: 'Solicitud de libros creada exitosamente',
        data: solicitud
      });
    } catch (error) {
      console.error('Error al crear solicitud solo libros:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Método de prueba para debuggear el cálculo
  testCalculo = async (req: Request, res: Response) => {
    try {
      const { costoImpresion, costoLibros } = req.body;
      
      console.log('🧪 TEST CALCULO - Valores recibidos:');
      console.log('  - costoImpresion:', costoImpresion, 'tipo:', typeof costoImpresion);
      console.log('  - costoLibros:', costoLibros, 'tipo:', typeof costoLibros);
      
      // Convertir a números
      const costoImpresionNum = Number(costoImpresion) || 0;
      const costoLibrosNum = Number(costoLibros) || 0;
      
      console.log('🧪 TEST CALCULO - Valores convertidos:');
      console.log('  - costoImpresionNum:', costoImpresionNum);
      console.log('  - costoLibrosNum:', costoLibrosNum);
      
      // Calcular
      const costoTotal = costoImpresionNum + costoLibrosNum;
      const montoAbonar = Math.round(costoTotal * 0.5);
      
      console.log('🧪 TEST CALCULO - Resultado:');
      console.log('  - costoTotal:', costoTotal);
      console.log('  - montoAbonar (50%):', montoAbonar);
      
      res.json({
        ok: true,
        data: {
          costoImpresion: costoImpresionNum,
          costoLibros: costoLibrosNum,
          costoTotal,
          montoAbonar
        }
      });
    } catch (error) {
      console.error('Error en testCalculo:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  getAllSolicitudes = async (req: Request, res: Response) => {
    try {
      const solicitudes = await this.getAllSolicitudesUseCase.execute();
      res.json({
        ok: true,
        data: solicitudes
      });
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  getSolicitudById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const solicitud = await this.getSolicitudByIdUseCase.execute(id);

      if (!solicitud) {
        return res.status(404).json({
          ok: false,
          message: 'Solicitud no encontrada'
        });
      }

      res.json({
        ok: true,
        data: solicitud
      });
    } catch (error) {
      console.error('Error al obtener solicitud:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  updateEstado = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { estado, observaciones, nota } = req.body;

      if (!estado) {
        return res.status(400).json({
          ok: false,
          message: 'El estado es requerido'
        });
      }

      const solicitud = await this.updateSolicitudEstadoUseCase.execute(id, estado, observaciones, nota);

      if (!solicitud) {
        return res.status(404).json({
          ok: false,
          message: 'Solicitud no encontrada'
        });
      }

      res.json({
        ok: true,
        message: 'Estado actualizado exitosamente',
        data: solicitud
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };
} 