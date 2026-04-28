import { BottomNav } from '../components/BottomNav';

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf6] text-gray-900 font-sans pb-24 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6 opacity-80"
        >
          {/* Book */}
          <rect x="28" y="30" width="52" height="66" rx="4" fill="#e8ddd0" stroke="#c4b09a" strokeWidth="2"/>
          <rect x="28" y="30" width="10" height="66" rx="2" fill="#c4b09a"/>
          <line x1="46" y1="50" x2="72" y2="50" stroke="#c4b09a" strokeWidth="2" strokeLinecap="round"/>
          <line x1="46" y1="60" x2="72" y2="60" stroke="#c4b09a" strokeWidth="2" strokeLinecap="round"/>
          <line x1="46" y1="70" x2="62" y2="70" stroke="#c4b09a" strokeWidth="2" strokeLinecap="round"/>
          {/* Heart */}
          <path
            d="M60 95 C60 95 44 84 44 74 C44 68.5 48.5 64 54 64 C57 64 60 66 60 66 C60 66 63 64 66 64 C71.5 64 76 68.5 76 74 C76 84 60 95 60 95Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          {/* Stars */}
          <path d="M18 28 L19.5 23 L21 28 L26 28 L22 31 L23.5 36 L19.5 33 L15.5 36 L17 31 L13 28 Z" fill="#fbbf24" opacity="0.9"/>
          <path d="M96 42 L97 39 L98 42 L101 42 L98.5 44 L99.5 47 L97 45 L94.5 47 L95.5 44 L93 42 Z" fill="#fbbf24" opacity="0.7"/>
          <path d="M88 18 L89 15.5 L90 18 L92.5 18 L90.5 19.5 L91.2 22 L89 20.5 L86.8 22 L87.5 19.5 L85.5 18 Z" fill="#fbbf24" opacity="0.6"/>
        </svg>

        <h2 className="text-xl font-semibold text-gray-700 mb-3 font-[Open_Sans]">
          Раздел в разработке
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
          Скоро здесь появится возможность сохранять любимые книги в избранное
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
