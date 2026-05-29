import { prisma } from "@traderiq/db";
import type { Role } from "@traderiq/api";

/**
 * kpi-Modul · Layout-REPOSITORY — der EINZIGE Ort mit Prisma-Zugriff fuer das
 * KPI-Dashboard-Layout. Damit ruft keine Route mehr direkt `prisma.*` auf.
 *
 * Fehler werden bewusst GEWORFEN — der Aufrufer (Route) faengt sie und
 * antwortet mit 503, damit der Client auf localStorage zurueckfallen kann.
 */

export async function getKpiLayout(userId: string): Promise<unknown | null> {
  const layout = await prisma.kpiLayout.findFirst({
    where: { userId, name: "Standard" },
  });
  return layout?.widgets ?? null;
}

export interface SaveKpiLayoutInput {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  widgets: object;
}

export async function saveKpiLayout(input: SaveKpiLayoutInput): Promise<void> {
  // User-Row lazy anlegen (wir migrieren Users erst spaeter komplett).
  await prisma.user.upsert({
    where: { id: input.userId },
    create: {
      id: input.userId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
    },
    update: {},
  });

  await prisma.kpiLayout.upsert({
    where: { userId_name: { userId: input.userId, name: "Standard" } },
    create: {
      userId: input.userId,
      name: "Standard",
      widgets: input.widgets,
      isDefault: true,
    },
    update: {
      widgets: input.widgets,
    },
  });
}
