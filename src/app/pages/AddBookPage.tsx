import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useBooksContext } from '../context/BooksContext';

export default function AddBookPage() {
  const navigate = useNavigate();
  const { addBook } = useBooksContext();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addBook(title.trim(), author.trim());
      toast.success('Книга добавлена!');
      navigate('/search');
    } catch (e) {
      console.error(e);
      toast.error('Не удалось добавить книгу');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/search')}
            aria-label="Назад к поиску"
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-gray-900 font-[Open_Sans] text-[20px]">
            Новая книга
          </h1>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 px-4 pt-8 pb-24">
        <div className="flex flex-col gap-6 max-w-md mx-auto">
          {/* Title field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="book-title"
              className="text-xs text-gray-500 font-medium tracking-wide uppercase"
            >
              Название
            </label>
            <input
              id="book-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название книги"
              autoFocus
              className="px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Author field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="book-author"
              className="text-xs text-gray-500 font-medium tracking-wide uppercase"
            >
              Автор
            </label>
            <input
              id="book-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Введите имя автора"
              className="px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
              canSave
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
