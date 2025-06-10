import React, { useState } from 'react';
import { X, Calendar, Clock, User, MapPin, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState('fisioterapia');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !serviceType) {
      setError('Per favore compila tutti i campi obbligatori');
      return;
    }

    if (!user) {
      setError('Devi essere autenticato per prenotare una sessione');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Salva la prenotazione nel database
      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            date,
            time,
            service_type: serviceType,
            notes,
            status: 'scheduled'
          }
        ]);

      if (insertError) throw insertError;

      // Notifica l'utente del successo
      onSuccess();
      onClose();
      
      // Reset form
      setDate('');
      setTime('');
      setServiceType('fisioterapia');
      setNotes('');
    } catch (err: any) {
      console.error('Errore durante la prenotazione:', err);
      setError(err.message || 'Si è verificato un errore durante la prenotazione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Calcola la data minima (oggi)
  const today = new Date().toISOString().split('T')[0];
  
  // Calcola la data massima (3 mesi da oggi)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Prenota una Sessione di Prova</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                max={maxDateStr}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orario *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              >
                <option value="">Seleziona un orario</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo di Servizio *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              >
                <option value="fisioterapia">Fisioterapia</option>
                <option value="visita_medica">Visita Medica</option>
                <option value="assistenza_domiciliare">Assistenza Domiciliare</option>
                <option value="consulenza">Consulenza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="sede_principale">Sede Principale - Via Roma 123, Napoli</option>
                <option value="sede_secondaria">Sede Secondaria - Corso Umberto 45, Napoli</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (opzionale)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                rows={3}
                placeholder="Inserisci eventuali note o richieste particolari..."
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-3 hover:bg-gray-50"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Prenotazione in corso...' : 'Prenota Ora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};