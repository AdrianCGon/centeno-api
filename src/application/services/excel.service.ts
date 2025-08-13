import * as XLSX from 'xlsx';

export interface ComisionExcel {
  nombre: string;
  archivo: string;
  pagina: number;
  texto: string;
  periodoLectivo?: string;
  actividad?: string;
  comision?: string;
  modalidad?: string;
  docente?: string;
  horario?: string;
  aula?: string;
}

export interface MatchResultExcel {
  comision: string;
  archivo1: ComisionExcel;
  archivo2: ComisionExcel;
  similitud: number;
}

export class ExcelService {
  /**
   * Extrae texto de un archivo Excel
   */
  static async extractTextFromExcel(archivo: any): Promise<string> {
    try {
      const dataBuffer = archivo.tempFilePath || archivo.path;
      const workbook = XLSX.readFile(dataBuffer);
      
      let textoCompleto = '';
      
      // Iterar por todas las hojas del archivo
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convertir cada fila a texto
        for (const row of jsonData) {
          if (Array.isArray(row)) {
            const rowText = row.map(cell => cell || '').join(' ');
            if (rowText.trim()) {
              textoCompleto += rowText + '\n';
            }
          }
        }
      }
      
      return textoCompleto;
    } catch (error) {
      console.error('Error al extraer texto del Excel:', error);
      throw new Error('Error al procesar el archivo Excel');
    }
  }

  /**
   * Busca comisiones en un archivo Excel
   */
  static findComisionesInExcel(archivo: any): ComisionExcel[] {
    try {
      const dataBuffer = archivo.tempFilePath || archivo.path;
      const workbook = XLSX.readFile(dataBuffer);
      const comisiones: ComisionExcel[] = [];
      
      // Iterar por todas las hojas del archivo
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // PRIMERA PASADA: Identificar la columna "Comisión" en el header
        let columnaComision = -1;
        if (jsonData.length > 0) {
          const headerRow = jsonData[0];
          if (Array.isArray(headerRow)) {
            for (let colIndex = 0; colIndex < headerRow.length; colIndex++) {
              const headerValue = String(headerRow[colIndex] || '');
              if (headerValue.toLowerCase().includes('comisión') || headerValue.toLowerCase().includes('comision')) {
                columnaComision = colIndex;
                console.log(`🔍 Columna "Comisión" identificada en hoja "${sheetName}" en posición ${colIndex}: "${headerValue}"`);
                break;
              }
            }
          }
        }
        
        // SEGUNDA PASADA: Procesar cada fila buscando comisiones
        for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) { // Empezar desde 1 para saltar el header
          const row = jsonData[rowIndex];
          if (!Array.isArray(row) || row.length === 0) continue;
          
          // Si tenemos una columna de comisión identificada, usarla
          if (columnaComision >= 0) {
            const comision = this.extractComisionDataFromColumn(row, rowIndex, columnaComision, sheetName);
            if (comision) {
              comisiones.push(comision);
              continue; // Pasar a la siguiente fila
            }
          }
          
          // Fallback: buscar patrones de comisión en cualquier celda
          const comision = this.findComisionInRow(row, rowIndex, sheetName);
          if (comision) {
            comisiones.push(comision);
          }
        }
      }
      
      console.log(`📊 Total de comisiones encontradas: ${comisiones.length}`);
      return comisiones;
      
    } catch (error) {
      console.error('Error al buscar comisiones en Excel:', error);
      return [];
    }
  }

  /**
   * Busca una comisión en una fila específica
   */
  private static findComisionInRow(row: any[], rowIndex: number, sheetName: string): ComisionExcel | null {
    // PRIMERA PASADA: Buscar en la columna llamada "Comisión" (si existe)
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellValue = String(row[colIndex] || '');
      
      // Si la celda contiene exactamente "Comisión" o "COMISIÓN", buscar en la siguiente fila (headers)
      if (cellValue.toLowerCase().includes('comisión') || cellValue.toLowerCase().includes('comision')) {
        console.log(`🔍 Encontrada columna de comisión en posición ${colIndex}: "${cellValue}"`);
        
        // IMPORTANTE: Si encontramos la columna "Comisión", extraer el valor directamente
        // No buscar patrones, sino tomar el valor tal como está
        const comision = this.extractComisionDataFromColumn(row, rowIndex, colIndex, sheetName);
        if (comision) {
          console.log(`✅ Comisión extraída de columna "Comisión":`, comision);
          return comision;
        }
      }
    }
    
    // SEGUNDA PASADA: Buscar patrones de comisión en cualquier celda (fallback)
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellValue = String(row[colIndex] || '');
      
      // Buscar patrones de comisión
      if (this.isComisionPattern(cellValue)) {
        const comision = this.extractComisionData(row, rowIndex, colIndex, sheetName);
        if (comision) {
          console.log(`✅ Comisión encontrada por patrón:`, comision);
          return comision;
        }
      }
    }
    
    return null;
  }

  /**
   * Verifica si un valor de celda coincide con un patrón de comisión
   */
  private static isComisionPattern(value: string): boolean {
    // Limpiar el valor
    const cleanValue = value.trim();
    
    // Patrones de comisión:
    // - 131, 6007 (números de 3-4 dígitos)
    // - 4H6, 3E2 (formato dígito-letra-dígito)
    // - 134B, 9658A (formato dígitos-letra)
    
    const comisionPatterns = [
      /^\d{3,4}$/,           // 131, 6007, 9658, 9659
      /^\d{1,2}[A-Z]\d{1,2}$/, // 4H6, 3E2, 5A1
      /^\d{3,4}[A-Z]$/,      // 134B, 9658A
      /^[A-Z]\d{2,3}$/       // A123, B15
    ];
    
    const isComision = comisionPatterns.some(pattern => pattern.test(cleanValue));
    
    if (isComision) {
      console.log(`🔢 Valor "${cleanValue}" identificado como patrón de comisión`);
    }
    
    return isComision;
  }

  /**
   * Extrae datos de comisión de una fila
   */
  private static extractComisionData(row: any[], rowIndex: number, colIndex: number, sheetName: string): ComisionExcel | null {
    try {
      const comisionValue = String(row[colIndex] || '');
      const comisionCode = this.extractComisionCode(comisionValue);
      
      if (!comisionCode) return null;
      
      // Extraer información contextual de las celdas cercanas
      const info = this.extractContextualInfo(row, colIndex);
      
      // Log de debug para ver qué se extrajo
      console.log(`🔍 Datos extraídos para comisión ${comisionCode}:`, info);
      
      // Si no se extrajo comisión pero sí actividad, intentar extraer comisión de la actividad
      if (!info.comision && info.actividad) {
        const comisionFromActividad = this.extractComisionCode(info.actividad);
        if (comisionFromActividad) {
          info.comision = comisionFromActividad;
          console.log(`🔢 Código de comisión extraído de actividad: ${comisionFromActividad}`);
        }
      }
      
      const comisionData = {
        nombre: `Comisión ${comisionCode}`,
        archivo: sheetName,
        pagina: rowIndex + 1,
        texto: `${comisionCode} - ${info.actividad || 'Sin descripción'}`,
        periodoLectivo: info.periodoLectivo || 'N/A',
        actividad: info.actividad || 'N/A',
        comision: info.comision || comisionCode, // Usar comisión extraída o el código original
        modalidad: info.modalidad || 'N/A',
        docente: info.docente || 'N/A',
        horario: info.horario || 'N/A',
        aula: info.aula || 'N/A'
      };
      
      // Log de debug para ver la comisión final
      console.log(`📋 Comisión final creada:`, comisionData);
      
      // Verificar si hay campos con "N/A" o vacíos
      const camposConNA = Object.entries(comisionData)
        .filter(([key, value]) => value === 'N/A' || value === '')
        .map(([key, value]) => key);
      
      if (camposConNA.length > 0) {
        console.warn(`⚠️ Comisión ${comisionCode} tiene campos con "N/A" o vacíos:`, camposConNA);
      }
      
      return comisionData;
    } catch (error) {
      console.error('Error al extraer datos de comisión:', error);
      return null;
    }
  }

  /**
   * Extrae el código de comisión de un valor
   */
  private static extractComisionCode(value: string): string | null {
    // Buscar números de comisión
    // Patrones: 131, 6007, 4H6, etc.
    // También buscar al inicio de textos como "131 - TEORÍA GENERAL DEL DERECHO"
    
    // Primero intentar extraer del inicio del texto (formato "131 - ...")
    const inicioMatch = value.match(/^(\d{3,4}[A-Z]?|[A-Z]\d{2,3})\s*[-–]/);
    if (inicioMatch) {
      const code = inicioMatch[1];
      console.log(`🔍 Código de comisión extraído del inicio: "${code}" de "${value}"`);
      return code;
    }
    
    // Luego intentar el patrón general
    const match = value.match(/(\d{3,4}[A-Z]?|[A-Z]\d{2,3}|\d{4}|\d{3})/);
    
    if (match) {
      const code = match[1];
      console.log(`🔍 Código de comisión extraído: "${code}" de "${value}"`);
      return code;
    }
    
    console.log(`❌ No se pudo extraer código de comisión de: "${value}"`);
    return null;
  }

  /**
   * Extrae datos de comisión de una columna específica
   */
  private static extractComisionDataFromColumn(row: any[], rowIndex: number, colIndex: number, sheetName: string): ComisionExcel | null {
    try {
      const comisionValue = String(row[colIndex] || '');
      const comisionCode = this.extractComisionCode(comisionValue);

      if (!comisionCode) return null;

      // Extraer información contextual de las celdas cercanas
      const info = this.extractContextualInfo(row, colIndex);

      // Log de debug para ver qué se extrajo
      console.log(`🔍 Datos extraídos para comisión ${comisionCode} (columna):`, info);

      // Si no se extrajo comisión pero sí actividad, intentar extraer comisión de la actividad
      if (!info.comision && info.actividad) {
        const comisionFromActividad = this.extractComisionCode(info.actividad);
        if (comisionFromActividad) {
          info.comision = comisionFromActividad;
          console.log(`🔢 Código de comisión extraído de actividad (columna): ${comisionFromActividad}`);
        }
      }

      const comisionData = {
        nombre: `Comisión ${comisionCode}`,
        archivo: sheetName,
        pagina: rowIndex + 1,
        texto: `${comisionCode} - ${info.actividad || 'Sin descripción'}`,
        periodoLectivo: info.periodoLectivo || 'N/A',
        actividad: info.actividad || 'N/A',
        comision: info.comision || comisionCode, // Usar comisión extraída o el código original
        modalidad: info.modalidad || 'N/A',
        docente: info.docente || 'N/A',
        horario: info.horario || 'N/A',
        aula: info.aula || 'N/A'
      };

      // Log de debug para ver la comisión final
      console.log(`📋 Comisión final creada (columna):`, comisionData);

      // Verificar si hay campos con "N/A" o vacíos
      const camposConNA = Object.entries(comisionData)
        .filter(([key, value]) => value === 'N/A' || value === '')
        .map(([key, value]) => key);

      if (camposConNA.length > 0) {
        console.warn(`⚠️ Comisión ${comisionCode} tiene campos con "N/A" o vacíos (columna):`, camposConNA);
      }

      return comisionData;
    } catch (error) {
      console.error('Error al extraer datos de comisión (columna):', error);
      return null;
    }
  }

  /**
   * Extrae información contextual de las celdas cercanas
   */
  private static extractContextualInfo(row: any[], colIndex: number): any {
    const info: any = {};
    
    const cellClassifications: Array<{value: string, type: string}> = [];
    
    // Log de debug para ver la fila completa
    console.log(`🔍 Procesando fila completa:`, row);
    console.log(`🔍 Columna de comisión en posición: ${colIndex}`);
    
    // Primera pasada: clasificar todas las celdas
    for (let i = 0; i < row.length; i++) {
      const cellValue = String(row[i] || '');
      if (!cellValue || cellValue === 'undefined' || cellValue === 'null') continue;
      
      console.log(`  📍 Celda ${i}: "${cellValue}"`);
      
      // Clasificar cada celda por prioridad (ajustada para comisiones)
      // Prioridad: periodo > comision > aula > modalidad > horario > actividad > docente
      if (this.isPeriodoLectivo(cellValue)) {
        cellClassifications.push({value: cellValue, type: 'periodoLectivo'});
        console.log(`    ✅ Clasificado como periodoLectivo`);
      } else if (this.isComisionPattern(cellValue)) {
        // Si es un patrón de comisión, verificar si también es una actividad
        if (this.isActividad(cellValue)) {
          // Es tanto comisión como actividad (como "131 - TEORÍA GENERAL DEL DERECHO")
          cellClassifications.push({value: cellValue, type: 'comision'});
          cellClassifications.push({value: cellValue, type: 'actividad'});
          console.log(`    🔢📚 Clasificado como comisión Y actividad`);
        } else {
          // Solo es comisión
          cellClassifications.push({value: cellValue, type: 'comision'});
          console.log(`    🔢 Clasificado como comision`);
        }
      } else if (this.isAula(cellValue)) {
        cellClassifications.push({value: cellValue, type: 'aula'});
        console.log(`    🏫 Clasificado como aula`);
      } else if (this.isModalidad(cellValue)) {
        cellClassifications.push({value: cellValue, type: 'modalidad'});
        console.log(`    🔄 Clasificado como modalidad`);
      } else if (this.isHorario(cellValue)) {
        cellClassifications.push({value: cellValue, type: 'horario'});
        console.log(`    🕐 Clasificado como horario`);
      } else if (this.isActividad(cellValue)) {
        // Solo clasificar como actividad si NO es aula ni comisión
        if (!this.isAula(cellValue) && !this.isComisionPattern(cellValue)) {
          cellClassifications.push({value: cellValue, type: 'actividad'});
          console.log(`    📚 Clasificado como actividad`);
        } else {
          console.log(`    ❌ No clasificado como actividad (es aula o comisión)`);
        }
      } else if (this.isDocente(cellValue)) {
        cellClassifications.push({value: cellValue, type: 'docente'});
        console.log(`    👨‍🏫 Clasificado como docente`);
      } else {
        // Log temporal para valores no clasificados
        console.log(`    ❓ Valor no clasificado: "${cellValue}"`);
      }
    }
    
    // Segunda pasada: asignar valores basados en prioridad
    for (const classification of cellClassifications) {
      if (!info[classification.type]) {
        info[classification.type] = classification.value;
      }
    }
    
    // Log temporal para mostrar qué se extrajo
    if (Object.keys(info).length > 0) {
      console.log(`📋 Información extraída de la fila:`, info);
    } else {
      console.log(`⚠️ No se extrajo información de la fila`);
    }
    
    return info;
  }

  /**
   * Verifica si un valor es un período lectivo
   */
  private static isPeriodoLectivo(value: string): boolean {
    return value.toLowerCase().includes('cuatrimestre') || 
           value.toLowerCase().includes('bimestre') ||
           value.toLowerCase().includes('2025') ||
           value.toLowerCase().includes('2024');
  }

  /**
   * Verifica si un valor es una actividad
   */
  private static isActividad(value: string): boolean {
    // Excluir valores que claramente NO son actividades
    if (this.isPeriodoLectivo(value) || this.isModalidad(value) || 
        this.isDocente(value) || this.isHorario(value)) {
      return false;
    }
    
    // Excluir valores que son claramente aulas
    if (this.isAula(value)) {
      return false;
    }
    
    // Excluir números simples que podrían ser aulas
    if (/^\d{1,3}$/.test(value)) {
      return false;
    }
    
    // IMPORTANTE: NO excluir valores que son isComisionPattern si son textos largos
    // porque "131 - TEORÍA GENERAL DEL DERECHO" es tanto comisión como actividad
    
    // Buscar patrones de actividad
    const actividadPatterns = [
      /derecho/i,
      /teoría/i,
      /filosofía/i,
      /notarial/i,
      /tributario/i,
      /procesal/i,
      /civil/i,
      /penal/i,
      /constitucional/i,
      /administrativo/i,
      /laboral/i,
      /comercial/i,
      /internacional/i,
      /público/i,
      /privado/i,
      /materia/i,
      /asignatura/i,
      /curso/i,
      /seminario/i,
      /taller/i,
      /práctica/i,
      /clínica/i,
      /interpretación/i,
      /constitucional/i,
      /afro/i,
      /comunidades/i,
      /negras/i,
      /argentina/i,
      /perspectiva/i
    ];
    
    // Si contiene alguna de estas palabras, es una actividad
    if (actividadPatterns.some(pattern => pattern.test(value))) {
      return true;
    }
    
    // Si es un texto largo (más de 10 caracteres) y no es otro tipo, probablemente sea una actividad
    if (value.length > 10 && value.length < 100 && 
        !/^\d+$/.test(value) && 
        !/^[A-Z\s]+$/.test(value)) {
      return true;
    }
    
    return false;
  }

  /**
   * Verifica si un valor es una modalidad
   */
  private static isModalidad(value: string): boolean {
    return value.toLowerCase().includes('presencial') ||
           value.toLowerCase().includes('virtual') ||
           value.toLowerCase().includes('remota') ||
           value.toLowerCase().includes('híbrida') ||
           value.toLowerCase().includes('online');
  }

  /**
   * Verifica si un valor es un docente
   */
  private static isDocente(value: string): boolean {
    // Buscar patrones de nombres
    const namePatterns = [
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/,  // Nombre Apellido
      /^[A-Z][A-Z]+\s+[A-Z][A-Z]+/,  // NOMBRE APELLIDO
      /^[A-Z][a-z]+-[A-Z][a-z]+/,     // Nombre-Apellido
      /^[A-Z][A-Z]+-[A-Z][A-Z]+/     // NOMBRE-APELLIDO
    ];
    
    const isDocente = namePatterns.some(pattern => pattern.test(value)) &&
                      value.length > 3 && 
                      value.length < 50;
    
    return isDocente;
  }

  /**
   * Verifica si un valor es un horario
   */
  private static isHorario(value: string): boolean {
    const timePatterns = [
      /(Lun|Mar|Mié|Jue|Vie|Sáb|Dom)\s+\d{1,2}:\d{2}/,
      /\d{1,2}:\d{2}\s+a\s+\d{1,2}:\d{2}/,
      /^\d{1,2}:\d{2}/,
      /\d{1,2}:\d{2}/
    ];
    
    const isHorario = timePatterns.some(pattern => pattern.test(value)) ||
                      value.toLowerCase().includes('lun') ||
                      value.toLowerCase().includes('mar') ||
                      value.toLowerCase().includes('mie') ||
                      value.toLowerCase().includes('jue') ||
                      value.toLowerCase().includes('vie') ||
                      value.toLowerCase().includes('sab') ||
                      value.toLowerCase().includes('dom');
    
    return isHorario;
  }

  /**
   * Verifica si un valor es un aula
   */
  private static isAula(value: string): boolean {
    // Limpiar el valor
    const cleanValue = value.trim();
    
    // Log específico para debuggear números como "131", "204"
    if (/^\d{1,3}$/.test(cleanValue)) {
      console.log(`🔍 Debug aula numérica: "${cleanValue}" - Longitud: ${cleanValue.length}`);
    }
    
    // Si está vacío, no es un aula
    if (!cleanValue || cleanValue === 'undefined' || cleanValue === 'null') {
      return false;
    }
    
    // Excluir valores que claramente NO son aulas
    if (this.isPeriodoLectivo(cleanValue) || 
        this.isModalidad(cleanValue) || 
        this.isDocente(cleanValue) || 
        this.isHorario(cleanValue) ||
        this.isComisionPattern(cleanValue)) {
      return false;
    }
    
    // Excluir números de comisión (4 dígitos como 9658, 9659, etc.)
    if (/^\d{4}$/.test(cleanValue) && parseInt(cleanValue) >= 1000) {
      return false;
    }
    
    // Excluir códigos de comisión con letras (como 134B)
    if (/^\d{3,4}[A-Z]$/.test(cleanValue)) {
      return false;
    }
    
    // EXCLUIR CÓDIGOS DE COMISIÓN DE 3 DÍGITOS (como "131")
    if (/^\d{3}$/.test(cleanValue)) {
      console.log(`❌ Valor "${cleanValue}" excluido de aula (es código de comisión)`);
      return false;
    }
    
    // Patrones de aula más flexibles y comunes
    const aulaPatterns = [
      // Números simples (1-2 dígitos) - para aulas como "1", "2", "10", "20"
      /^\d{1,2}$/,                   
      
      // Formato específico como "3E2 (PUB)", "4H6 (FIL)" - PRIORIDAD ALTA
      /^\d{1,2}[A-Z]\d{1,2}\s*\([A-Z]+\)$/,  // "3E2 (PUB)", "4H6 (FIL)", "5A1 (LAB)", etc.
      /^\d{1,2}[A-Z]\d{1,2}\s*\([A-Z\s]+\)$/, // "3E2 (PUB)", "4H6 (FIL)", "5A1 (LAB)", etc.
      
      // Formato específico como "3E2 (PUB)" - más flexible
      /^\d{1,2}[A-Z]\d{1,2}\s*\([A-Z]+\)$/,  // "3E2 (PUB)", "4H6 (FIL)", etc.
      
      // Formato "Aula X" o "AULA X"
      /^(Aula|AULA)\s*\d+/,          
      
      // Formato "Lab-X" o "LAB-X"
      /^(Lab|LAB)[-\s]\d+/,          
      
      // Formato "Sala X" o "SALA X"
      /^(Sala|SALA)\s*\d+/,          
      
      // Formato "Auditorio X" o "AUDITORIO X"
      /^(Auditorio|AUDITORIO)\s*\d+/, 
      
      // Formato "Piso X" o "PISO X"
      /^(Piso|PISO)\s*\d+/,          
      
      // Formato "Nivel X" o "NIVEL X"
      /^(Nivel|NIVEL)\s*\d+/,        
      
      // Formato "Bloque X" o "BLOQUE X"
      /^(Bloque|BLOQUE)\s*[A-Z]/,    
      
      // Formato "Edificio X" o "EDIFICIO X"
      /^(Edificio|EDIFICIO)\s*\d+/,  
      
      // Formato "Torre X" o "TORRE X"
      /^(Torre|TORRE)\s*[A-Z]/,      
      
      // Formato "A123", "B15", etc.
      /^[A-Z]\d{2,3}$/,             
      
      // Formato "1A", "2B", etc.
      /^\d{1,2}[A-Z]$/,             
      
      // Formato "A1", "B2", etc.
      /^[A-Z]\d{1,2}$/,             
      
      // Formato "A-123", "B-15", etc.
      /^[A-Z]-\d{2,3}$/,            
      
      // Formato "1-A", "2-B", etc.
      /^\d{1,2}-[A-Z]$/,            
      
      // Formato "A 123", "B 15", etc.
      /^[A-Z]\s\d{2,3}$/,           
      
      // Formato "1 A", "2 B", etc.
      /^\d{1,2}\s[A-Z]$/,           
      
      // Formato "Aula Virtual" o "AULA VIRTUAL"
      /^(Aula|AULA)\s+(Virtual|VIRTUAL)/,
      
      // Formato "Sala Virtual" o "SALA VIRTUAL"
      /^(Sala|SALA)\s+(Virtual|VIRTUAL)/,
      
      // Formato "Zoom" o "ZOOM"
      /^(Zoom|ZOOM)$/i,
      
      // Formato "Meet" o "MEET"
      /^(Meet|MEET)$/i,
      
      // Formato "Teams" o "TEAMS"
      /^(Teams|TEAMS)$/i,
      
      // Formato "Virtual" o "VIRTUAL" solo
      /^(Virtual|VIRTUAL)$/i,
      
      // Formato "Online" o "ONLINE"
      /^(Online|ONLINE)$/i,
      
      // Formato "Remoto" o "REMOTO"
      /^(Remoto|REMOTO)$/i,
      
      // Formato "Híbrido" o "HÍBRIDO"
      /^(Híbrido|HÍBRIDO)$/i,
      
      // Formato "Presencial" o "PRESENCIAL"
      /^(Presencial|PRESENCIAL)$/i,
      
      // Formato "Aula" o "AULA" solo
      /^(Aula|AULA)$/i,
      
      // Formato "Sala" o "SALA" solo
      /^(Sala|SALA)$/i,
      
      // Formato "Laboratorio" o "LABORATORIO"
      /^(Laboratorio|LABORATORIO)$/i,
      
      // Formato "Lab" o "LAB" solo
      /^(Lab|LAB)$/i,
      
      // Formato "Auditorio" o "AUDITORIO" solo
      /^(Auditorio|AUDITORIO)$/i,
      
      // Formato "Piso" o "PISO" solo
      /^(Piso|PISO)$/i,
      
      // Formato "Nivel" o "NIVEL" solo
      /^(Nivel|NIVEL)$/i,
      
      // Formato "Bloque" o "BLOQUE" solo
      /^(Bloque|BLOQUE)$/i,
      
      // Formato "Edificio" o "EDIFICIO" solo
      /^(Edificio|EDIFICIO)$/i,
      
      // Formato "Torre" o "TORRE" solo
      /^(Torre|TORRE)$/i
    ];
    
    // Verificar si coincide con algún patrón de aula
    const isAula = aulaPatterns.some(pattern => pattern.test(cleanValue));
    
    // Log específico para números como "131", "204"
    if (/^\d{1,3}$/.test(cleanValue)) {
      console.log(`🔍 Patrón aula encontrado: ${isAula} para "${cleanValue}"`);
    }
    
    // Si no coincide con patrones, verificar casos especiales
    if (!isAula) {
      // Casos especiales que podrían ser aulas
      const specialCases = [
        // Textos cortos que no son otros tipos
        cleanValue.length <= 8 && 
        cleanValue.length >= 2 && 
        !/^[A-Z\s]+$/.test(cleanValue) && // No solo mayúsculas y espacios
        !/^\d+$/.test(cleanValue) &&      // No solo números
        !this.isActividad(cleanValue) &&   // No es actividad
        !this.isDocente(cleanValue)        // No es docente
      ];
      
      return specialCases.some(case_ => case_);
    }
    
    return true;
  }

  /**
   * Compara dos archivos Excel y encuentra coincidencias
   */
  static compareExcelFiles(archivo1: any, archivo2: any): MatchResultExcel[] {
    try {
      const comisiones1 = this.findComisionesInExcel(archivo1);
      const comisiones2 = this.findComisionesInExcel(archivo2);
      
      const matches: MatchResultExcel[] = [];
      
      // Buscar coincidencias por código de comisión
      for (const com1 of comisiones1) {
        for (const com2 of comisiones2) {
          if (com1.comision && com2.comision && com1.comision === com2.comision) {
            // Combinar información de ambos archivos, priorizando el aula disponible
            const comisionCombinada = this.combinarInformacionComisiones(com1, com2);
            matches.push({
              comision: `Comisión ${com1.comision}`,
              archivo1: comisionCombinada,
              archivo2: com2,
              similitud: 100
            });
          }
        }
      }
      
      // Si no hay coincidencias exactas, buscar por similitud de texto
      if (matches.length === 0) {
        for (const com1 of comisiones1) {
          for (const com2 of comisiones2) {
            const similitud = this.calculateSimilarity(com1, com2);
            if (similitud > 70) { // Umbral de similitud
              // Combinar información de ambos archivos, priorizando el aula disponible
              const comisionCombinada = this.combinarInformacionComisiones(com1, com2);
              matches.push({
                comision: `Comisión ${com1.comision || com2.comision || 'Desconocida'}`,
                archivo1: comisionCombinada,
                archivo2: com2,
                similitud: similitud
              });
            }
          }
        }
      }
      
      return matches;
      
    } catch (error) {
      console.error('Error al comparar archivos Excel:', error);
      return [];
    }
  }

  /**
   * Combina la información de dos comisiones, priorizando campos disponibles
   */
  private static combinarInformacionComisiones(com1: ComisionExcel, com2: ComisionExcel): ComisionExcel {
    const combinada: ComisionExcel = {
      nombre: com1.nombre || com2.nombre,
      archivo: com1.archivo || com2.archivo,
      pagina: com1.pagina || com2.pagina,
      texto: com1.texto || com2.texto,
      periodoLectivo: com1.periodoLectivo !== 'N/A' ? com1.periodoLectivo : com2.periodoLectivo,
      actividad: com1.actividad !== 'N/A' ? com1.actividad : com2.actividad,
      comision: com1.comision || com2.comision,
      modalidad: com1.modalidad !== 'N/A' ? com1.modalidad : com2.modalidad,
      docente: com1.docente !== 'N/A' ? com1.docente : com2.docente,
      horario: com1.horario !== 'N/A' ? com1.horario : com2.horario,
      aula: com1.aula !== 'N/A' ? com1.aula : com2.aula
    };
    
    return combinada;
  }

  /**
   * Calcula la similitud entre dos comisiones
   */
  private static calculateSimilarity(com1: ComisionExcel, com2: ComisionExcel): number {
    let score = 0;
    let totalFields = 0;
    
    // Comparar campos relevantes
    const fields = ['actividad', 'modalidad', 'docente', 'horario'];
    
    for (const field of fields) {
      const val1 = com1[field as keyof ComisionExcel];
      const val2 = com2[field as keyof ComisionExcel];
      
      if (val1 && val2 && val1 !== 'N/A' && val2 !== 'N/A') {
        totalFields++;
        const str1 = String(val1);
        const str2 = String(val2);
        if (str1.toLowerCase() === str2.toLowerCase()) {
          score += 100;
        } else if (this.stringSimilarity(str1, str2) > 0.7) {
          score += 80;
        } else if (this.stringSimilarity(str1, str2) > 0.5) {
          score += 60;
        }
      }
    }
    
    return totalFields > 0 ? score / totalFields : 0;
  }

  /**
   * Calcula la similitud entre dos strings
   */
  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calcula la distancia de Levenshtein entre dos strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
} 