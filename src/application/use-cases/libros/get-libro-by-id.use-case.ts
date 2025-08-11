import { Libro } from '../../../domain/entities/libro';
import { LibroRepository } from '../../../domain/repositories/libro.repository';

export class GetLibroByIdUseCase {
  constructor(private readonly repository: LibroRepository) {}
  execute(id: string): Promise<Libro | null> {
    return this.repository.findById(id);
  }
}

