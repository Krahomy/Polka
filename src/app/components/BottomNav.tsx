import { Home, Library, Plus, Heart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isLibrary = location.pathname === '/library';
  const isFavorites = location.pathname === '/favorites';
  const isProfile = location.pathname === '/profile';

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 py-2 px-6 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 bg-[#2b2b2b]">
      <ul className="flex justify-between items-center max-w-md mx-auto">
        <li
          className={`flex flex-col items-center gap-1 cursor-pointer group ${isHome ? 'text-blue-500' : ''}`}
          onClick={() => navigate('/')}
        >
          <Home className={`w-6 h-6 transition-colors ${isHome ? 'text-blue-500 fill-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
          <span className={`text-[10px] font-medium transition-colors ${isHome ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'}`}>Home</span>
        </li>
        <li
          className={`flex flex-col items-center gap-1 cursor-pointer group ${isLibrary ? 'text-blue-500' : ''}`}
          onClick={() => navigate('/library')}
        >
          <Library className={`w-6 h-6 transition-colors ${isLibrary ? 'fill-blue-500 text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
          <span className={`text-[10px] font-medium transition-colors ${isLibrary ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'}`}>Library</span>
        </li>
        <li className="flex flex-col items-center -mt-4">
           <button
             onClick={() => navigate('/search')}
             aria-label="Добавить книгу"
             className="hover:bg-blue-500 transition-colors rounded-full p-3 shadow-lg ring-4 ring-white cursor-pointer bg-[#01934f]"
           >
             <Plus className="w-7 h-7 text-white" />
           </button>
        </li>
        <li
          className="flex flex-col items-center gap-1 cursor-pointer group"
          onClick={() => navigate('/favorites')}
        >
          <Heart className={`w-6 h-6 transition-colors ${isFavorites ? 'text-blue-500 fill-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
          <span className={`text-[10px] font-medium transition-colors ${isFavorites ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'}`}>Favorites</span>
        </li>
        <li
          className="flex flex-col items-center gap-1 cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          <User className={`w-6 h-6 transition-colors ${isProfile ? 'text-blue-500 fill-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
          <span className={`text-[10px] font-medium transition-colors ${isProfile ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'}`}>Profile</span>
        </li>
      </ul>
    </div>
  );
}
