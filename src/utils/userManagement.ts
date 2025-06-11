import { User } from '../types/auth';

const STORAGE_KEY = 'emmanuel_users';

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Helper function to generate a valid UUID
const generateValidUUID = (): string => {
  return crypto.randomUUID();
};

const DEFAULT_USERS: User[] = [
  {
    id: generateValidUUID(),
    username: 'admin.emmanuel',
    name: 'Mario Rossi',
    role: 'admin',
    department: 'Amministrazione',
    position: 'Amministratore Sistema',
    password: 'Emmanuel2024!'
  },
  {
    id: generateValidUUID(),
    username: 'gennaro.borriello',
    name: 'Gennaro Borriello',
    role: 'coordinator',
    department: 'Assistenza Domiciliare',
    position: 'Coordinatore',
    password: 'Coord2024!'
  },
  {
    id: generateValidUUID(),
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
  
  // Always ensure default users are properly formatted and saved
  const validDefaultUsers = DEFAULT_USERS.map(user => ({
    ...user,
    id: isValidUUID(user.id) ? user.id : generateValidUUID()
  }));
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validDefaultUsers));
  console.log('Utenti di default salvati:', validDefaultUsers);
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  
  if (!data) {
    console.log('Nessun utente trovato, inizializzo quelli di default');
    initializeDefaultUsers();
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
  
  try {
    const users = JSON.parse(data);
    
    // Filter out users with invalid UUIDs and fix any that can be fixed
    const validUsers = users
      .filter((user: any) => {
        if (!user.id || !isValidUUID(user.id)) {
          console.warn('Utente con ID non valido rimosso:', user);
          return false;
        }
        return true;
      })
      .map((user: User) => ({
        ...user,
        id: isValidUUID(user.id) ? user.id : generateValidUUID()
      }));
    
    // If we had to filter out invalid users, save the cleaned data
    if (validUsers.length !== users.length) {
      console.log('Alcuni utenti con ID non validi sono stati rimossi. Salvataggio dati puliti...');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validUsers));
    }
    
    // If no valid users remain, reinitialize with defaults
    if (validUsers.length === 0) {
      console.log('Nessun utente valido trovato, reinizializzo quelli di default');
      initializeDefaultUsers();
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }
    
    console.log('Utenti caricati dal localStorage:', validUsers);
    return validUsers;
  } catch (error) {
    console.error('Errore nel parsing dei dati utenti, reinizializzo:', error);
    initializeDefaultUsers();
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
};

export const saveUser = (user: User): void => {
  console.log('Salvando utente:', user);
  
  // Assicurati che la password sia presente
  if (!user.password) {
    console.error('ERRORE: Tentativo di salvare utente senza password!');
    throw new Error('Password obbligatoria per salvare l\'utente');
  }
  
  // Ensure the user has a valid UUID
  const userToSave = {
    ...user,
    id: user.id && isValidUUID(user.id) ? user.id : generateValidUUID()
  };
  
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === userToSave.id);
  
  if (existingIndex >= 0) {
    console.log('Aggiornando utente esistente:', userToSave.id);
    users[existingIndex] = { ...userToSave };
  } else {
    console.log('Aggiungendo nuovo utente:', userToSave.id);
    users.push({ ...userToSave });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  console.log('✅ Utente salvato con successo:', userToSave);
  
  // Verifica che sia stato salvato correttamente
  const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const savedUser = savedUsers.find((u: User) => u.id === userToSave.id);
  console.log('Verifica salvataggio:', savedUser);
};

export const deleteUser = (userId: string): void => {
  if (!isValidUUID(userId)) {
    console.error('Tentativo di eliminare utente con ID non valido:', userId);
    return;
  }
  
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers));
  console.log('Utente eliminato:', userId);
};

export const generateUserId = (): string => {
  return generateValidUUID();
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
    const hasValidId = isValidUUID(u.id);
    
    console.log(`Controllo utente ${u.username}:`, {
      usernameMatch,
      passwordMatch,
      hasValidId,
      storedUsername: u.username,
      storedPassword: u.password,
      userId: u.id
    });
    
    return usernameMatch && passwordMatch && hasValidId;
  });
  
  if (user) {
    console.log('✅ LOGIN RIUSCITO per:', user.name);
    console.log('User ID valido:', user.id);
    return user;
  } else {
    console.log('❌ LOGIN FALLITO - nessuna corrispondenza trovata');
    console.log('Credenziali valide disponibili:');
    users.forEach(u => {
      console.log(`- ${u.username} / ${u.password} (${u.name}) [ID: ${u.id}]`);
    });
    return null;
  }
};