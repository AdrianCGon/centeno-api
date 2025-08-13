import { ComisionRepository } from '../../../domain/repositories/comision.repository';

export class DeleteAllComisionesUseCase {
  constructor(private comisionRepository: ComisionRepository) {}

  async execute(): Promise<{ deletedCount: number }> {
    return this.comisionRepository.deleteAll();
  }
} 