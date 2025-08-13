import { ComisionRepository } from '../../../domain/repositories/comision.repository';
import { Comision } from '../../../domain/entities/comision';

export interface CreateComisionRequest {
  periodo: string;
  actividad: string;
  modalidad: string;
  docente: string;
  horario: string;
  aula: string;
  comision: string;
}

export class CreateComisionUseCase {
  constructor(private comisionRepository: ComisionRepository) {}

  async execute(data: CreateComisionRequest): Promise<Comision> {
    const comision: Omit<Comision, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
      ...data,
      realizada: false
    };

    return this.comisionRepository.create(comision);
  }
} 