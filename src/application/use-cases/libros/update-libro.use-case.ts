import { Libro, CreateLibroDto } from '../../../domain/entities/libro';
import { LibroRepository } from '../../../domain/repositories/libro.repository';

export class UpdateLibroUseCase {
  constructor(private readonly repository: LibroRepository) {}
  execute(id: string, dto: Partial<CreateLibroDto>): Promise<Libro | null> {
    return this.repository.update(id, dto);
  }
}

