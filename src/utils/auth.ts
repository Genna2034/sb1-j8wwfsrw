import { User } from '../types/auth';
import { getUserByCredentials, initializeDefaultUsers } from './userManagement';

export const authenticateUser = (username: string, password: string): User | null => {
  console.log('=== INIZIO PROCESSO AUTENTICAZIONE ===');
  console.log('Credenziali ricevute:', { username, password: '***' });
  
  // Assicurati che gli utenti di default siano sempre presenti
  initializeDefaultUsers();
  
  const user = getUserByCredentials(username, password);
  
  if (user) {
    console.log('✅ Autenticazione riuscita per:', user.name, 'Ruolo:', user.role);
    return user;
  }
  
  console.log('❌ Autenticazione fallita per:', username);
  return null;
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('emmanuel_user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('👤 Utente corrente recuperato:', user.name);
      return user;
    }
    console.log('👤 Nessun utente corrente trovato');
  } catch (error) {
    console.error('💥 Errore nel recupero utente corrente:', error);
    clearUserSession();
  }
  return null;
};

export const saveUserSession = (user: User, token: string): void => {
  try {
    console.log('💾 Salvando sessione per:', user.name);
    
    // Rimuovi la password prima di salvare per sicurezza
    const userToSave = { ...user };
    delete userToSave.password;
    
    localStorage.setItem('emmanuel_user', JSON.stringify(userToSave));
    localStorage.setItem('emmanuel_token', token);
    localStorage.setItem('emmanuel_session_timestamp', new Date().toISOString());
    
    console.log('✅ Sessione salvata con successo');
    
    // Verifica immediata del salvataggio
    const savedUser = localStorage.getItem('emmanuel_user');
    const savedToken = localStorage.getItem('emmanuel_token');
    console.log('🔍 Verifica salvataggio:', { 
      userSaved: !!savedUser, 
      tokenSaved: !!savedToken 
    });
    
    // Verifica che il ruolo sia stato salvato correttamente
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('🔍 Ruolo salvato:', parsedUser.role);
    }
  } catch (error) {
    console.error('💥 Errore nel salvataggio sessione:', error);
    throw error;
  }
};

export const clearUserSession = (): void => {
  console.log('🗑️ Cancellando sessione...');
  try {
    localStorage.removeItem('emmanuel_user');
    localStorage.removeItem('emmanuel_token');
    localStorage.removeItem('emmanuel_session_timestamp');
    console.log('✅ Sessione cancellata');
  } catch (error) {
    console.error('💥 Errore nella cancellazione sessione:', error);
  }
};

export const generateToken = (): string => {
  const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
  console.log('🔑 Token generato:', token.substring(0, 10) + '...');
  return token;
};

export const isValidSession = (): boolean => {
  try {
    const user = getCurrentUser();
    const token = localStorage.getItem('emmanuel_token');
    const timestamp = localStorage.getItem('emmanuel_session_timestamp');
    
    if (!user || !token || !timestamp) {
      console.log('🔍 Sessione non valida: dati mancanti');
      return false;
    }
    
    // Verifica che la sessione non sia troppo vecchia (24 ore)
    const sessionTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      console.log('🔍 Sessione scaduta:', hoursDiff, 'ore');
      clearUserSession();
      return false;
    }
    
    const isValid = !!(user && token);
    console.log('🔍 Controllo validità sessione:', { 
      hasUser: !!user, 
      hasToken: !!token, 
      isValid,
      hoursOld: hoursDiff.toFixed(1)
    });
    
    // Verifica che il ruolo sia presente
    if (user && !user.role) {
      console.log('❌ Ruolo utente mancante, sessione non valida');
      clearUserSession();
      return false;
    }
    
    return isValid;
  } catch (error) {
    console.error('💥 Errore nel controllo sessione:', error);
    clearUserSession();
    return false;
  }
};

// Funzione per verificare se l'utente ha i permessi per una determinata azione
export const hasPermission = (user: User | null, requiredRole: string[]): boolean => {
  if (!user) return false;
  return requiredRole.includes(user.role);
};

// Funzione per il refresh del token (per implementazioni future)
export const refreshToken = async (): Promise<string | null> => {
  // Placeholder per implementazione futura
  console.log('🔄 Refresh token non implementato');
  return null;
};