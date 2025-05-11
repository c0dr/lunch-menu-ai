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
      <Card className="border-2 border-[rgba(186,12,47,0.3)] shadow-lg">
        <CardContent className="p-8">
          <p className="text-center text-[rgb(186,12,47)] font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!menus.length) {
    return (
      <Card className="border-0 shadow-lg bg-[rgba(186,12,47,0.05)]">
        <CardContent className="p-8">
          <p className="text-center text-[rgb(186,12,47)] font-medium">No menus available for this week.</p>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {sortedMenus.map((menu) => (
        <Card key={menu.date} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader className="pb-3 bg-[rgb(186,12,47)]">
            <CardTitle className="text-lg text-white">{formatDate(menu.date)}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
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
                <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-[rgba(186,12,47,0.2)] text-[rgb(186,12,47)]">
                  {category}
                </h3>
                <div className="space-y-2">
                  {meals.map((meal) => (
                    <div
                      key={meal.name}
                      className="p-3 rounded-lg bg-[rgba(186,12,47,0.05)] hover:bg-[rgba(186,12,47,0.1)]
                        transition-all duration-200 transform hover:-translate-y-0.5
                        cursor-pointer"
                    >
                      <p className="text-sm text-gray-700">{meal.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
      <div className="text-center">
        <p className="text-sm text-[rgba(186,12,47,0.8)] bg-[rgba(186,12,47,0.05)] py-3 px-4 rounded-lg inline-block">
          ⚠️ Hinweis: Diese Speisekarte wurde mit KI ausgelesen und könnte von der tatsächlichen Speisekarte abweichen.
        </p>
      </div>
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-[rgb(186,12,47)]">MCP Konfiguration</h3>
        <p className="text-sm text-gray-600 mb-4">Für Cursor, Windsurf und andere MCP-fähige Editoren:</p>
        <pre className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
{`{
  "mcpServers": {
    "breuni-lunch": {
      "command": "npx",
      "args": ["mcp-remote", "https://food.simoney.de/endpoint", "--transport sse-only"]
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
};