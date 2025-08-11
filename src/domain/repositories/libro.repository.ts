import { Libro, CreateLibroDto } from '../entities/libro';

export interface LibroRepository {
  create(dto: CreateLibroDto): Promise<Libro>;
  findAll(): Promise<Libro[]>;
  findById(id: string): Promise<Libro | null>;
  update(id: string, dto: Partial<CreateLibroDto>): Promise<Libro | null>;
  delete(id: string): Promise<boolean>;
}

