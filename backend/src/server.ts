import { app } from './app';
import { env } from './config/env';
import { disconnectPrisma } from './lib/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`Encerrando servidor apos sinal ${signal}...`);

  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    void shutdown(signal);
  });
});
