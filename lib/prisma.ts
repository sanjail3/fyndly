import { PrismaClient } from '../lib/generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

// Use direct URL to bypass RLS restrictions for server-side operations
const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
};

export const prisma = global.prisma || new PrismaClient(prismaConfig);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}