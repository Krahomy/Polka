import { useAuth } from '../context/AuthContext';
import { useBooksContext } from '../context/BooksContext';
import { BottomNav } from '../components/BottomNav';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { books } = useBooksContext();

  const email = user?.email ?? '';
  const initials = email.charAt(0).toUpperCase();

  const finished = books.filter(b => b.status === 'Finished').length;
  const reading = books.filter(b => b.status === 'Reading').length;
  const toRead = books.filter(b => b.status === 'To Read').length;

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-gray-900 font-sans pb-24">
      <main className="max-w-md mx-auto px-6 pt-12">

        {/* Avatar + Email */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full bg-[#3b3b3b] flex items-center justify-center mb-4 shadow-md">
            <span className="text-white text-3xl font-semibold font-[Open_Sans]">{initials}</span>
          </div>
          <p className="text-sm text-gray-500">{email}</p>
        </div>

        {/* Stats */}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Моя статистика
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-[#fff8ef] rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-800">{finished}</p>
            <p className="text-xs text-gray-500 mt-1 leading-snug">Прочитано</p>
          </div>
          <div className="bg-[#fff8ef] rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-800">{reading}</p>
            <p className="text-xs text-gray-500 mt-1 leading-snug">Читаю сейчас</p>
          </div>
          <div className="bg-[#fff8ef] rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-800">{toRead}</p>
            <p className="text-xs text-gray-500 mt-1 leading-snug">Хочу прочитать</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          className="w-full py-3 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Выйти
        </button>

      </main>
      <BottomNav />
    </div>
  );
}
