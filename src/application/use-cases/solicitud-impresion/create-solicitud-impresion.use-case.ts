import { SolicitudImpresion, CreateSolicitudImpresionDto } from '../../../domain/entities/solicitud-impresion';
import { SolicitudImpresionRepository } from '../../../domain/repositories/solicitud-impresion.repository';

export class CreateSolicitudImpresionUseCase {
  constructor(private readonly repository: SolicitudImpresionRepository) {}

  async execute(data: CreateSolicitudImpresionDto): Promise<SolicitudImpresion> {
    // Calcular automáticamente el costo total y monto a abonar
    const costoTotal = (data.costoImpresion || 0) + (data.costoLibros || 0);
    const montoAbonar = Math.round(costoTotal * 0.5); // 50% del costo total
    
    // Debug: Log del cálculo
    console.log('🧮 Cálculo automático en backend:');
    console.log('  - costoImpresion recibido:', data.costoImpresion);
    console.log('  - costoLibros recibido:', data.costoLibros);
    console.log('  - costoTotal calculado:', costoTotal);
    console.log('  - montoAbonar calculado (50%):', montoAbonar);
    
    // Crear el DTO con los valores calculados
    const solicitudData = {
      ...data,
      costoTotal,
      montoAbonar
    };
    
    return await this.repository.create(solicitudData);
  }
} 