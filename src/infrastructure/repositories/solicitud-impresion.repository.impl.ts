import { SolicitudImpresion, CreateSolicitudImpresionDto } from '../../domain/entities/solicitud-impresion';
import { SolicitudImpresionRepository } from '../../domain/repositories/solicitud-impresion.repository';
import { MongoSolicitudImpresionDatasource } from '../datasources/solicitud-impresion.datasource';

export class SolicitudImpresionRepositoryImpl implements SolicitudImpresionRepository {
  constructor(private readonly datasource: MongoSolicitudImpresionDatasource) {}

  async create(data: CreateSolicitudImpresionDto): Promise<SolicitudImpresion> {
    return await this.datasource.create(data);
  }

  async getAll(): Promise<SolicitudImpresion[]> {
    return await this.datasource.getAll();
  }

  async getById(id: string): Promise<SolicitudImpresion | null> {
    return await this.datasource.getById(id);
  }

  async updateEstado(id: string, estado: string, observaciones?: string, nota?: string): Promise<SolicitudImpresion | null> {
    return await this.datasource.updateEstado(id, estado, observaciones, nota);
  }

  async getNextNumeroPedido(): Promise<number> {
    return await this.datasource.getNextNumeroPedido();
  }
} 