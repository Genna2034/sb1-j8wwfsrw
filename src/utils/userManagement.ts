import { User } from '../types/auth';

const STORAGE_KEY = 'emmanuel_users';

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin.emmanuel',
    name: 'Mario Rossi',
    role: 'admin',
    department: 'Amministrazione',
    position: 'Amministratore Sistema',
    password: 'Emmanuel2024!'
  },
  {
    id: '2',
    username: 'gennaro.borriello',
    name: 'Gennaro Borriello',
    role: 'coordinator',
    department: 'Assistenza Domiciliare',
    position: 'Coordinatore',
    password: 'Coord2024!'
  },
  {
    id: '3',
    username: 'infermiere.01',
    name: 'Anna Verdi',
    role: 'staff',
    department: 'Assistenza Domiciliare',
    position: 'Infermiere',
    password: 'Staff2024!'
  }
];

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Se non ci sono utenti salvati, inizializza con quelli di default
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(data);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers));
};

export const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getUserByCredentials = (username: string, password: string): User | null => {
  console.log('Cercando utente con credenziali:', { username, password });
  const users = getUsers();
  console.log('Utenti disponibili:', users);
  
  const user = users.find(u => u.username === username && u.password === password);
  console.log('Utente trovato:', user);
  
  return user || null;
};

// Funzione per inizializzare gli utenti di default se necessario
export const initializeDefaultUsers = (): void => {
  const existingUsers = localStorage.getItem(STORAGE_KEY);
  if (!existingUsers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    console.log('Utenti di default inizializzati');
  }
};