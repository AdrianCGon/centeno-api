import { ComisionRepository } from '../../../domain/repositories/comision.repository';

export class DeleteComisionUseCase {
  constructor(private comisionRepository: ComisionRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.comisionRepository.delete(id);
  }
} 