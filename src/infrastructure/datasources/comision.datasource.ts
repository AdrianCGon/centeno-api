import { Comision } from '../../domain/entities/comision';
import mongoose, { Schema, Document } from 'mongoose';

interface ComisionDocument extends Document, Omit<Comision, 'id'> {
  id: string;
}

const ComisionSchema = new Schema<ComisionDocument>({
  periodo: { type: String, required: true },
  actividad: { type: String, required: true },
  modalidad: { type: String, required: true },
  docente: { type: String, required: true },
  horario: { type: String, required: true },
  aula: { type: String, required: true },
  comision: { type: String, required: true },
  realizada: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

ComisionSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

const ComisionModel = mongoose.model<ComisionDocument>('Comision', ComisionSchema);

export class ComisionDataSource {
  async create(comision: Omit<Comision, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Comision> {
    console.log('📝 Datos recibidos en datasource.create:', comision);
    console.log('📝 Tipo de comision:', typeof comision);
    console.log('📝 Claves de comision:', Object.keys(comision));
    
    const nuevaComision = new ComisionModel({
      ...comision,
      realizada: false,           // ✅ Agregar campo realizado por defecto
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });
    
    console.log('📝 Creando nueva comisión:', {
      periodo: comision.periodo,
      actividad: comision.actividad,
      modalidad: comision.modalidad,
      docente: comision.docente,
      horario: comision.horario,
      aula: comision.aula,
      comision: comision.comision
    });
    
    const saved = await nuevaComision.save();
    
    console.log('💾 Comisión guardada en BD:', {
      _id: saved._id,
      id: saved.id,
      periodo: saved.periodo,
      actividad: saved.actividad,
      modalidad: saved.modalidad,
      docente: saved.docente,
      horario: saved.horario,
      aula: saved.aula,
      comision: saved.comision,
      realizada: saved.realizada
    });
    
    const comisionObj = saved.toObject();
    
    // Asegurar que el campo id sea el _id de MongoDB
    if (comisionObj._id) {
      comisionObj.id = comisionObj._id.toString();
    }
    
    console.log('📤 Comisión convertida a enviar:', {
      _id: comisionObj._id,
      id: comisionObj.id,
      periodo: comisionObj.periodo,
      actividad: comisionObj.actividad,
      modalidad: comisionObj.modalidad,
      docente: comisionObj.docente,
      horario: comisionObj.horario,
      aula: comisionObj.aula,
      comision: comisionObj.comision,
      realizada: comisionObj.realizada
    });
    
    return comisionObj;
  }

  async getAll(): Promise<Comision[]> {
    const comisiones = await ComisionModel.find().sort({ fechaCreacion: -1 });
    
    console.log('📥 Comisiones encontradas en BD:', comisiones.length);
    
    const comisionesConvertidas = comisiones.map(c => {
      const comisionObj = c.toObject();
      
      // Asegurar que el campo id sea el _id de MongoDB
      if (comisionObj._id) {
        comisionObj.id = comisionObj._id.toString();
      }
      
      console.log('🔍 Comisión individual:', {
        _id: c._id,
        id: comisionObj.id,
        periodo: comisionObj.periodo,
        actividad: comisionObj.actividad,
        modalidad: comisionObj.modalidad,
        docente: comisionObj.docente,
        horario: comisionObj.horario,
        aula: comisionObj.aula,
        comision: comisionObj.comision,
        realizada: comisionObj.realizada
      });
      return comisionObj;
    });
    
    console.log('📤 Comisiones convertidas a enviar:', comisionesConvertidas.length);
    
    return comisionesConvertidas;
  }

  async getById(id: string): Promise<Comision | null> {
    const comision = await ComisionModel.findById(id);
    return comision ? comision.toObject() : null;
  }

  async update(id: string, comision: Partial<Comision>): Promise<Comision | null> {
    const updated = await ComisionModel.findByIdAndUpdate(
      id, 
      { ...comision, fechaActualizacion: new Date() }, 
      { new: true }
    );
    return updated ? updated.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ComisionModel.findByIdAndDelete(id);
    return !!result;
  }

  async updateRealizada(id: string, realizada: boolean): Promise<Comision | null> {
    const comision = await ComisionModel.findByIdAndUpdate(
      id, 
      { realizada, fechaActualizacion: new Date() }, 
      { new: true }
    );
    
    if (comision) {
      const comisionObj = comision.toObject();
      
      // Asegurar que el campo id sea el _id de MongoDB
      if (comisionObj._id) {
        comisionObj.id = comisionObj._id.toString();
      }
      
      return comisionObj;
    }
    
    return null;
  }

  async deleteAll(): Promise<number> {
    const result = await ComisionModel.deleteMany({});
    return result.deletedCount;
  }
} 