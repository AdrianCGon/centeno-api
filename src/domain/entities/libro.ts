export interface Libro {
  id?: string;
  categoria: string;
  titulo: string;
  autor: string;
  edicion?: string;
  precio?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLibroDto {
  categoria: string;
  titulo: string;
  autor: string;
  edicion?: string;
  precio?: number | null;
}

