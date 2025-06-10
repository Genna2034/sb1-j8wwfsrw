import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { BookingButton } from './components/BookingButton';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Cooperativa Emmanuel</h1>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-sm rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prenota una sessione di prova</h2>
            <p className="text-gray-600 mb-6">
              Prenota una sessione di prova con i nostri professionisti. Siamo qui per aiutarti a migliorare la tua salute e il tuo benessere.
            </p>
            
            <BookingButton />
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;