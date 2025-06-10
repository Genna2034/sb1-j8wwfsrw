import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  service_type: string;
  notes: string;
  status: string;
  created_at: string;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadBookings();
    }
  }, [isOpen, user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      setBookings(data || []);
    } catch (err) {
      console.error('Errore nel caricamento delle prenotazioni:', err);
      setError('Impossibile caricare le prenotazioni. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Aggiorna la lista delle prenotazioni
      setBookings(bookings.filter(booking => booking.id !== id));
    } catch (err) {
      console.error('Errore nella cancellazione della prenotazione:', err);
      alert('Impossibile cancellare la prenotazione. Riprova più tardi.');
    }
  };

  const getServiceTypeDisplay = (type: string) => {
    switch (type) {
      case 'fisioterapia': return 'Fisioterapia';
      case 'visita_medica': return 'Visita Medica';
      case 'assistenza_domiciliare': return 'Assistenza Domiciliare';
      case 'consulenza': return 'Consulenza';
      default: return type;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'scheduled': return { text: 'Programmata', color: 'bg-blue-100 text-blue-800' };
      case 'confirmed': return { text: 'Confermata', color: 'bg-green-100 text-green-800' };
      case 'completed': return { text: 'Completata', color: 'bg-gray-100 text-gray-800' };
      case 'cancelled': return { text: 'Cancellata', color: 'bg-red-100 text-red-800' };
      default: return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Le mie prenotazioni</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mb-4" />
              <p className="text-gray-600">Caricamento prenotazioni...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700">{error}</p>
              <button 
                onClick={loadBookings}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                Riprova
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna prenotazione</h3>
              <p className="text-gray-600">
                Non hai ancora effettuato nessuna prenotazione. Prenota una sessione di prova per iniziare.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusDisplay(booking.status).color}`}>
                          {getStatusDisplay(booking.status).text}
                        </span>
                        <span className="ml-3 text-lg font-semibold text-gray-900">
                          {getServiceTypeDisplay(booking.service_type)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-sky-600" />
                          <span>{new Date(booking.date).toLocaleDateString('it-IT', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-sky-600" />
                          <span>Ore {booking.time}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-sky-600" />
                          <span>Sede principale</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2 text-sky-600" />
                          <span>Operatore assegnato</span>
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                          <p className="font-medium mb-1">Note:</p>
                          <p>{booking.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 text-xs text-gray-500">
                        Prenotato il {new Date(booking.created_at).toLocaleDateString('it-IT')} alle {new Date(booking.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Cancella prenotazione"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {bookings.length > 0 ? (
                <span>Totale prenotazioni: <strong>{bookings.length}</strong></span>
              ) : (
                <span>Nessuna prenotazione trovata</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};