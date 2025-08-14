import { SolicitudImpresion, CreateSolicitudImpresionDto } from '../../../domain/entities/solicitud-impresion';
import { SolicitudImpresionRepository } from '../../../domain/repositories/solicitud-impresion.repository';

export class CreateSolicitudImpresionUseCase {
  constructor(private readonly repository: SolicitudImpresionRepository) {}

  async execute(data: CreateSolicitudImpresionDto): Promise<SolicitudImpresion> {
    return await this.repository.create(data);
  }
} 