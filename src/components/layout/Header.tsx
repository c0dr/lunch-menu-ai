import { type FC } from 'react';
export const Header: FC = () => {
  return (
    <header className="bg-[rgb(186,12,47)] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded">
            </div>
            <h1 className="text-xl font-semibold text-white">
              🍽️ Casino Speisekarte
            </h1>
          </div>
          <nav className="flex space-x-2">
            <a
              href="#menu"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors
                text-white hover:bg-[rgba(255,255,255,0.1)]
                border border-transparent hover:border-white/30"
            >
              Aktuelle Speisekarte
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};