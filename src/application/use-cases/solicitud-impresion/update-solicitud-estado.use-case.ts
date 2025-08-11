import { SolicitudImpresion } from '../../../domain/entities/solicitud-impresion';
import { SolicitudImpresionRepository } from '../../../domain/repositories/solicitud-impresion.repository';

export class UpdateSolicitudEstadoUseCase {
  constructor(private readonly repository: SolicitudImpresionRepository) {}

  async execute(id: string, estado: string, observaciones?: string, nota?: string): Promise<SolicitudImpresion | null> {
    return await this.repository.updateEstado(id, estado, observaciones, nota);
  }
}