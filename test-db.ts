import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Successfully connected to DB. Users count:', users.length);
  } catch (error) {
    console.error('Failed to connect to DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
