import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { MyBookingsModal } from './MyBookingsModal';
import { useAuth } from '../contexts/AuthContext';

export const BookingButton: React.FC = () => {
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMyBookingsModal, setShowMyBookingsModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookingSuccess = () => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={() => setShowBookingModal(true)}
          className="px-5 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center justify-center"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Prenota una Sessione
        </button>
        
        {user && (
          <button
            onClick={() => setShowMyBookingsModal(true)}
            className="px-5 py-3 bg-white text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Le mie prenotazioni
          </button>
        )}
      </div>

      {bookingSuccess && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Prenotazione effettuata con successo! Ti contatteremo presto per confermare.
        </div>
      )}

      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
        onSuccess={handleBookingSuccess}
      />
      
      <MyBookingsModal
        isOpen={showMyBookingsModal}
        onClose={() => setShowMyBookingsModal(false)}
      />
    </>
  );
};