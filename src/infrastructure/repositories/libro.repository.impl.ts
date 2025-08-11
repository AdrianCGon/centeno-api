import { LibroRepository } from '../../domain/repositories/libro.repository';
import { Libro, CreateLibroDto } from '../../domain/entities/libro';
import { MongoLibroDatasource } from '../datasources/libro.datasource';

export class LibroRepositoryImpl implements LibroRepository {
  constructor(private readonly datasource: MongoLibroDatasource) {}

  create(dto: CreateLibroDto): Promise<Libro> {
    return this.datasource.create(dto);
  }
  findAll(): Promise<Libro[]> {
    return this.datasource.findAll();
  }
  findById(id: string): Promise<Libro | null> {
    return this.datasource.findById(id);
  }
  update(id: string, dto: Partial<CreateLibroDto>): Promise<Libro | null> {
    return this.datasource.update(id, dto);
  }
  delete(id: string): Promise<boolean> {
    return this.datasource.delete(id);
  }
}

