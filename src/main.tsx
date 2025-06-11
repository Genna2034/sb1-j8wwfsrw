import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { SupabaseProvider } from './contexts/SupabaseContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </SupabaseProvider>
  </StrictMode>
);