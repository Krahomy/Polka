import { Home, Library, Plus, Heart, User } from 'lucide-react';
import { useNavigate } from 'react-router';

export function BottomNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 py-2 px-6 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 bg-[#2b2b2b]">
      <ul className="flex justify-between items-center max-w-md mx-auto">
        <li className="flex flex-col items-center gap-1 cursor-pointer group">
          <Home className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-[10px] text-gray-500 group-hover:text-blue-500 font-medium">Home</span>
        </li>
        <li className="flex flex-col items-center gap-1 cursor-pointer text-blue-500">
          <Library className="w-6 h-6 fill-blue-500" />
          <span className="text-[10px] font-medium">Library</span>
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
        <li className="flex flex-col items-center gap-1 cursor-pointer group">
          <Heart className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-[10px] text-gray-500 group-hover:text-blue-500 font-medium">Favorites</span>
        </li>
        <li className="flex flex-col items-center gap-1 cursor-pointer group">
          <User className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-[10px] text-gray-500 group-hover:text-blue-500 font-medium">Profile</span>
        </li>
      </ul>
    </div>
  );
}
