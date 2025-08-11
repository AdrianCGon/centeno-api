import { SolicitudImpresion } from '../../../domain/entities/solicitud-impresion';
import { SolicitudImpresionRepository } from '../../../domain/repositories/solicitud-impresion.repository';

export class GetAllSolicitudesUseCase {
  constructor(private readonly repository: SolicitudImpresionRepository) {}

  async execute(): Promise<SolicitudImpresion[]> {
    return await this.repository.getAll();
  }
} 