import { type FC } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface Meal {
  name: string;
  category: string;
}

export interface Menu {
  date: string;
  meals: Meal[];
  metadata: {
    source: string;
    fetchedAt: string;
    validUntil: string;
  };
}

interface MenuDisplayProps {
  menus: Menu[];
  isLoading?: boolean;
  error?: string;
}

export const MenuDisplay: FC<MenuDisplayProps> = ({ menus, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[400px]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <p className="text-center text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!menus.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No menus available for this week.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE, MMM d');
  };

  // Sort menus by date
  const sortedMenus = [...menus].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {sortedMenus.map((menu) => (
        <Card key={menu.date} className="overflow-hidden">
          <CardHeader className="pb-3 bg-muted">
            <CardTitle className="text-lg">{formatDate(menu.date)}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {Object.entries(
              menu.meals.reduce((acc, meal) => {
                if (!acc[meal.category]) {
                  acc[meal.category] = [];
                }
                acc[meal.category].push(meal);
                return acc;
              }, {} as Record<string, Meal[]>)
            ).map(([category, meals]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm mb-2 pb-1 border-b">
                  {category}
                </h3>
                <div className="space-y-2">
                  {meals.map((meal) => (
                    <div
                      key={meal.name}
                      className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm">{meal.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};