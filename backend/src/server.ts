import { env } from './config/env';
import { app } from './app';
import { prisma } from './lib/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`SUPCONTENT API listening on http://localhost:${env.PORT}`);
});

async function shutdown() {
  console.log('Arrêt du serveur...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
