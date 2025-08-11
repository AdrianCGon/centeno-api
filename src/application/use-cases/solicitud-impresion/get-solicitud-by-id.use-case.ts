import { SolicitudImpresion } from '../../../domain/entities/solicitud-impresion';
import { SolicitudImpresionRepository } from '../../../domain/repositories/solicitud-impresion.repository';

export class GetSolicitudByIdUseCase {
  constructor(private readonly repository: SolicitudImpresionRepository) {}

  async execute(id: string): Promise<SolicitudImpresion | null> {
    return await this.repository.getById(id);
  }
} 