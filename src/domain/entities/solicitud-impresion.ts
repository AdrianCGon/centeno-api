export interface SolicitudImpresion {
  id: string;
  numeroPedido?: number;
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
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSolicitudImpresionDto {
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
  
  // Libros seleccionados
  librosSeleccionados?: string[];
  
  // Información adicional
  recibirInformacion?: boolean;
} 