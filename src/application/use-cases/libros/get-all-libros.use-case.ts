import { Libro } from '../../../domain/entities/libro';
import { LibroRepository } from '../../../domain/repositories/libro.repository';

export class GetAllLibrosUseCase {
  constructor(private readonly repository: LibroRepository) {}
  execute(): Promise<Libro[]> {
    return this.repository.findAll();
  }
}

