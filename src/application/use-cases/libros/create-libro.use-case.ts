import { Libro, CreateLibroDto } from '../../../domain/entities/libro';
import { LibroRepository } from '../../../domain/repositories/libro.repository';

export class CreateLibroUseCase {
  constructor(private readonly repository: LibroRepository) {}
  execute(dto: CreateLibroDto): Promise<Libro> {
    return this.repository.create(dto);
  }
}

