import React from 'react';
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
          <h1 className="text-gray-800 font-[Open_Sans] text-[22px] inline-block">
            <span className="bg-[linear-gradient(transparent_75%,#feaea2_75%,#feaea2_90%,transparent_90%)] px-1">
              Прочитал в этом году
            </span>
          </h1>
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
