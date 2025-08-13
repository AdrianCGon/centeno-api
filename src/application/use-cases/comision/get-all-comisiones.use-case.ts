import { ComisionRepository } from '../../../domain/repositories/comision.repository';
import { Comision } from '../../../domain/entities/comision';

export class GetAllComisionesUseCase {
  constructor(private comisionRepository: ComisionRepository) {}

  async execute(): Promise<Comision[]> {
    return this.comisionRepository.getAll();
  }
} 