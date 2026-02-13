'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      router.push(`/results?title=${encodeURIComponent(searchQuery)}&type=movie`);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 sm:py-0 sm:h-16">
          {/* Logo/Nom */}
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-800">
            Broadcaster
          </Link>

          {/* Recherche rapide */}
          <form onSubmit={handleQuickSearch} className="flex-1 w-full sm:w-auto max-w-md sm:mx-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherche rapide..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minLength={2}
            />
          </form>

          {/* Lien À propos */}
          <Link
            href="/about"
            className="text-gray-700 hover:text-blue-600 font-medium text-sm sm:text-base"
          >
            À propos
          </Link>
        </div>
      </div>
    </nav>
  );
}
