import { prisma } from '@/lib/prisma';

export interface MenuStorage {
  saveMenu(date: Date, menuText: string): Promise<void>;
  getMenuForDate(date: Date): Promise<string | null>;
}

export class PrismaMenuStorage implements MenuStorage {
  async saveMenu(date: Date, menuText: string): Promise<void> {
    await prisma.dailyMenu.upsert({
      where: { date },
      update: { 
        menuText,
        lastUpdated: new Date()
      },
      create: {
        date,
        menuText
      }
    });
  }

  async getMenuForDate(date: Date): Promise<string | null> {
    const menu = await prisma.dailyMenu.findUnique({
      where: { date }
    });
    return menu?.menuText ?? null;
  }
}