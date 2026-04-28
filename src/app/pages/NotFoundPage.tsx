import { useNavigate } from 'react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfaf6] flex flex-col items-center justify-center px-8 text-center">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-70"
      >
        {/* Три книги */}
        <rect x="8" y="28" width="22" height="48" rx="3" fill="#d6cfc6" stroke="#b8a99a" strokeWidth="1.5"/>
        <rect x="8" y="28" width="6" height="48" rx="2" fill="#b8a99a"/>
        <rect x="34" y="18" width="26" height="58" rx="3" fill="#e8ddd0" stroke="#c4b09a" strokeWidth="1.5"/>
        <rect x="34" y="18" width="7" height="58" rx="2" fill="#c4b09a"/>
        <rect x="64" y="32" width="20" height="44" rx="3" fill="#d6cfc6" stroke="#b8a99a" strokeWidth="1.5"/>
        <rect x="64" y="32" width="5" height="44" rx="2" fill="#b8a99a"/>
        {/* Полка */}
        <rect x="4" y="74" width="92" height="5" rx="2" fill="#c4b09a"/>
        {/* Знак вопроса на центральной книге */}
        <text x="47" y="55" textAnchor="middle" fill="#a08060" fontSize="20" fontWeight="bold" fontFamily="serif">?</text>
      </svg>

      <h2 className="text-xl font-semibold text-gray-700 mb-2 font-[Open_Sans]">
        Страница не найдена
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Такой страницы не существует
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2.5 rounded-xl bg-[#3b3b3b] text-white text-sm hover:bg-black transition-colors"
      >
        На главную
      </button>
    </div>
  );
}
