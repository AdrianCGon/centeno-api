import mongoose from 'mongoose';
import { envs } from './envs';

export class Database {
  static async connect() {
    try {
      await mongoose.connect(envs.MONGODB_URL);
      console.log('✅ Base de datos conectada');
    } catch (error) {
      console.error('❌ Error al conectar la base de datos:', error);
      process.exit(1);
    }
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ Base de datos desconectada');
    } catch (error) {
      console.error('❌ Error al desconectar la base de datos:', error);
    }
  }
} 