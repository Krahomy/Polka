import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, BookPlus } from 'lucide-react';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // Placeholder — no external API connected yet
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <h1 className="text-center text-gray-900 font-[Open_Sans] text-[20px]">
          Поиск книги
        </h1>
      </header>

      {/* Search input area */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Название / автор / ISBN"
            aria-label="Поиск по названию, автору или ISBN"
            className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            aria-label="Искать"
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shrink-0"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results placeholder / empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-gray-300 mb-4">
          <Search className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-400 text-sm text-center max-w-[260px]">
          Введите название, автора или ISBN, чтобы найти книгу
        </p>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3 pb-8">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <button
            onClick={() => navigate('/add-book')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#4eaf59] hover:bg-[#43a04e] text-white rounded-xl transition-colors"
          >
            <BookPlus className="w-5 h-5" />
            <span className="text-sm font-medium">Добавить свою книгу</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Назад</span>
          </button>
        </div>
      </div>
    </div>
  );
}
