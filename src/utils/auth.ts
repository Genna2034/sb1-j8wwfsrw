import { User } from '../types/auth';
import { getUserByCredentials, initializeDefaultUsers } from './userManagement';

export const authenticateUser = (username: string, password: string): User | null => {
  console.log('=== INIZIO AUTENTICAZIONE ===');
  console.log('Tentativo di login con:', { username, password });
  
  // Assicurati che gli utenti di default siano sempre presenti
  initializeDefaultUsers();
  
  const user = getUserByCredentials(username, password);
  
  if (user) {
    console.log('✅ Autenticazione riuscita per:', user.name);
    return user;
  }
  
  console.log('❌ Autenticazione fallita');
  return null;
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('emmanuel_user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Utente corrente dal localStorage:', user);
      return user;
    }
  } catch (error) {
    console.error('Errore nel recupero utente:', error);
    clearUserSession();
  }
  return null;
};

export const saveUserSession = (user: User, token: string): void => {
  try {
    localStorage.setItem('emmanuel_user', JSON.stringify(user));
    localStorage.setItem('emmanuel_token', token);
    console.log('✅ Sessione salvata per:', user.name);
  } catch (error) {
    console.error('Errore nel salvataggio sessione:', error);
  }
};

export const clearUserSession = (): void => {
  localStorage.removeItem('emmanuel_user');
  localStorage.removeItem('emmanuel_token');
  console.log('🗑️ Sessione cancellata');
};

export const generateToken = (): string => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

export const isValidSession = (): boolean => {
  const user = getCurrentUser();
  const token = localStorage.getItem('emmanuel_token');
  const isValid = !!(user && token);
  console.log('Controllo validità sessione:', { user: !!user, token: !!token, isValid });
  return isValid;
};