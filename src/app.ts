import { envs } from './config/envs';
import { AppRoutes } from './presentation/routes';
import { Server } from './presentation/server';
import { Database } from './config/database';


(async()=> {
  main();
})();


async function main() {
  // Conectar a la base de datos
  await Database.connect();

  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });

  server.start();
}