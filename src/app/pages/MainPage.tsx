import { Toaster } from 'sonner';
import { Shelf } from '../components/Shelf';
import { BookList } from '../components/BookList';
import { BottomNav } from '../components/BottomNav';

export default function MainPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf6] text-gray-900 font-sans pb-24">
      <Toaster position="top-center" />
      <section className="bg-[#fcfaf6]">
        {/* Title above shelf */}
        <div className="text-center pt-3 pb-4 bg-[#fff8ef]">
          <div className="inline-block">
            <h1 className="text-gray-800 font-[Open_Sans] text-[22px]">
              Прочитал в этом году
            </h1>
            <img
              src="/underline-stroke.svg"
              alt=""
              aria-hidden="true"
              className="block mx-auto -mt-1"
              style={{ width: '100%', maxWidth: '220px', height: 'auto', opacity: 0.75 }}
            />
          </div>
        </div>
        {/* Shelf Component */}
        <Shelf />
      </section>

      <main className="max-w-md mx-auto relative z-0">
        <BookList />
      </main>

      <BottomNav />
    </div>
  );
}
