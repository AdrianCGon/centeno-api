import mongoose, { Schema, Document } from 'mongoose';
import { Libro, CreateLibroDto } from '../../domain/entities/libro';

interface LibroDocument extends Document {
  _id: string;
  categoria: string;
  titulo: string;
  autor?: string;
  edicion?: string;
  precio?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const LibroSchema = new Schema<LibroDocument>({
  categoria: { type: String, required: true, trim: true },
  titulo: { type: String, required: true, trim: true },
  autor: { type: String, required: false, trim: true },
  edicion: { type: String, trim: true },
  precio: { type: Number, required: false },
}, { timestamps: true });

const LibroModel = mongoose.model<LibroDocument>('Libro', LibroSchema);

export class MongoLibroDatasource {
  private mapToEntity(doc: LibroDocument): Libro {
    return {
      id: doc._id.toString(),
      categoria: doc.categoria,
      titulo: doc.titulo,
      autor: doc.autor ?? '',
      edicion: doc.edicion,
      precio: doc.precio,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(dto: CreateLibroDto): Promise<Libro> {
    const libro = new LibroModel(dto);
    const saved = await libro.save();
    return this.mapToEntity(saved);
  }

  async findAll(): Promise<Libro[]> {
    const docs = await LibroModel.find().sort({ createdAt: -1 });
    return docs.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Libro | null> {
    const doc = await LibroModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async update(id: string, dto: Partial<CreateLibroDto>): Promise<Libro | null> {
    const doc = await LibroModel.findByIdAndUpdate(id, dto, { new: true });
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await LibroModel.findByIdAndDelete(id);
    return result !== null;
  }
}

