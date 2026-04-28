/**
 * Prisma-Client-Singleton.
 *
 * Wichtig: in serverless Environments (Vercel) wuerde sonst pro Request eine
 * neue Connection-Pool-Instance angelegt — fuehrt zu „too many connections"
 * Errors. Die globale Variable verhindert das in dev (HMR) und ist in production
 * eh nur einmal initialisiert pro Lambda.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
