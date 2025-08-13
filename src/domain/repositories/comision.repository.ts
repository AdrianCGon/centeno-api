import { Comision } from '../entities/comision';

export interface ComisionRepository {
  create(comision: Omit<Comision, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Comision>;
  getAll(): Promise<Comision[]>;
  getById(id: string): Promise<Comision | null>;
  update(id: string, comision: Partial<Comision>): Promise<Comision | null>;
  delete(id: string): Promise<boolean>;
  updateRealizada(id: string, realizada: boolean): Promise<Comision | null>;
  deleteAll(): Promise<{ deletedCount: number }>;
} 