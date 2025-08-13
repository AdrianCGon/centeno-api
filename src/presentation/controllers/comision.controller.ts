import { Request, Response } from 'express';
import { CreateComisionUseCase } from '../../application/use-cases/comision/create-comision.use-case';
import { GetAllComisionesUseCase } from '../../application/use-cases/comision/get-all-comisiones.use-case';
import { UpdateRealizadaUseCase } from '../../application/use-cases/comision/update-realizada.use-case';
import { DeleteAllComisionesUseCase } from '../../application/use-cases/comision/delete-all-comisiones.use-case';
import { DeleteComisionUseCase } from '../../application/use-cases/comision/delete-comision.use-case';
import { ComisionRepositoryImpl } from '../../infrastructure/repositories/comision.repository.impl';
import { ComisionDataSource } from '../../infrastructure/datasources/comision.datasource';

export class ComisionController {
  /**
   * Obtener todas las comisiones
   */
  static async getAll(req: Request, res: Response) {
    try {
      const dataSource = new ComisionDataSource();
      const repository = new ComisionRepositoryImpl(dataSource);
      const useCase = new GetAllComisionesUseCase(repository);
      const comisiones = await useCase.execute();

      return res.json({
        success: true,
        data: comisiones,
        message: 'Comisiones obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener comisiones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener comisiones'
      });
    }
  }

  /**
   * Crear nueva comisión
   */
  static async create(req: Request, res: Response) {
    try {
      const { periodo, actividad, modalidad, docente, horario, aula, comision } = req.body;

      // Log de debug para ver qué datos llegan
      console.log('🔍 Datos recibidos en create comisión:', {
        periodo,
        actividad,
        modalidad,
        docente,
        horario,
        aula,
        comision
      });

      // Log de debug para ver el tipo y contenido de cada campo
      console.log('🔍 Tipos de datos recibidos:');
      console.log('  - periodo:', typeof periodo, `"${periodo}"`);
      console.log('  - actividad:', typeof actividad, `"${actividad}"`);
      console.log('  - modalidad:', typeof modalidad, `"${modalidad}"`);
      console.log('  - docente:', typeof docente, `"${docente}"`);
      console.log('  - horario:', typeof horario, `"${horario}"`);
      console.log('  - aula:', typeof aula, `"${aula}"`);
      console.log('  - comision:', typeof comision, `"${comision}"`);

      // Log de debug para ver el body completo
      console.log('🔍 Body completo recibido:', req.body);
      console.log('🔍 Headers recibidos:', req.headers);

      // Verificar cada campo individualmente
      console.log('🔍 Verificación de campos recibidos:');
      console.log('  - periodo:', periodo ? '✅' : '❌', `"${periodo}"`);
      console.log('  - actividad:', actividad ? '✅' : '❌', `"${actividad}"`);
      console.log('  - modalidad:', modalidad ? '✅' : '❌', `"${modalidad}"`);
      console.log('  - docente:', docente ? '✅' : '❌', `"${docente}"`);
      console.log('  - horario:', horario ? '✅' : '❌', `"${horario}"`);
      console.log('  - aula:', aula ? '✅' : '❌', `"${aula}"`);
      console.log('  - comision:', comision ? '✅' : '❌', `"${comision}"`);

      if (!periodo || !actividad || !modalidad || !docente || !horario || !aula || !comision) {
        console.log('❌ Campos faltantes:', {
          periodo: !!periodo,
          actividad: !!actividad,
          modalidad: !!modalidad,
          docente: !!docente,
          horario: !!horario,
          aula: !!aula,
          comision: !!comision
        });
        
        // Mostrar qué campos específicos están faltando
        const camposFaltantes = [];
        if (!periodo) camposFaltantes.push('periodo');
        if (!actividad) camposFaltantes.push('actividad');
        if (!modalidad) camposFaltantes.push('modalidad');
        if (!docente) camposFaltantes.push('docente');
        if (!horario) camposFaltantes.push('horario');
        if (!aula) camposFaltantes.push('aula');
        if (!comision) camposFaltantes.push('comision');
        
        console.log('❌ Campos faltantes específicos:', camposFaltantes);
        
        return res.status(400).json({
          success: false,
          message: `Campos faltantes: ${camposFaltantes.join(', ')}`
        });
      }

      const dataSource = new ComisionDataSource();
      const repository = new ComisionRepositoryImpl(dataSource);
      const useCase = new CreateComisionUseCase(repository);
      const comisionCreada = await useCase.execute({
        periodo,
        actividad,
        modalidad,
        docente,
        horario,
        aula,
        comision
      });

      console.log('✅ Comisión creada exitosamente:', comisionCreada);

      return res.status(201).json({
        success: true,
        data: comisionCreada,
        message: 'Comisión creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear comisión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear comisión'
      });
    }
  }

  /**
   * Actualizar estado de realizada
   */
  static async updateRealizada(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { realizada } = req.body;

      if (typeof realizada !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'El campo "realizada" debe ser un booleano'
        });
      }

      const dataSource = new ComisionDataSource();
      const repository = new ComisionRepositoryImpl(dataSource);
      const useCase = new UpdateRealizadaUseCase(repository);
      const comision = await useCase.execute(id, realizada);

      if (!comision) {
        return res.status(404).json({
          success: false,
          message: 'Comisión no encontrada'
        });
      }

      return res.json({
        success: true,
        data: comision,
        message: 'Estado de comisión actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar estado de comisión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar comisión'
      });
    }
  }

  /**
   * Eliminar todas las comisiones
   */
  static async deleteAll(req: Request, res: Response) {
    try {
      const dataSource = new ComisionDataSource();
      const repository = new ComisionRepositoryImpl(dataSource);
      const useCase = new DeleteAllComisionesUseCase(repository);
      const result = await useCase.execute();

      return res.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Se eliminaron ${result.deletedCount} comisiones exitosamente`
      });
    } catch (error) {
      console.error('Error al eliminar todas las comisiones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar comisiones'
      });
    }
  }

  /**
   * Eliminar comisión individual
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const dataSource = new ComisionDataSource();
      const repository = new ComisionRepositoryImpl(dataSource);
      const useCase = new DeleteComisionUseCase(repository);
      const result = await useCase.execute(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Comisión no encontrada'
        });
      }

      return res.json({
        success: true,
        message: 'Comisión eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar comisión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar comisión'
      });
    }
  }
} 