import { ComisionRepository } from '../../domain/repositories/comision.repository';
import { Comision } from '../../domain/entities/comision';
import { ComisionDataSource } from '../datasources/comision.datasource';

export class ComisionRepositoryImpl implements ComisionRepository {
  constructor(private comisionDataSource: ComisionDataSource) {}

  async create(comision: Omit<Comision, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Comision> {
    return this.comisionDataSource.create(comision);
  }

  async getAll(): Promise<Comision[]> {
    return this.comisionDataSource.getAll();
  }

  async getById(id: string): Promise<Comision | null> {
    return this.comisionDataSource.getById(id);
  }

  async update(id: string, comision: Partial<Comision>): Promise<Comision | null> {
    return this.comisionDataSource.update(id, comision);
  }

  async delete(id: string): Promise<boolean> {
    return this.comisionDataSource.delete(id);
  }

  async updateRealizada(id: string, realizada: boolean): Promise<Comision | null> {
    return this.comisionDataSource.updateRealizada(id, realizada);
  }

  async deleteAll(): Promise<{ deletedCount: number }> {
    const deletedCount = await this.comisionDataSource.deleteAll();
    return { deletedCount };
  }
} 