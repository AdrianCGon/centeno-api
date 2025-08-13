import { ComisionRepository } from '../../../domain/repositories/comision.repository';
import { Comision } from '../../../domain/entities/comision';

export class UpdateRealizadaUseCase {
  constructor(private comisionRepository: ComisionRepository) {}

  async execute(id: string, realizada: boolean): Promise<Comision | null> {
    return this.comisionRepository.updateRealizada(id, realizada);
  }
} 