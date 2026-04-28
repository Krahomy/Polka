import { Toaster } from 'sonner';
import { BookList } from '../components/BookList';
import { BottomNav } from '../components/BottomNav';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf6] text-gray-900 font-sans pb-24">
      <Toaster position="top-center" />
      <main className="max-w-md mx-auto relative z-0">
        <BookList title="Прочитано" filter="finished" />
      </main>
      <BottomNav />
    </div>
  );
}
