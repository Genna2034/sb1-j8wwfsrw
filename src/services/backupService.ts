// Servizio Backup Cloud Avanzato
export interface BackupConfig {
  provider: 'local' | 'dropbox' | 'googledrive' | 'onedrive' | 's3';
  apiKey?: string;
  accessToken?: string;
  bucketName?: string;
  encryptionKey?: string;
  autoBackup: boolean;
  backupInterval: number; // in hours
  retentionDays: number;
  compressionLevel: number; // 0-9
}

export interface BackupMetadata {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  version: string;
  checksum: string;
  encrypted: boolean;
  compressed: boolean;
  dataTypes: string[];
  recordCounts: Record<string, number>;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    patients: any[];
    appointments: any[];
    invoices: any[];
    users: any[];
    medicalRecords: any[];
    timeEntries: any[];
    settings: any;
  };
}

class BackupService {
  private config: BackupConfig;
  private isBackupInProgress = false;

  constructor(config: BackupConfig) {
    this.config = config;
    this.initializeAutoBackup();
  }

  private initializeAutoBackup() {
    if (this.config.autoBackup) {
      setInterval(() => {
        this.createAutoBackup();
      }, this.config.backupInterval * 60 * 60 * 1000);
    }
  }

  async createBackup(options?: {
    name?: string;
    dataTypes?: string[];
    encrypt?: boolean;
    compress?: boolean;
  }): Promise<{ success: boolean; backupId?: string; error?: string }> {
    if (this.isBackupInProgress) {
      return { success: false, error: 'Backup già in corso' };
    }

    this.isBackupInProgress = true;

    try {
      console.log('🔄 Inizio creazione backup...');

      // Raccogli tutti i dati
      const backupData = await this.collectData(options?.dataTypes);
      
      // Crea metadata
      const metadata: BackupMetadata = {
        id: `backup_${Date.now()}`,
        name: options?.name || `Backup_${new Date().toISOString().split('T')[0]}`,
        size: 0,
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        checksum: '',
        encrypted: options?.encrypt || false,
        compressed: options?.compress || true,
        dataTypes: options?.dataTypes || ['all'],
        recordCounts: this.getRecordCounts(backupData.data)
      };

      const fullBackup: BackupData = {
        metadata,
        data: backupData.data
      };

      // Comprimi se richiesto
      let finalData = JSON.stringify(fullBackup);
      if (options?.compress !== false) {
        finalData = await this.compressData(finalData);
      }

      // Cripta se richiesto
      if (options?.encrypt && this.config.encryptionKey) {
        finalData = await this.encryptData(finalData);
      }

      // Calcola checksum
      metadata.checksum = await this.calculateChecksum(finalData);
      metadata.size = finalData.length;

      // Salva backup
      const result = await this.saveBackup(metadata.id, finalData, metadata);

      if (result.success) {
        console.log('✅ Backup creato con successo:', metadata.id);
        this.saveBackupHistory(metadata);
        this.cleanupOldBackups();
      }

      return result;

    } catch (error) {
      console.error('❌ Errore durante backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    } finally {
      this.isBackupInProgress = false;
    }
  }

  async restoreBackup(backupId: string, options?: {
    dataTypes?: string[];
    overwrite?: boolean;
    preview?: boolean;
  }): Promise<{ success: boolean; restoredData?: any; error?: string }> {
    try {
      console.log('🔄 Inizio ripristino backup:', backupId);

      // Carica backup
      const backupData = await this.loadBackup(backupId);
      if (!backupData) {
        return { success: false, error: 'Backup non trovato' };
      }

      // Decripta se necessario
      let data = backupData;
      if (this.isEncrypted(data) && this.config.encryptionKey) {
        data = await this.decryptData(data);
      }

      // Decomprimi se necessario
      if (this.isCompressed(data)) {
        data = await this.decompressData(data);
      }

      const backup: BackupData = JSON.parse(data);

      // Verifica checksum
      const calculatedChecksum = await this.calculateChecksum(data);
      if (calculatedChecksum !== backup.metadata.checksum) {
        return { success: false, error: 'Checksum non valido - backup corrotto' };
      }

      // Se è solo preview, ritorna i dati senza ripristinare
      if (options?.preview) {
        return {
          success: true,
          restoredData: {
            metadata: backup.metadata,
            preview: this.generatePreview(backup.data)
          }
        };
      }

      // Ripristina i dati
      const restoreResult = await this.restoreData(backup.data, options);

      if (restoreResult.success) {
        console.log('✅ Backup ripristinato con successo');
        this.saveRestoreHistory(backup.metadata);
      }

      return restoreResult;

    } catch (error) {
      console.error('❌ Errore durante ripristino:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }

  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const history = this.getBackupHistory();
      return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Errore nel caricamento lista backup:', error);
      return [];
    }
  }

  async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Rimuovi dal provider
      await this.deleteFromProvider(backupId);
      
      // Rimuovi dalla cronologia
      this.removeFromHistory(backupId);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore eliminazione'
      };
    }
  }

  private async collectData(dataTypes?: string[]): Promise<{ data: BackupData['data'] }> {
    const data: BackupData['data'] = {
      patients: [],
      appointments: [],
      invoices: [],
      users: [],
      medicalRecords: [],
      timeEntries: [],
      settings: {}
    };

    const shouldInclude = (type: string) => 
      !dataTypes || dataTypes.includes('all') || dataTypes.includes(type);

    if (shouldInclude('patients')) {
      data.patients = JSON.parse(localStorage.getItem('emmanuel_patients_v2') || '[]');
    }

    if (shouldInclude('appointments')) {
      data.appointments = JSON.parse(localStorage.getItem('emmanuel_appointments_v2') || '[]');
    }

    if (shouldInclude('invoices')) {
      data.invoices = JSON.parse(localStorage.getItem('emmanuel_invoices') || '[]');
    }

    if (shouldInclude('users')) {
      data.users = JSON.parse(localStorage.getItem('emmanuel_users') || '[]');
    }

    if (shouldInclude('medicalRecords')) {
      data.medicalRecords = JSON.parse(localStorage.getItem('emmanuel_medical_records') || '[]');
    }

    if (shouldInclude('timeEntries')) {
      data.timeEntries = JSON.parse(localStorage.getItem('emmanuel_time_entries') || '[]');
    }

    if (shouldInclude('settings')) {
      data.settings = {
        billingSettings: JSON.parse(localStorage.getItem('emmanuel_billing_settings') || '{}'),
        communicationSettings: JSON.parse(localStorage.getItem('emmanuel_communication_settings') || '{}')
      };
    }

    return { data };
  }

  private async restoreData(
    data: BackupData['data'], 
    options?: { dataTypes?: string[]; overwrite?: boolean }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const shouldRestore = (type: string) => 
        !options?.dataTypes || options.dataTypes.includes('all') || options.dataTypes.includes(type);

      if (shouldRestore('patients') && data.patients) {
        if (options?.overwrite) {
          localStorage.setItem('emmanuel_patients_v2', JSON.stringify(data.patients));
        } else {
          // Merge con dati esistenti
          const existing = JSON.parse(localStorage.getItem('emmanuel_patients_v2') || '[]');
          const merged = this.mergeArrays(existing, data.patients, 'id');
          localStorage.setItem('emmanuel_patients_v2', JSON.stringify(merged));
        }
      }

      if (shouldRestore('appointments') && data.appointments) {
        if (options?.overwrite) {
          localStorage.setItem('emmanuel_appointments_v2', JSON.stringify(data.appointments));
        } else {
          const existing = JSON.parse(localStorage.getItem('emmanuel_appointments_v2') || '[]');
          const merged = this.mergeArrays(existing, data.appointments, 'id');
          localStorage.setItem('emmanuel_appointments_v2', JSON.stringify(merged));
        }
      }

      if (shouldRestore('invoices') && data.invoices) {
        if (options?.overwrite) {
          localStorage.setItem('emmanuel_invoices', JSON.stringify(data.invoices));
        } else {
          const existing = JSON.parse(localStorage.getItem('emmanuel_invoices') || '[]');
          const merged = this.mergeArrays(existing, data.invoices, 'id');
          localStorage.setItem('emmanuel_invoices', JSON.stringify(merged));
        }
      }

      if (shouldRestore('users') && data.users) {
        if (options?.overwrite) {
          localStorage.setItem('emmanuel_users', JSON.stringify(data.users));
        } else {
          const existing = JSON.parse(localStorage.getItem('emmanuel_users') || '[]');
          const merged = this.mergeArrays(existing, data.users, 'id');
          localStorage.setItem('emmanuel_users', JSON.stringify(merged));
        }
      }

      if (shouldRestore('medicalRecords') && data.medicalRecords) {
        if (options?.overwrite) {
          localStorage.setItem('emmanuel_medical_records', JSON.stringify(data.medicalRecords));
        } else {
          const existing = JSON.parse(localStorage.getItem('emmanuel_medical_records') || '[]');
          const merged = this.mergeArrays(existing, data.medicalRecords, 'id');
          localStorage.setItem('emmanuel_medical_records', JSON.stringify(merged));
        }
      }

      if (shouldRestore('timeEntries') && data.timeEntries) {
        if (options?.overwrite) {
          localStorage.setItem('emmanuel_time_entries', JSON.stringify(data.timeEntries));
        } else {
          const existing = JSON.parse(localStorage.getItem('emmanuel_time_entries') || '[]');
          const merged = this.mergeArrays(existing, data.timeEntries, 'id');
          localStorage.setItem('emmanuel_time_entries', JSON.stringify(merged));
        }
      }

      if (shouldRestore('settings') && data.settings) {
        if (data.settings.billingSettings) {
          localStorage.setItem('emmanuel_billing_settings', JSON.stringify(data.settings.billingSettings));
        }
        if (data.settings.communicationSettings) {
          localStorage.setItem('emmanuel_communication_settings', JSON.stringify(data.settings.communicationSettings));
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore ripristino'
      };
    }
  }

  private mergeArrays(existing: any[], incoming: any[], keyField: string): any[] {
    const existingMap = new Map(existing.map(item => [item[keyField], item]));
    
    incoming.forEach(item => {
      existingMap.set(item[keyField], item);
    });
    
    return Array.from(existingMap.values());
  }

  private getRecordCounts(data: BackupData['data']): Record<string, number> {
    return {
      patients: data.patients?.length || 0,
      appointments: data.appointments?.length || 0,
      invoices: data.invoices?.length || 0,
      users: data.users?.length || 0,
      medicalRecords: data.medicalRecords?.length || 0,
      timeEntries: data.timeEntries?.length || 0
    };
  }

  private generatePreview(data: BackupData['data']): any {
    return {
      recordCounts: this.getRecordCounts(data),
      sampleData: {
        patients: data.patients?.slice(0, 3).map(p => ({ id: p.id, name: p.personalInfo?.name })),
        appointments: data.appointments?.slice(0, 3).map(a => ({ id: a.id, date: a.date, patientName: a.patientName })),
        invoices: data.invoices?.slice(0, 3).map(i => ({ id: i.id, number: i.number, total: i.total }))
      }
    };
  }

  private async saveBackup(
    backupId: string, 
    data: string, 
    metadata: BackupMetadata
  ): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'local':
          return await this.saveToLocal(backupId, data, metadata);
        case 'dropbox':
          return await this.saveToDropbox(backupId, data, metadata);
        case 'googledrive':
          return await this.saveToGoogleDrive(backupId, data, metadata);
        default:
          return await this.saveToLocal(backupId, data, metadata);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore salvataggio'
      };
    }
  }

  private async saveToLocal(
    backupId: string, 
    data: string, 
    metadata: BackupMetadata
  ): Promise<{ success: boolean; backupId?: string }> {
    // Salva nel localStorage (per demo)
    localStorage.setItem(`emmanuel_backup_${backupId}`, data);
    localStorage.setItem(`emmanuel_backup_meta_${backupId}`, JSON.stringify(metadata));
    
    return { success: true, backupId };
  }

  private async saveToDropbox(
    backupId: string, 
    data: string, 
    metadata: BackupMetadata
  ): Promise<{ success: boolean; backupId?: string }> {
    // Implementazione Dropbox API
    if (!this.config.accessToken) {
      throw new Error('Token Dropbox non configurato');
    }

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/emmanuel_backups/${backupId}.backup`,
          mode: 'add',
          autorename: true
        })
      },
      body: data
    });

    if (response.ok) {
      return { success: true, backupId };
    } else {
      throw new Error(`Dropbox error: ${response.status}`);
    }
  }

  private async saveToGoogleDrive(
    backupId: string, 
    data: string, 
    metadata: BackupMetadata
  ): Promise<{ success: boolean; backupId?: string }> {
    // Implementazione Google Drive API
    if (!this.config.accessToken) {
      throw new Error('Token Google Drive non configurato');
    }

    // Per ora simula il salvataggio
    console.log('Salvando su Google Drive:', backupId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, backupId };
  }

  private async loadBackup(backupId: string): Promise<string | null> {
    try {
      switch (this.config.provider) {
        case 'local':
          return localStorage.getItem(`emmanuel_backup_${backupId}`);
        case 'dropbox':
          return await this.loadFromDropbox(backupId);
        case 'googledrive':
          return await this.loadFromGoogleDrive(backupId);
        default:
          return localStorage.getItem(`emmanuel_backup_${backupId}`);
      }
    } catch (error) {
      console.error('Errore caricamento backup:', error);
      return null;
    }
  }

  private async loadFromDropbox(backupId: string): Promise<string | null> {
    // Implementazione caricamento da Dropbox
    return null;
  }

  private async loadFromGoogleDrive(backupId: string): Promise<string | null> {
    // Implementazione caricamento da Google Drive
    return null;
  }

  private async deleteFromProvider(backupId: string): Promise<void> {
    switch (this.config.provider) {
      case 'local':
        localStorage.removeItem(`emmanuel_backup_${backupId}`);
        localStorage.removeItem(`emmanuel_backup_meta_${backupId}`);
        break;
      case 'dropbox':
        // Implementa eliminazione Dropbox
        break;
      case 'googledrive':
        // Implementa eliminazione Google Drive
        break;
    }
  }

  private async compressData(data: string): Promise<string> {
    // Implementazione compressione (per ora ritorna i dati così come sono)
    // In produzione useresti una libreria come pako per gzip
    return data;
  }

  private async decompressData(data: string): Promise<string> {
    // Implementazione decompressione
    return data;
  }

  private async encryptData(data: string): Promise<string> {
    // Implementazione crittografia (per ora ritorna i dati così come sono)
    // In produzione useresti Web Crypto API
    return data;
  }

  private async decryptData(data: string): Promise<string> {
    // Implementazione decrittografia
    return data;
  }

  private async calculateChecksum(data: string): Promise<string> {
    // Calcola hash SHA-256
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private isEncrypted(data: string): boolean {
    // Logica per determinare se i dati sono crittografati
    return false;
  }

  private isCompressed(data: string): boolean {
    // Logica per determinare se i dati sono compressi
    return false;
  }

  private saveBackupHistory(metadata: BackupMetadata): void {
    const history = this.getBackupHistory();
    history.push(metadata);
    localStorage.setItem('emmanuel_backup_history', JSON.stringify(history));
  }

  private saveRestoreHistory(metadata: BackupMetadata): void {
    const history = JSON.parse(localStorage.getItem('emmanuel_restore_history') || '[]');
    history.push({
      ...metadata,
      restoredAt: new Date().toISOString()
    });
    localStorage.setItem('emmanuel_restore_history', JSON.stringify(history));
  }

  private getBackupHistory(): BackupMetadata[] {
    return JSON.parse(localStorage.getItem('emmanuel_backup_history') || '[]');
  }

  private removeFromHistory(backupId: string): void {
    const history = this.getBackupHistory();
    const filtered = history.filter(h => h.id !== backupId);
    localStorage.setItem('emmanuel_backup_history', JSON.stringify(filtered));
  }

  private cleanupOldBackups(): void {
    const history = this.getBackupHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    const toDelete = history.filter(h => new Date(h.createdAt) < cutoffDate);
    
    toDelete.forEach(backup => {
      this.deleteBackup(backup.id);
    });
  }

  private async createAutoBackup(): Promise<void> {
    if (this.isBackupInProgress) return;

    console.log('🔄 Creazione backup automatico...');
    
    const result = await this.createBackup({
      name: `AutoBackup_${new Date().toISOString().split('T')[0]}`,
      compress: true,
      encrypt: !!this.config.encryptionKey
    });

    if (result.success) {
      console.log('✅ Backup automatico completato');
    } else {
      console.error('❌ Errore backup automatico:', result.error);
    }
  }

  // Metodi pubblici per configurazione
  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.autoBackup !== undefined) {
      this.initializeAutoBackup();
    }
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }

  isBackupRunning(): boolean {
    return this.isBackupInProgress;
  }
}

// Istanza singleton del servizio backup
let backupServiceInstance: BackupService | null = null;

export const getBackupService = (): BackupService => {
  if (!backupServiceInstance) {
    const defaultConfig: BackupConfig = {
      provider: 'local',
      autoBackup: false,
      backupInterval: 24, // 24 ore
      retentionDays: 30,
      compressionLevel: 6
    };
    backupServiceInstance = new BackupService(defaultConfig);
  }
  return backupServiceInstance;
};

export const initializeBackupService = (config: BackupConfig): BackupService => {
  backupServiceInstance = new BackupService(config);
  return backupServiceInstance;
};

export { BackupService, type BackupConfig, type BackupMetadata, type BackupData };