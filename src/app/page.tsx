'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/DatePicker';
import { MenuDisplay, type MenuItem } from '@/components/ui/MenuDisplay';

function parseMenuText(menuText: string): MenuItem[] {
  const lines = menuText.split('\n').filter(line => line.trim());
  const items: MenuItem[] = [];
  let currentCategory = 'Main';
  
  lines.forEach((line, index) => {
    // Assume lines starting with # are categories
    if (line.startsWith('#')) {
      currentCategory = line.replace('#', '').trim();
      return;
    }
    
    // Assume other lines are items in format: Name - Description - Price
    const parts = line.split('-').map(part => part.trim());
    if (parts.length >= 2) {
      const price = parseFloat(parts[parts.length - 1].replace('€', '')) || 0;
      const name = parts[0];
      const description = parts.length > 2 ? parts.slice(1, -1).join(' - ') : '';
      
      items.push({
        id: `${index}`,
        name,
        description,
        price,
        category: currentCategory,
        date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  });
  
  return items;
}

export default function MenuPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function fetchMenu() {
      try {
        setIsLoading(true);
        setError(undefined);
        
        const response = await fetch(`/api/v1/menu?date=${selectedDate}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch menu');
        }

        const data = await response.json();
        const menuItems = parseMenuText(data.menuText);
        setItems(menuItems);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Could not load the menu. Please try again later.');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, [selectedDate]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Daily Menu</h1>
      
      <div className="mb-8">
        <DatePicker
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          isDisabled={isLoading}
        />
      </div>

      <MenuDisplay
        items={items}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
}
