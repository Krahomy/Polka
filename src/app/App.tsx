import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BooksProvider } from './context/BooksContext';
import AuthPage from './pages/AuthPage';
import SpineSymbols from './components/SpineSymbols';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0eb]">
        <p className="text-gray-400 text-sm">Загрузка...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <BooksProvider>
      <SpineSymbols />
      <RouterProvider router={router} />
    </BooksProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-center" />
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
