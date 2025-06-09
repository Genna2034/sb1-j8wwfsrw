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
    localStorage.setItem('emmanuel_user', JSON.stringify(user));
    localStorage.setItem('emmanuel_token', token);
    console.log('✅ Sessione salvata con successo');
    
    // Verifica immediata del salvataggio
    const savedUser = localStorage.getItem('emmanuel_user');
    const savedToken = localStorage.getItem('emmanuel_token');
    console.log('🔍 Verifica salvataggio:', { 
      userSaved: !!savedUser, 
      tokenSaved: !!savedToken 
    });
  } catch (error) {
    console.error('💥 Errore nel salvataggio sessione:', error);
    throw error;
  }
};

export const clearUserSession = (): void => {
  console.log('🗑️ Cancellando sessione...');
  localStorage.removeItem('emmanuel_user');
  localStorage.removeItem('emmanuel_token');
  console.log('✅ Sessione cancellata');
};

export const generateToken = (): string => {
  const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
  console.log('🔑 Token generato:', token.substring(0, 10) + '...');
  return token;
};

export const isValidSession = (): boolean => {
  const user = getCurrentUser();
  const token = localStorage.getItem('emmanuel_token');
  const isValid = !!(user && token);
  console.log('🔍 Controllo validità sessione:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    isValid 
  });
  return isValid;
};