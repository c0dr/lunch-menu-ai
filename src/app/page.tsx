'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MenuDisplay, type Menu, type Meal } from '@/components/ui/MenuDisplay';

interface ApiMenu {
  date: string;
  meals: Meal[];
  metadata: {
    source: string;
    fetchedAt: string;
    validUntil: string;
  };
}

interface ApiResponse {
  menus: ApiMenu[];
}

export default function MenuPage() {
  const [weeklyMenus, setWeeklyMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function fetchWeekMenu() {
      try {
        setIsLoading(true);
        setError(undefined);
        
        const response = await fetch('/api/v1/menu');
        if (!response.ok) {
          throw new Error('Failed to fetch menus');
        }

        const data = await response.json() as ApiResponse;
        const menus = data.menus.map((menu) => ({
          ...menu,
          date: format(new Date(menu.date), 'yyyy-MM-dd'),
          metadata: {
            ...menu.metadata,
            fetchedAt: new Date(menu.metadata.fetchedAt).toISOString(),
            validUntil: new Date(menu.metadata.validUntil).toISOString()
          }
        }));

        setWeeklyMenus(menus);
      } catch (err) {
        console.error('Error fetching menus:', err);
        setError('Could not load the menus. Please try again later.');
        setWeeklyMenus([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeekMenu();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Weekly Menu</h1>
      
      <MenuDisplay
        menus={weeklyMenus}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
}
