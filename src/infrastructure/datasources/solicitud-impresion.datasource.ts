import mongoose, { Document, Schema } from 'mongoose';
import { SolicitudImpresion, CreateSolicitudImpresionDto } from '../../domain/entities/solicitud-impresion';

interface SolicitudImpresionDocument extends Document {
  _id: string;
  numeroPedido: number;
  nombreApellido: string;
  telefono: string;
  email?: string;
  textoNecesario: string;
  
  // Material a imprimir
  materialImprimir1Path?: string;
  materialImprimir1Size?: number;
  materialImprimir1Pages?: number;
  materialImprimir2Path?: string;
  materialImprimir2Size?: number;
  materialImprimir2Pages?: number;
  materialImprimir3Path?: string;
  materialImprimir3Size?: number;
  materialImprimir3Pages?: number;
  
  // Comprobante de pago
  comprobantePath?: string;
  comprobanteSize?: number;
  
  // Costos
  costoImpresion?: number;
  costoLibros?: number;
  costoTotal?: number;
  montoAbonar?: number;
  montoPagado?: number;
  
  // Libros seleccionados
  librosSeleccionados?: string[];
  
  // Información adicional
  recibirInformacion?: boolean;
  
  // Estado
  estado?: string;
  archivosModificados?: boolean;
  observaciones?: string;
  nota?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const SolicitudImpresionSchema = new Schema<SolicitudImpresionDocument>({
  numeroPedido: { type: Number, unique: true },
  nombreApellido: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  textoNecesario: { type: String, required: true },
  
  // Material a imprimir
  materialImprimir1Path: String,
  materialImprimir1Size: Number,
  materialImprimir1Pages: Number,
  materialImprimir2Path: String,
  materialImprimir2Size: Number,
  materialImprimir2Pages: Number,
  materialImprimir3Path: String,
  materialImprimir3Size: Number,
  materialImprimir3Pages: Number,
  
  // Comprobante de pago
  comprobantePath: String,
  comprobanteSize: Number,
  
  // Costos
  costoImpresion: Number,
  costoLibros: Number,
  costoTotal: Number,
  montoAbonar: Number,
  montoPagado: Number,
  
  // Libros seleccionados
  librosSeleccionados: [String],
  
  // Información adicional
  recibirInformacion: Boolean,
  
  // Estado
  estado: { type: String, default: 'pendiente' },
  archivosModificados: { type: Boolean, default: false },
  observaciones: String,
  nota: String
}, { timestamps: true });

const SolicitudImpresionModel = mongoose.model<SolicitudImpresionDocument>('SolicitudImpresion', SolicitudImpresionSchema);

export class MongoSolicitudImpresionDatasource {
  async create(data: CreateSolicitudImpresionDto): Promise<SolicitudImpresion> {
    const numeroPedido = await this.getNextNumeroPedido();
    
    const solicitud = new SolicitudImpresionModel({
      ...data,
      numeroPedido
    });
    
    const savedSolicitud = await solicitud.save();
    return this.mapToEntity(savedSolicitud);
  }

  async getAll(): Promise<SolicitudImpresion[]> {
    const solicitudes = await SolicitudImpresionModel.find().sort({ createdAt: -1 });
    return solicitudes.map(this.mapToEntity);
  }

  async getById(id: string): Promise<SolicitudImpresion | null> {
    const solicitud = await SolicitudImpresionModel.findById(id);
    return solicitud ? this.mapToEntity(solicitud) : null;
  }

  async updateEstado(id: string, estado: string, observaciones?: string, nota?: string): Promise<SolicitudImpresion | null> {
    const solicitud = await SolicitudImpresionModel.findByIdAndUpdate(
      id,
      { 
        estado,
        observaciones,
        nota,
        updatedAt: new Date()
      },
      { new: true }
    );
    return solicitud ? this.mapToEntity(solicitud) : null;
  }

  async getNextNumeroPedido(): Promise<number> {
    const lastSolicitud = await SolicitudImpresionModel.findOne().sort({ numeroPedido: -1 });
    return lastSolicitud ? lastSolicitud.numeroPedido + 1 : 1;
  }

  private mapToEntity(doc: SolicitudImpresionDocument): SolicitudImpresion {
    return {
      id: doc._id.toString(),
      numeroPedido: doc.numeroPedido,
      nombreApellido: doc.nombreApellido,
      telefono: doc.telefono,
      email: doc.email,
      textoNecesario: doc.textoNecesario,
      
      // Material a imprimir
      materialImprimir1Path: doc.materialImprimir1Path,
      materialImprimir1Size: doc.materialImprimir1Size,
      materialImprimir1Pages: doc.materialImprimir1Pages,
      materialImprimir2Path: doc.materialImprimir2Path,
      materialImprimir2Size: doc.materialImprimir2Size,
      materialImprimir2Pages: doc.materialImprimir2Pages,
      materialImprimir3Path: doc.materialImprimir3Path,
      materialImprimir3Size: doc.materialImprimir3Size,
      materialImprimir3Pages: doc.materialImprimir3Pages,
      
      // Comprobante de pago
      comprobantePath: doc.comprobantePath,
      comprobanteSize: doc.comprobanteSize,
      
      // Costos
      costoImpresion: doc.costoImpresion,
      costoLibros: doc.costoLibros,
      costoTotal: doc.costoTotal,
      montoAbonar: doc.montoAbonar,
      montoPagado: doc.montoPagado,
      
      // Libros seleccionados
      librosSeleccionados: doc.librosSeleccionados,
      
      // Información adicional
      recibirInformacion: doc.recibirInformacion,
      
      // Estado
      estado: doc.estado,
      archivosModificados: doc.archivosModificados,
      observaciones: doc.observaciones,
      nota: doc.nota,
      
      // Fechas
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
} 