import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    let menus;

    if (dateParam) {
      // If date is provided, return menu for that specific date
      const targetDate = startOfDay(new Date(dateParam));
      const menu = await prisma.dailyMenu.findUnique({
        where: { date: targetDate }
      });

      if (!menu) {
        return NextResponse.json(
          { error: 'No menu found for the specified date' },
          { status: 404 }
        );
      }

      menus = [menu];
    } else {
      // If no date provided, return menus for the current week
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Start from Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // End on Sunday

      menus = await prisma.dailyMenu.findMany({
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      if (!menus.length) {
        return NextResponse.json(
          { error: 'No menus found for this week' },
          { status: 404 }
        );
      }
    }

    // Parse stored menu text into structured format
    const parsedMenus = menus.map(menu => {
      const menuData = JSON.parse(menu.menuText);
      return {
        date: menu.date.toISOString(),
        meals: menuData.meals,
        metadata: {
          source: menuData.metadata.source,
          fetchedAt: menuData.metadata.fetchedAt,
          validUntil: menuData.metadata.validUntil
        }
      };
    });

    return NextResponse.json({ menus: parsedMenus });
  } catch (error) {
    console.error('Error fetching menu:', error);
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}