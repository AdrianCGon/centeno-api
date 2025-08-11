import { LibroRepository } from '../../../domain/repositories/libro.repository';

export class DeleteLibroUseCase {
  constructor(private readonly repository: LibroRepository) {}
  execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

