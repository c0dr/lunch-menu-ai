import { NextResponse } from 'next/server';
import { ConfluenceMenuFetcher } from '../../../../../services/confluence-menu-fetcher';
import { PrismaMenuStorage } from '../../../../../services/menuStorage';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('x-menu-fetch-password');
    
    if (!authHeader || authHeader !== process.env.MENU_FETCH_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    const menuStorage = new PrismaMenuStorage();
    const menuFetcher = new ConfluenceMenuFetcher();

    // Fetch the weekly menu
    const menus = await menuFetcher.fetchWeeklyMenu();
    
    // Save all menus
    const menuData = menus.map(menu => ({
      date: menu.date,
      menuText: JSON.stringify(menu)
    }));
    
    await menuStorage.saveWeeklyMenu(menuData);

    return NextResponse.json({
      success: true,
      message: 'Weekly menus fetched and stored successfully',
      dates: menus.map(menu => menu.date)
    });
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}