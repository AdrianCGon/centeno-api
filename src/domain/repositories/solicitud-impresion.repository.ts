import { SolicitudImpresion, CreateSolicitudImpresionDto } from '../entities/solicitud-impresion';

export abstract class SolicitudImpresionRepository {
  abstract create(data: CreateSolicitudImpresionDto): Promise<SolicitudImpresion>;
  abstract getAll(): Promise<SolicitudImpresion[]>;
  abstract getById(id: string): Promise<SolicitudImpresion | null>;
  abstract updateEstado(id: string, estado: string, observaciones?: string, nota?: string): Promise<SolicitudImpresion | null>;
  abstract getNextNumeroPedido(): Promise<number>;
} 