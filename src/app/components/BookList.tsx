import { useState, useRef } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Book } from './bookData';
import { useBooksContext } from '../context/BooksContext';

const getStatusStyles = (status?: string) => {
  switch (status) {
    case 'Reading':
      return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
    case 'Finished':
      return 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]';
    case 'To Read':
    default:
      return 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]';
  }
};

export function BookList() {
  const { books, updateBook, deleteBook } = useBooksContext();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateBookStatus = (book: Book, newStatus: 'To Read' | 'Reading' | 'Finished') => {
    const updates: Partial<Book> = { status: newStatus };
    if (newStatus === 'Finished') {
      updates.finishedAt = book.status === 'Finished' && book.finishedAt
        ? book.finishedAt
        : Date.now();
    } else {
      updates.finishedAt = undefined;
    }
    updateBook(book.id, updates).catch(console.error);
    setOpenDropdownId(null);
  };

  const handleDelete = (bookId: number) => {
    deleteBook(bookId).catch(console.error);
  };

  const booksWithInfo = books.filter(book => book.title || book.author);
  const statusOptions: Array<'To Read' | 'Reading' | 'Finished'> = ['To Read', 'Reading', 'Finished'];

  return (
    <div className="px-4 pb-24 bg-[#fff8ef]">
      <h2 className="text-center py-6 text-gray-900 border-b border-gray-200/60 font-[Open_Sans] text-[24px]">Прочитал в этом году</h2>
      <ul className="divide-y divide-gray-200/60">
        {booksWithInfo.map((book) => (
          <li
            key={book.id}
            className="group flex items-center gap-3 py-3 hover:bg-gray-50 transition-colors px-2 rounded-lg"
          >
            {/* Book Cover Image */}
            <div className="w-28 h-40 flex-shrink-0 bg-gray-200 relative">
              {book.coverImage && (
                <div className="absolute inset-0 pointer-events-none rounded-br-[12px] rounded-tr-[12px]">
                  <ImageWithFallback
                    src={book.coverImage}
                    alt={book.title || 'Book cover'}
                    className="absolute inset-0 max-w-none object-cover rounded-br-[12px] rounded-tr-[1px] size-full"
                  />
                  <div aria-hidden="true" className="absolute border-[#e2e3e3] border-b-4 border-l-4 border-solid inset-0 rounded-br-[12px] rounded-tr-[12px]" />
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0 -mt-[75px]">
              <h3 className="text-base font-medium text-gray-900 truncate">
                {book.title || 'Untitled'}
              </h3>
              {book.author && (
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {book.author}
                </p>
              )}
              {book.status && (
                <div className="mt-1.5 inline-block relative" ref={openDropdownId === book.id ? dropdownRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === book.id ? null : book.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyles(book.status)} hover:opacity-80 transition-opacity cursor-pointer`}
                  >
                    {book.status}
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {openDropdownId === book.id && (
                    <div className="absolute left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBookStatus(book, status);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                            book.status === status ? 'bg-gray-100' : ''
                          }`}
                        >
                          <span className={`inline-block px-2 py-0.5 rounded-full border ${getStatusStyles(status)}`}>
                            {status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(book.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Delete book"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </li>
        ))}
        {booksWithInfo.length === 0 && (
          <li className="py-8 text-center text-gray-400 text-sm">
            No books with titles yet. Add titles to books using the config menu!
          </li>
        )}
      </ul>
    </div>
  );
}
