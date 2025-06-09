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

export const initializeDefaultUsers = (): void => {
  console.log('Inizializzazione utenti di default...');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  console.log('Utenti di default salvati:', DEFAULT_USERS);
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    console.log('Nessun utente trovato, inizializzo quelli di default');
    initializeDefaultUsers();
    return DEFAULT_USERS;
  }
  const users = JSON.parse(data);
  console.log('Utenti caricati dal localStorage:', users);
  return users;
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
  console.log('Utente salvato:', user);
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers));
  console.log('Utente eliminato:', userId);
};

export const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getUserByCredentials = (username: string, password: string): User | null => {
  console.log('=== DEBUG LOGIN ===');
  console.log('Credenziali inserite:', { username, password });
  
  const users = getUsers();
  console.log('Tutti gli utenti nel sistema:', users);
  
  // Verifica esatta delle credenziali
  const user = users.find(u => {
    const usernameMatch = u.username === username;
    const passwordMatch = u.password === password;
    console.log(`Controllo utente ${u.username}:`, {
      usernameMatch,
      passwordMatch,
      storedUsername: u.username,
      storedPassword: u.password
    });
    return usernameMatch && passwordMatch;
  });
  
  if (user) {
    console.log('✅ LOGIN RIUSCITO per:', user.name);
    return user;
  } else {
    console.log('❌ LOGIN FALLITO - nessuna corrispondenza trovata');
    console.log('Credenziali valide disponibili:');
    users.forEach(u => {
      console.log(`- ${u.username} / ${u.password} (${u.name})`);
    });
    return null;
  }
};