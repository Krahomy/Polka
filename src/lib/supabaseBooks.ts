import { supabase } from './supabase';
import type { Book } from '../app/components/bookData';

type DbBook = {
  id: number;
  user_id: string;
  title: string;
  author: string | null;
  height: string;
  width: string;
  spine_color: string;
  spine_image: string | null;
  cover_image: string | null;
  tilt: number | null;
  status: string | null;
  finished_at: number | null;
};

function dbToBook(db: DbBook): Book {
  return {
    id: db.id,
    title: db.title,
    author: db.author ?? undefined,
    height: db.height,
    width: db.width,
    spineColor: db.spine_color,
    spineImage: db.spine_image ?? undefined,
    coverImage: db.cover_image ?? undefined,
    tilt: db.tilt ?? 0,
    status: db.status as Book['status'],
    finishedAt: db.finished_at ?? undefined,
  };
}

export async function fetchUserBooks(userId: string): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('id');
  if (error) throw error;
  return (data as DbBook[]).map(dbToBook);
}

export async function insertBook(userId: string, book: Omit<Book, 'id'>): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: userId,
      title: book.title,
      author: book.author ?? null,
      height: book.height,
      width: book.width,
      spine_color: book.spineColor,
      spine_image: book.spineImage ?? null,
      cover_image: book.coverImage ?? null,
      tilt: book.tilt ?? 0,
      status: book.status ?? 'To Read',
      finished_at: book.finishedAt ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToBook(data as DbBook);
}

export async function updateBook(id: number, updates: Partial<Book>): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if ('title' in updates) dbUpdates.title = updates.title;
  if ('author' in updates) dbUpdates.author = updates.author ?? null;
  if ('height' in updates) dbUpdates.height = updates.height;
  if ('width' in updates) dbUpdates.width = updates.width;
  if ('spineColor' in updates) dbUpdates.spine_color = updates.spineColor;
  if ('spineImage' in updates) dbUpdates.spine_image = updates.spineImage ?? null;
  if ('coverImage' in updates) dbUpdates.cover_image = updates.coverImage ?? null;
  if ('tilt' in updates) dbUpdates.tilt = updates.tilt ?? null;
  if ('status' in updates) dbUpdates.status = updates.status ?? null;
  if ('finishedAt' in updates) dbUpdates.finished_at = updates.finishedAt ?? null;

  const { error } = await supabase.from('books').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

export async function deleteBook(id: number): Promise<void> {
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw error;
}
