import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, BookPlus, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useBooksContext } from '../context/BooksContext';

interface SearchResult {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { addBook, books } = useBooksContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const addedTitles = new Set(books.filter((b) => b.title).map((b) => b.title.toLowerCase()));

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-books', {
        body: { q: query.trim() },
      });
      if (error) throw error;
      setResults(data ?? []);
    } catch {
      toast.error('Не удалось выполнить поиск');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (book: SearchResult) => {
    try {
      await addBook(book.title, book.author, book.coverUrl);
      setAddedIds((prev) => new Set(prev).add(book.id));
      toast.success('Книга добавлена');
    } catch {
      toast.error('Не удалось добавить книгу');
    }
  };

  const isAdded = (book: SearchResult) =>
    addedIds.has(book.id) || addedTitles.has(book.title.toLowerCase());

  return (
    <div className="min-h-screen bg-[#fcfaf6] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <h1 className="text-center text-gray-900 font-[Open_Sans] text-[20px]">
          Поиск книги
        </h1>
      </header>

      {/* Search input */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Название или автор"
            aria-label="Поиск по названию или автору"
            className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            aria-label="Искать"
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-48">
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center h-48">
            <Search className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm text-center max-w-[260px]">
              Введите название или автора, чтобы найти книгу
            </p>
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-gray-400 text-sm text-center">
              Ничего не найдено. Попробуйте другой запрос.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <ul className="flex flex-col gap-3 py-2">
            {results.map((book) => (
              <li
                key={book.id}
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm"
              >
                {/* Cover */}
                <div className="w-12 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                    {book.title}
                  </p>
                  {book.author && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
                  )}
                </div>

                {/* Add button */}
                <button
                  onClick={() => !isAdded(book) && handleAdd(book)}
                  aria-label={isAdded(book) ? 'Уже добавлена' : 'Добавить книгу'}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isAdded(book)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isAdded(book) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
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
            <span className="text-sm font-medium">Назад</span>
          </button>
        </div>
      </div>
    </div>
  );
}
