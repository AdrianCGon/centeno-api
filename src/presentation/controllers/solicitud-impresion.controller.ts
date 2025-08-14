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
      const {
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
      } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

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

      if (files.materialImprimir1File && files.materialImprimir1File[0]) {
        const fileInfo = await getFileInfo(files.materialImprimir1File[0]);
        materialImprimir1Path = fileInfo.path;
        materialImprimir1Size = fileInfo.size;
        materialImprimir1Pages = fileInfo.pages;
      }

      if (files.materialImprimir2File && files.materialImprimir2File[0]) {
        const fileInfo = await getFileInfo(files.materialImprimir2File[0]);
        materialImprimir2Path = fileInfo.path;
        materialImprimir2Size = fileInfo.size;
        materialImprimir2Pages = fileInfo.pages;
      }

      if (files.materialImprimir3File && files.materialImprimir3File[0]) {
        const fileInfo = await getFileInfo(files.materialImprimir3File[0]);
        materialImprimir3Path = fileInfo.path;
        materialImprimir3Size = fileInfo.size;
        materialImprimir3Pages = fileInfo.pages;
      }

      // Procesar comprobante de pago
      let comprobantePath: string | undefined;
      let comprobanteSize: number | undefined;

      if (files.comprobanteFile && files.comprobanteFile[0]) {
        const fileInfo = await getFileInfo(files.comprobanteFile[0]);
        comprobantePath = fileInfo.path;
        comprobanteSize = fileInfo.size;
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
        costoImpresion,
        costoLibros,
        costoTotal,
        montoAbonar,
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