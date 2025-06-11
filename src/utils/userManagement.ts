import { User } from '../types/auth';

const STORAGE_KEY = 'emmanuel_users';

const DEFAULT_USERS: User[] = [
  {
    id: crypto.randomUUID(),
    username: 'admin.emmanuel',
    name: 'Mario Rossi',
    role: 'admin',
    department: 'Amministrazione',
    position: 'Amministratore Sistema',
    password: 'Emmanuel2024!'
  },
  {
    id: crypto.randomUUID(),
    username: 'gennaro.borriello',
    name: 'Gennaro Borriello',
    role: 'coordinator',
    department: 'Assistenza Domiciliare',
    position: 'Coordinatore',
    password: 'Coord2024!'
  },
  {
    id: crypto.randomUUID(),
    username: 'infermiere.01',
    name: 'Anna Verdi',
    role: 'staff',
    department: 'Assistenza Domiciliare',
    position: 'Infermiere',
    password: 'Staff2024!'
  }
];

export const initializeDefaultUsers = (): void => {
  const existingUsers = localStorage.getItem(STORAGE_KEY);
  if (!existingUsers) {
    console.log('Inizializzazione utenti di default...');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    console.log('Utenti di default salvati:', DEFAULT_USERS);
  }
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
  console.log('Salvando utente:', user);
  
  // Assicurati che la password sia presente
  if (!user.password) {
    console.error('ERRORE: Tentativo di salvare utente senza password!');
    throw new Error('Password obbligatoria per salvare l\'utente');
  }
  
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    console.log('Aggiornando utente esistente:', user.id);
    users[existingIndex] = { ...user }; // Crea una copia completa
  } else {
    console.log('Aggiungendo nuovo utente:', user.id);
    users.push({ ...user }); // Crea una copia completa
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  console.log('✅ Utente salvato con successo:', user);
  
  // Verifica che sia stato salvato correttamente
  const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const savedUser = savedUsers.find((u: User) => u.id === user.id);
  console.log('Verifica salvataggio:', savedUser);
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers));
  console.log('Utente eliminato:', userId);
};

export const generateUserId = (): string => {
  return crypto.randomUUID();
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