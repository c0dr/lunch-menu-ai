import { type FC } from 'react';
import Image from 'next/image';

export const Header: FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/window.svg"
              alt="Canteen Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h1 className="text-xl font-semibold text-gray-900">
              Campus Canteen
            </h1>
          </div>
          <nav className="flex space-x-4">
            <a
              href="#menu"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Today&apos;s Menu
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};