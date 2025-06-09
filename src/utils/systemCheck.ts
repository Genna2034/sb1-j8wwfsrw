// Utility per verifiche di sistema e debugging
export const performSystemCheck = () => {
  console.log('🔍 === VERIFICA SISTEMA EMMANUEL ===');
  
  const checks = {
    localStorage: checkLocalStorage(),
    authState: checkAuthState(),
    userManagement: checkUserManagement(),
    dependencies: checkDependencies(),
    performance: checkPerformance()
  };
  
  console.log('📊 Risultati verifica:', checks);
  return checks;
};

const checkLocalStorage = () => {
  try {
    const testKey = 'emmanuel_test';
    const testValue = 'test_value';
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    return {
      available: true,
      working: retrieved === testValue,
      quota: getLocalStorageQuota()
    };
  } catch (error) {
    return {
      available: false,
      working: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const checkAuthState = () => {
  const user = localStorage.getItem('emmanuel_user');
  const token = localStorage.getItem('emmanuel_token');
  const timestamp = localStorage.getItem('emmanuel_session_timestamp');
  
  return {
    hasUser: !!user,
    hasToken: !!token,
    hasTimestamp: !!timestamp,
    userValid: user ? isValidJSON(user) : false,
    sessionAge: timestamp ? getSessionAge(timestamp) : null
  };
};

const checkUserManagement = () => {
  const users = localStorage.getItem('emmanuel_users');
  
  return {
    hasUsers: !!users,
    usersValid: users ? isValidJSON(users) : false,
    userCount: users ? JSON.parse(users).length : 0
  };
};

const checkDependencies = () => {
  return {
    react: typeof React !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    crypto: typeof crypto !== 'undefined'
  };
};

const checkPerformance = () => {
  const start = performance.now();
  
  // Simula operazioni comuni
  for (let i = 0; i < 1000; i++) {
    JSON.stringify({ test: i });
  }
  
  const end = performance.now();
  
  return {
    jsonOperationTime: end - start,
    memoryUsage: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    } : 'Not available'
  };
};

const getLocalStorageQuota = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      used: total,
      usedMB: (total / 1024 / 1024).toFixed(2)
    };
  } catch {
    return 'Unable to calculate';
  }
};

const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

const getSessionAge = (timestamp: string) => {
  try {
    const sessionTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - sessionTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return {
      hours: diffHours.toFixed(1),
      valid: diffHours < 24
    };
  } catch {
    return null;
  }
};

// Funzione per test automatici del login
export const testLoginFlow = async (username: string, password: string) => {
  console.log('🧪 === TEST LOGIN FLOW ===');
  
  const results = {
    step1_auth: false,
    step2_storage: false,
    step3_state: false,
    step4_cleanup: false,
    errors: [] as string[]
  };
  
  try {
    // Step 1: Test autenticazione
    const { authenticateUser } = await import('./auth');
    const user = authenticateUser(username, password);
    results.step1_auth = !!user;
    
    if (!user) {
      results.errors.push('Autenticazione fallita');
      return results;
    }
    
    // Step 2: Test salvataggio
    const { saveUserSession, generateToken } = await import('./auth');
    const token = generateToken();
    saveUserSession(user, token);
    
    const savedUser = localStorage.getItem('emmanuel_user');
    const savedToken = localStorage.getItem('emmanuel_token');
    results.step2_storage = !!(savedUser && savedToken);
    
    if (!results.step2_storage) {
      results.errors.push('Salvataggio sessione fallito');
    }
    
    // Step 3: Test recupero stato
    const { getCurrentUser, isValidSession } = await import('./auth');
    const retrievedUser = getCurrentUser();
    const sessionValid = isValidSession();
    results.step3_state = !!(retrievedUser && sessionValid);
    
    if (!results.step3_state) {
      results.errors.push('Recupero stato fallito');
    }
    
    // Step 4: Test cleanup
    const { clearUserSession } = await import('./auth');
    clearUserSession();
    
    const cleanedUser = localStorage.getItem('emmanuel_user');
    const cleanedToken = localStorage.getItem('emmanuel_token');
    results.step4_cleanup = !cleanedUser && !cleanedToken;
    
    if (!results.step4_cleanup) {
      results.errors.push('Cleanup sessione fallito');
    }
    
  } catch (error) {
    results.errors.push(`Errore durante test: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  console.log('🧪 Risultati test login:', results);
  return results;
};

// Funzione per verificare race conditions
export const checkRaceConditions = () => {
  console.log('🏁 === CHECK RACE CONDITIONS ===');
  
  const promises = [];
  
  // Simula chiamate multiple simultanee
  for (let i = 0; i < 10; i++) {
    promises.push(
      new Promise(resolve => {
        setTimeout(() => {
          const timestamp = Date.now();
          localStorage.setItem(`test_${i}`, timestamp.toString());
          resolve(timestamp);
        }, Math.random() * 100);
      })
    );
  }
  
  return Promise.all(promises).then(results => {
    // Cleanup
    for (let i = 0; i < 10; i++) {
      localStorage.removeItem(`test_${i}`);
    }
    
    console.log('🏁 Race condition test completato');
    return {
      completed: true,
      results: results.length
    };
  });
};