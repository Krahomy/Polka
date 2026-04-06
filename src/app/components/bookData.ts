/**
 * Shared book data module.
 * Single source of truth for the Book type, default data, and localStorage persistence.
 * User customizations (spine images, cover images, sizes, tilts, statuses, titles, authors)
 * are always preserved across code updates — saved data is never overridden by defaults.
 */

export interface Book {
  id: number;
  height: string;
  width: string;
  title: string;
  author?: string;
  spineColor: string;
  spineImage?: string;
  coverImage?: string;
  tilt?: number;
  status?: 'To Read' | 'Reading' | 'Finished';
  finishedAt?: number;
}

export const STORAGE_KEY_BOOKS = 'shelf-books';
export const STORAGE_KEY_SETTINGS = 'shelf-settings';

export const defaultBooks: Book[] = [
  { id: 1, height: 'h-48', width: 'w-8', title: '', author: '', spineColor: 'bg-[#e5e1db]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1744693660970-3517f524fb28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGJvb2slMjBjb3ZlcnxlbnwxfHx8fDE3NzIzNTcxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 2, height: 'h-52', width: 'w-10', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', spineColor: 'bg-[#3b3b3b]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1551300329-dc0a750a7483?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc3MjM1NzE1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'Reading' },
  { id: 3, height: 'h-48', width: 'w-7', title: '', author: '', spineColor: 'bg-[#9ca3af]', tilt: 3, coverImage: 'https://images.unsplash.com/photo-1758803184789-a5dd872fe82e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib29rJTIwY292ZXIlMjBkZXNpZ258ZW58MXx8fHwxNzcyMjk2NzU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 4, height: 'h-56', width: 'w-9', title: '1984', author: 'George Orwell', spineColor: 'bg-[#1e293b]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1769413254106-2ca07db09078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbm92ZWwlMjBjb3ZlcnxlbnwxfHx8fDE3NzIzMjg1NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'Finished', finishedAt: 1700000000000 },
  { id: 5, height: 'h-50', width: 'w-11', title: '', author: '', spineColor: 'bg-[#92400e]', tilt: 1, coverImage: 'https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc3MjMyNzk5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 6, height: 'h-46', width: 'w-6', title: '', author: '', spineColor: 'bg-[#f3f4f6]', tilt: -4, coverImage: 'https://images.unsplash.com/photo-1730372798571-0f8e9c7d84aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXJkY292ZXIlMjBib29rfGVufDF8fHx8MTc3MjI2MjU2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 7, height: 'h-54', width: 'w-8', title: '', author: '', spineColor: 'bg-[#4b5563]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1763768861268-cb6b54173dbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXRlcmFyeSUyMGJvb2slMjBjb3ZlcnxlbnwxfHx8fDE3NzIzNTcxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 8, height: 'h-52', width: 'w-10', title: 'Hobbit', author: 'J.R.R. Tolkien', spineColor: 'bg-[#d97706]', tilt: 2, coverImage: 'https://images.unsplash.com/photo-1698319130001-af054861ff28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXBlcmJhY2slMjBib29rJTIwY292ZXJ8ZW58MXx8fHwxNzcyMzU3MTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'Reading' },
  { id: 9, height: 'h-56', width: 'w-9', title: '', author: '', spineColor: 'bg-[#57534e]', tilt: -1, coverImage: 'https://images.unsplash.com/photo-1744693660970-3517f524fb28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGJvb2slMjBjb3ZlcnxlbnwxfHx8fDE3NzIzNTcxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 10, height: 'h-48', width: 'w-7', title: '', author: '', spineColor: 'bg-[#fef3c7]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1551300329-dc0a750a7483?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc3MjM1NzE1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 11, height: 'h-50', width: 'w-8', title: 'Moby Dick', author: 'Herman Melville', spineColor: 'bg-[#1f2937]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1758803184789-a5dd872fe82e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib29rJTIwY292ZXIlMjBkZXNpZ258ZW58MXx8fHwxNzcyMjk2NzU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'Finished', finishedAt: 1700100000000 },
  { id: 12, height: 'h-54', width: 'w-9', title: '', author: '', spineColor: 'bg-[#a16207]', tilt: -3, coverImage: 'https://images.unsplash.com/photo-1769413254106-2ca07db09078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbm92ZWwlMjBjb3ZlcnxlbnwxfHx8fDE3NzIzMjg1NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 13, height: 'h-46', width: 'w-6', title: '', author: '', spineColor: 'bg-[#ef4444]', tilt: 4, coverImage: 'https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc3MjMyNzk5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 14, height: 'h-52', width: 'w-8', title: '', author: '', spineColor: 'bg-[#14532d]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1730372798571-0f8e9c7d84aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXJkY292ZXIlMjBib29rfGVufDF8fHx8MTc3MjI2MjU2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 15, height: 'h-48', width: 'w-7', title: '', author: '', spineColor: 'bg-[#d1d5db]', tilt: -2, coverImage: 'https://images.unsplash.com/photo-1763768861268-cb6b54173dbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXRlcmFyeSUyMGJvb2slMjBjb3ZlcnxlbnwxfHx8fDE3NzIzNTcxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
  { id: 16, height: 'h-56', width: 'w-10', title: '', author: '', spineColor: 'bg-[#000000]', tilt: 0, coverImage: 'https://images.unsplash.com/photo-1698319130001-af054861ff28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXBlcmJhY2slMjBib29rJTIwY292ZXJ8ZW58MXx8fHwxNzcyMzU3MTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', status: 'To Read' },
];

/**
 * Load books from localStorage.
 * On first load (nothing saved), uses defaults.
 * Once saved, uses ONLY saved data (no merge) so deletions persist.
 */
export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (raw) {
      const saved = JSON.parse(raw) as Book[];
      return saved;
    }
  } catch (e) {
    console.error('Failed to load books from localStorage', e);
  }

  persistBooksQuietly(defaultBooks);
  return [...defaultBooks];
}

function persistBooksQuietly(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to persist books to localStorage', e);
  }
}

export function saveBooks(books: Book[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    window.dispatchEvent(new Event('books-updated'));
    return true;
  } catch (e) {
    console.error('Failed to save books to localStorage', e);
    return false;
  }
}

export function loadShadowOpacity(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.shadowOpacity !== undefined) {
        return settings.shadowOpacity;
      }
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
  }
  return 0.7;
}

export function saveShadowOpacity(opacity: number): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const settings = raw ? JSON.parse(raw) : {};
    settings.shadowOpacity = opacity;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadShelfImage(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.customShelfImage) {
        return settings.customShelfImage;
      }
    }
  } catch (e) {
    console.error('Failed to load custom shelf image from localStorage', e);
  }
  return null;
}

export function saveShelfImage(imageBase64: string | null): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const settings = raw ? JSON.parse(raw) : {};
    settings.customShelfImage = imageBase64;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('books-updated'));
  } catch (e) {
    console.error('Failed to save custom shelf image to localStorage', e);
  }
}

export function loadDefaultShelfImage(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.defaultShelfImage) {
        return settings.defaultShelfImage;
      }
    }
  } catch (e) {
    console.error('Failed to load default shelf image from localStorage', e);
  }
  return null;
}

export function saveDefaultShelfImage(imageBase64: string | null): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const settings = raw ? JSON.parse(raw) : {};
    settings.defaultShelfImage = imageBase64;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('books-updated'));
  } catch (e) {
    console.error('Failed to save default shelf image to localStorage', e);
  }
}

const SPINE_COLORS = [
  'bg-[#3b3b3b]', 'bg-[#1e293b]', 'bg-[#92400e]', 'bg-[#4b5563]',
  'bg-[#d97706]', 'bg-[#57534e]', 'bg-[#1f2937]', 'bg-[#a16207]',
  'bg-[#14532d]', 'bg-[#ef4444]', 'bg-[#9ca3af]', 'bg-[#e5e1db]',
];

const HEIGHT_OPTIONS = ['h-48', 'h-50', 'h-52', 'h-54', 'h-56'];
const WIDTH_OPTIONS = ['w-8', 'w-9', 'w-10'];

export function addNewBook(title: string, author: string): Book {
  const books = loadBooks();
  const maxId = books.reduce((max, b) => Math.max(max, b.id), 0);
  const newBook: Book = {
    id: maxId + 1,
    title,
    author,
    height: HEIGHT_OPTIONS[Math.floor(Math.random() * HEIGHT_OPTIONS.length)],
    width: WIDTH_OPTIONS[Math.floor(Math.random() * WIDTH_OPTIONS.length)],
    spineColor: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)],
    tilt: 0,
    status: 'To Read',
  };
  const updated = [...books, newBook];
  saveBooks(updated);
  return newBook;
}
