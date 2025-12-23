import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

export default prisma;