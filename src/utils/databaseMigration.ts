// Sistema di migrazione per aggiornamenti futuri
interface Migration {
  version: string;
  description: string;
  up: () => void;
  down: () => void;
}

const migrations: Migration[] = [
  {
    version: '1.0.1',
    description: 'Aggiunta campo email ai pazienti',
    up: () => {
      const patients = JSON.parse(localStorage.getItem('emmanuel_patients_v2') || '[]');
      patients.forEach((patient: any) => {
        if (!patient.personalInfo.email) {
          patient.personalInfo.email = '';
        }
      });
      localStorage.setItem('emmanuel_patients_v2', JSON.stringify(patients));
    },
    down: () => {
      const patients = JSON.parse(localStorage.getItem('emmanuel_patients_v2') || '[]');
      patients.forEach((patient: any) => {
        delete patient.personalInfo.email;
      });
      localStorage.setItem('emmanuel_patients_v2', JSON.stringify(patients));
    }
  },
  {
    version: '1.0.2',
    description: 'Aggiunta sistema notifiche avanzate',
    up: () => {
      const settings = {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        reminderDays: [1, 3, 7]
      };
      localStorage.setItem('emmanuel_notification_settings', JSON.stringify(settings));
    },
    down: () => {
      localStorage.removeItem('emmanuel_notification_settings');
    }
  }
];

export const getCurrentVersion = (): string => {
  return localStorage.getItem('emmanuel_db_version') || '1.0.0';
};

export const getLatestVersion = (): string => {
  return migrations.length > 0 ? migrations[migrations.length - 1].version : '1.0.0';
};

export const needsMigration = (): boolean => {
  const current = getCurrentVersion();
  const latest = getLatestVersion();
  return current !== latest;
};

export const runMigrations = (): void => {
  const currentVersion = getCurrentVersion();
  console.log(`🔄 Versione corrente: ${currentVersion}`);
  
  const pendingMigrations = migrations.filter(m => 
    compareVersions(m.version, currentVersion) > 0
  );
  
  if (pendingMigrations.length === 0) {
    console.log('✅ Nessuna migrazione necessaria');
    return;
  }
  
  console.log(`🚀 Esecuzione ${pendingMigrations.length} migrazioni...`);
  
  try {
    pendingMigrations.forEach(migration => {
      console.log(`⬆️ Migrazione ${migration.version}: ${migration.description}`);
      migration.up();
    });
    
    // Aggiorna la versione
    const latestVersion = pendingMigrations[pendingMigrations.length - 1].version;
    localStorage.setItem('emmanuel_db_version', latestVersion);
    
    console.log(`✅ Migrazioni completate. Versione aggiornata a: ${latestVersion}`);
  } catch (error) {
    console.error('❌ Errore durante migrazione:', error);
    throw error;
  }
};

export const rollbackMigration = (targetVersion: string): void => {
  const currentVersion = getCurrentVersion();
  
  const migrationsToRollback = migrations.filter(m => 
    compareVersions(m.version, targetVersion) > 0 && 
    compareVersions(m.version, currentVersion) <= 0
  ).reverse();
  
  console.log(`🔄 Rollback a versione ${targetVersion}...`);
  
  try {
    migrationsToRollback.forEach(migration => {
      console.log(`⬇️ Rollback ${migration.version}: ${migration.description}`);
      migration.down();
    });
    
    localStorage.setItem('emmanuel_db_version', targetVersion);
    console.log(`✅ Rollback completato a versione: ${targetVersion}`);
  } catch (error) {
    console.error('❌ Errore durante rollback:', error);
    throw error;
  }
};

const compareVersions = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  
  return 0;
};

export const getMigrationHistory = () => {
  const currentVersion = getCurrentVersion();
  
  return migrations.map(migration => ({
    ...migration,
    applied: compareVersions(migration.version, currentVersion) <= 0,
    pending: compareVersions(migration.version, currentVersion) > 0
  }));
};