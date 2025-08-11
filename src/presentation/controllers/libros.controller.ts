import { Request, Response } from 'express';
import { CreateLibroUseCase } from '../../application/use-cases/libros/create-libro.use-case';
import { GetAllLibrosUseCase } from '../../application/use-cases/libros/get-all-libros.use-case';
import { GetLibroByIdUseCase } from '../../application/use-cases/libros/get-libro-by-id.use-case';
import { UpdateLibroUseCase } from '../../application/use-cases/libros/update-libro.use-case';
import { DeleteLibroUseCase } from '../../application/use-cases/libros/delete-libro.use-case';

export class LibrosController {
  constructor(
    private readonly createLibro: CreateLibroUseCase,
    private readonly getAllLibros: GetAllLibrosUseCase,
    private readonly getLibroById: GetLibroByIdUseCase,
    private readonly updateLibro: UpdateLibroUseCase,
    private readonly deleteLibro: DeleteLibroUseCase,
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const libro = await this.createLibro.execute(req.body);
      res.status(201).json({ ok: true, data: libro });
    } catch (error: any) {
      res.status(400).json({ ok: false, message: error.message || 'Error al crear libro' });
    }
  };

  getAll = async (_req: Request, res: Response) => {
    const libros = await this.getAllLibros.execute();
    res.json({ ok: true, data: libros });
  };

  getById = async (req: Request, res: Response) => {
    const libro = await this.getLibroById.execute(req.params.id);
    if (!libro) return res.status(404).json({ ok: false, message: 'Libro no encontrado' });
    res.json({ ok: true, data: libro });
  };

  update = async (req: Request, res: Response) => {
    const libro = await this.updateLibro.execute(req.params.id, req.body);
    if (!libro) return res.status(404).json({ ok: false, message: 'Libro no encontrado' });
    res.json({ ok: true, data: libro });
  };

  delete = async (req: Request, res: Response) => {
    const ok = await this.deleteLibro.execute(req.params.id);
    if (!ok) return res.status(404).json({ ok: false, message: 'Libro no encontrado' });
    res.json({ ok: true });
  };

  seedDemo = async (_req: Request, res: Response) => {
    // Eliminar todos
    const existentes = await this.getAllLibros.execute();
    for (const l of existentes) {
      if (l.id) await this.deleteLibro.execute(l.id);
    }
    // Insertar demo
    const demo = [
      { categoria: 'CIVIL', titulo: 'Derecho Civil Parte General', autor: 'Rivera . Medina', edicion: '2da ed. 2019', precio: 13280 },
      { categoria: 'CONTRATOS', titulo: 'Manual de Contratos', autor: 'Ghersi Carlos', edicion: '4ta ed.', precio: 14400 },
      { categoria: 'CONSTITUCIONAL', titulo: 'Constitución de la Nación Argentina', autor: 'Cayuso Susana', edicion: '1ra ed.', precio: 15760 },
    ];
    for (const d of demo) {
      await this.createLibro.execute(d);
    }
    const final = await this.getAllLibros.execute();
    res.json({ ok: true, data: final, message: `Seed ok: ${final.length} libros` });
  };
}

