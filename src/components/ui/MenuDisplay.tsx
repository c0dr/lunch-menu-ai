import { type FC } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  date: string;
}

interface MenuDisplayProps {
  items: MenuItem[];
  isLoading?: boolean;
  error?: string;
}

export const MenuDisplay: FC<MenuDisplayProps> = ({ items, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="p-4 text-center text-gray-600">
        No menu items available for this date.
      </div>
    );
  }

  const categories = [...new Set(items.map(item => item.category))];

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold capitalize border-b border-gray-200 pb-2">
            {category}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items
              .filter(item => item.category === category)
              .map(item => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="text-green-600 font-medium">
                      €{item.price.toFixed(2)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};