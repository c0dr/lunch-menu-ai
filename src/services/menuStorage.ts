import { prisma } from '@/lib/prisma';

export interface MenuStorage {
  saveWeeklyMenu(menus: { date: Date; menuText: string }[]): Promise<void>;
  getMenuForDate(date: Date): Promise<string | null>;
}

export class PrismaMenuStorage implements MenuStorage {
  async saveWeeklyMenu(menus: { date: Date; menuText: string }[]): Promise<void> {
    await prisma.$transaction(
      menus.map(({ date, menuText }) =>
        prisma.dailyMenu.upsert({
          where: { date },
          update: {
            menuText,
            lastUpdated: new Date()
          },
          create: {
            date,
            menuText
          }
        })
      )
    );
  }

  async getMenuForDate(date: Date): Promise<string | null> {
    const menu = await prisma.dailyMenu.findUnique({
      where: { date }
    });
    return menu?.menuText ?? null;
  }
}