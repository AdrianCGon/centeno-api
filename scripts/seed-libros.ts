import mongoose from 'mongoose';
import { MongoLibroDatasource } from '../src/infrastructure/datasources/libro.datasource';
import fs from 'fs';
import path from 'path';

const librosData = [
  { id: 1, categoria: 'CIVIL', titulo: 'Derecho Civil Parte General', autor: 'Rivera . Medina', edicion: '2da ed. actualizada 2019', precio: 13280 },
  { id: 2, categoria: 'CIVIL', titulo: 'Derecho Civil Manual Parte General', autor: 'Ghersi Carlos', edicion: '3ra ed. actualizada 2017', precio: 17680 },
  { id: 3, categoria: 'CIVIL', titulo: 'Derecho Civil Parte General', autor: 'Borda', edicion: '2da ed. 2019', precio: 4920 },
];

async function main() {
  const mongoUrl = process.env.MONGODB_URL || 'mongodb://mongo-user:123456@localhost:27017/centeno?authSource=admin';
  await mongoose.connect(mongoUrl);

  const ds = new MongoLibroDatasource();

  // limpiar colección
  await mongoose.connection.collection('libros').deleteMany({});

  const jsonPath = path.join(__dirname, 'libros.json');
  const file = fs.readFileSync(jsonPath, 'utf-8');
  const { libros } = JSON.parse(file) as { libros: any[] };
  for (const l of libros) {
    await ds.create({
      categoria: l.categoria,
      titulo: l.titulo,
      autor: l.autor,
      edicion: l.edicion,
      precio: l.precio ?? null,
    });
  }

  console.log(`Seed completado: ${libros.length} libros`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});

