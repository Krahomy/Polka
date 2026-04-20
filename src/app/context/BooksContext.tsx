import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import type { Book } from '../components/bookData';
import { defaultBooks } from '../components/bookData';
import {
  fetchUserBooks,
  insertBook,
  updateBook as dbUpdateBook,
  deleteBook as dbDeleteBook,
} from '../../lib/supabaseBooks';

const SPINE_COLORS = [
  'bg-[#3b3b3b]', 'bg-[#1e293b]', 'bg-[#92400e]', 'bg-[#4b5563]',
  'bg-[#d97706]', 'bg-[#57534e]', 'bg-[#1f2937]', 'bg-[#a16207]',
  'bg-[#14532d]', 'bg-[#ef4444]', 'bg-[#9ca3af]', 'bg-[#e5e1db]',
];
const HEIGHT_OPTIONS = ['h-48', 'h-50', 'h-52', 'h-54', 'h-56'];
const WIDTH_OPTIONS = ['w-8', 'w-9', 'w-10'];

interface BooksContextValue {
  books: Book[];
  loading: boolean;
  addBook: (title: string, author: string, coverImage?: string, pages?: number) => Promise<Book>;
  updateBook: (id: number, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
}

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setLoading(true);
    fetchUserBooks(user.id)
      .then(async (fetched) => {
        if (cancelled) return;
        if (fetched.length === 0) {
          // Seed default books for new users
          const seeded: Book[] = [];
          for (const book of defaultBooks) {
            if (cancelled) return;
            const { id: _id, ...rest } = book;
            const inserted = await insertBook(user.id, rest);
            seeded.push(inserted);
          }
          if (!cancelled) setBooks(seeded);
        } else {
          setBooks(fetched);
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user?.id]);

  async function addBook(title: string, author: string, coverImage?: string, pages?: number): Promise<Book> {
    if (!user) throw new Error('Not authenticated');
    const newBook = await insertBook(user.id, {
      title,
      author,
      coverImage,
      pages: pages ?? 300,
      height: HEIGHT_OPTIONS[Math.floor(Math.random() * HEIGHT_OPTIONS.length)],
      width: WIDTH_OPTIONS[Math.floor(Math.random() * WIDTH_OPTIONS.length)],
      spineColor: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)],
      tilt: 0,
      status: 'To Read',
    });
    setBooks(prev => [...prev, newBook]);
    return newBook;
  }

  async function updateBook(id: number, updates: Partial<Book>): Promise<void> {
    await dbUpdateBook(id, updates);
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }

  async function deleteBook(id: number): Promise<void> {
    await dbDeleteBook(id);
    setBooks(prev => prev.filter(b => b.id !== id));
  }

  return (
    <BooksContext.Provider value={{ books, loading, addBook, updateBook, deleteBook }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooksContext() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooksContext must be used within BooksProvider');
  return ctx;
}
