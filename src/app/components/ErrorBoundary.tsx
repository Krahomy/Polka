import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcfaf6] flex flex-col items-center justify-center px-8 text-center">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-6 opacity-60"
          >
            <rect x="14" y="18" width="36" height="48" rx="3" fill="#e8ddd0" stroke="#c4b09a" strokeWidth="1.5"/>
            <rect x="14" y="18" width="7" height="48" rx="2" fill="#c4b09a"/>
            <line x1="28" y1="34" x2="42" y2="34" stroke="#c4b09a" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="28" y1="42" x2="42" y2="42" stroke="#c4b09a" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="57" cy="57" r="16" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1.5"/>
            <line x1="57" y1="50" x2="57" y2="58" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="57" cy="63" r="1.5" fill="#ef4444"/>
          </svg>
          <h2 className="text-lg font-semibold text-gray-700 mb-2 font-[Open_Sans]">
            Что-то пошло не так
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Попробуй перезагрузить страницу
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-[#3b3b3b] text-white text-sm hover:bg-black transition-colors"
          >
            Перезагрузить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
