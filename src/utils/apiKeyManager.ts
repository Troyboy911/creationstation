import CryptoJS from 'crypto-js';

export interface APIKeyData {
  service: string;
  key: string;
  encrypted: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
  environment?: string;
}

export interface APIKeyVault {
  keys: Record<string, APIKeyData>;
  metadata: {
    version: string;
    createdAt: Date;
    lastModified: Date;
    encryptionEnabled: boolean;
  };
}

export class UniversalAPIKeyManager {
  private static instance: UniversalAPIKeyManager;
  private vault: APIKeyVault;
  private encryptionKey: string | null = null;
  private readonly STORAGE_KEY = 'universal-api-vault';

  private constructor() {
    this.vault = this.loadVault();
  }

  public static getInstance(): UniversalAPIKeyManager {
    if (!UniversalAPIKeyManager.instance) {
      UniversalAPIKeyManager.instance = new UniversalAPIKeyManager();
    }
    return UniversalAPIKeyManager.instance;
  }

  private loadVault(): APIKeyVault {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load API key vault:', error);
    }

    return {
      keys: {},
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        lastModified: new Date(),
        encryptionEnabled: false,
      },
    };
  }

  private saveVault(): void {
    try {
      this.vault.metadata.lastModified = new Date();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vault));
    } catch (error) {
      console.error('Failed to save API key vault:', error);
      throw new Error('Failed to save API keys');
    }
  }

  public enableEncryption(password: string): void {
    this.encryptionKey = CryptoJS.SHA256(password).toString();
    this.vault.metadata.encryptionEnabled = true;
    
    Object.keys(this.vault.keys).forEach(service => {
      const keyData = this.vault.keys[service];
      if (!keyData.encrypted && keyData.key) {
        keyData.key = CryptoJS.AES.encrypt(keyData.key, this.encryptionKey!).toString();
        keyData.encrypted = true;
      }
    });

    this.saveVault();
  }

  public disableEncryption(password: string): boolean {
    const testKey = CryptoJS.SHA256(password).toString();
    
    try {
      Object.keys(this.vault.keys).forEach(service => {
        const keyData = this.vault.keys[service];
        if (keyData.encrypted && keyData.key) {
          const decrypted = CryptoJS.AES.decrypt(keyData.key, testKey).toString(CryptoJS.enc.Utf8);
          if (!decrypted) throw new Error('Invalid password');
          keyData.key = decrypted;
          keyData.encrypted = false;
        }
      });

      this.encryptionKey = null;
      this.vault.metadata.encryptionEnabled = false;
      this.saveVault();
      return true;
    } catch (error) {
      return false;
    }
  }

  public setAPIKey(service: string, key: string, environment: string = 'default'): void {
    let processedKey = key;
    
    if (this.vault.metadata.encryptionEnabled && this.encryptionKey) {
      processedKey = CryptoJS.AES.encrypt(key, this.encryptionKey).toString();
    }

    this.vault.keys[service] = {
      service,
      key: processedKey,
      encrypted: this.vault.metadata.encryptionEnabled,
      lastUsed: new Date(),
      environment,
    };

    this.saveVault();
  }

  public getAPIKey(service: string): string | null {
    const keyData = this.vault.keys[service];
    if (!keyData || !keyData.key) return null;

    if (keyData.encrypted && this.encryptionKey) {
      try {
        const decrypted = CryptoJS.AES.decrypt(keyData.key, this.encryptionKey).toString(CryptoJS.enc.Utf8);
        keyData.lastUsed = new Date();
        this.saveVault();
        return decrypted;
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        return null;
      }
    }

    keyData.lastUsed = new Date();
    this.saveVault();
    return keyData.key;
  }

  public getAllKeys(): Record<string, string> {
    const result: Record<string, string> = {};
    
    Object.keys(this.vault.keys).forEach(service => {
      const key = this.getAPIKey(service);
      if (key) {
        result[service] = key;
      }
    });

    return result;
  }

  public removeAPIKey(service: string): void {
    delete this.vault.keys[service];
    this.saveVault();
  }

  public exportVault(): string {
    return JSON.stringify(this.vault, null, 2);
  }

  public importVault(vaultData: string): boolean {
    try {
      const imported = JSON.parse(vaultData) as APIKeyVault;
      
      if (!imported.keys || !imported.metadata) {
        throw new Error('Invalid vault format');
      }

      this.vault = imported;
      this.saveVault();
      return true;
    } catch (error) {
      console.error('Failed to import vault:', error);
      return false;
    }
  }

  public generateEnvFile(): string {
    const keys = this.getAllKeys();
    const envLines: string[] = [];

    envLines.push('# Universal API Key Management System');
    envLines.push(`# Generated on ${new Date().toISOString()}`);
    envLines.push('');

    const serviceMapping: Record<string, string> = {
      openai: 'OPENAI_API_KEY',
      firebase: 'FIREBASE_API_KEY',
      googleClientId: 'GOOGLE_CLIENT_ID',
      googleClientSecret: 'GOOGLE_CLIENT_SECRET',
      github: 'GITHUB_TOKEN',
      netlify: 'NETLIFY_AUTH_TOKEN',
      stripe: 'STRIPE_SECRET_KEY',
      metricool: 'METRICOOL_TOKEN',
      supabaseUrl: 'SUPABASE_URL',
      supabaseKey: 'SUPABASE_KEY',
      neonDbUrl: 'NEON_DB_URL',
      neonDbKey: 'NEON_DB_KEY',
      facebookAppId: 'FACEBOOK_APP_ID',
      facebookAppSecret: 'FACEBOOK_APP_SECRET',
      shopifyApiKey: 'SHOPIFY_API_KEY',
      shopifyApiSecret: 'SHOPIFY_API_SECRET',
      amazonAssociateTag: 'AMAZON_ASSOCIATE_TAG',
      amazonApiKey: 'AMAZON_API_KEY',
      amazonSecret: 'AMAZON_SECRET',
      youtube: 'YOUTUBE_API_KEY',
      printify: 'PRINTIFY_API_KEY',
    };

    Object.entries(keys).forEach(([service, key]) => {
      const envVar = serviceMapping[service] || service.toUpperCase() + '_API_KEY';
      if (key && key.trim()) {
        envLines.push(`${envVar}=${key}`);
      }
    });

    return envLines.join('\n');
  }

  public detectMissingKeys(envExampleContent: string): string[] {
    const missing: string[] = [];
    const lines = envExampleContent.split('\n');
    const keys = this.getAllKeys();

    const reverseMapping: Record<string, string> = {
      'OPENAI_API_KEY': 'openai',
      'FIREBASE_API_KEY': 'firebase',
      'GOOGLE_CLIENT_ID': 'googleClientId',
      'GOOGLE_CLIENT_SECRET': 'googleClientSecret',
      'GITHUB_TOKEN': 'github',
      'NETLIFY_AUTH_TOKEN': 'netlify',
      'STRIPE_SECRET_KEY': 'stripe',
      'METRICOOL_TOKEN': 'metricool',
      'SUPABASE_URL': 'supabaseUrl',
      'SUPABASE_KEY': 'supabaseKey',
      'NEON_DB_URL': 'neonDbUrl',
      'NEON_DB_KEY': 'neonDbKey',
      'FACEBOOK_APP_ID': 'facebookAppId',
      'FACEBOOK_APP_SECRET': 'facebookAppSecret',
      'SHOPIFY_API_KEY': 'shopifyApiKey',
      'SHOPIFY_API_SECRET': 'shopifyApiSecret',
      'AMAZON_ASSOCIATE_TAG': 'amazonAssociateTag',
      'AMAZON_API_KEY': 'amazonApiKey',
      'AMAZON_SECRET': 'amazonSecret',
      'YOUTUBE_API_KEY': 'youtube',
      'PRINTIFY_API_KEY': 'printify',
    };

    lines.forEach(line => {
      const match = line.match(/^([A-Z_]+)=/);
      if (match) {
        const envVar = match[1];
        const service = reverseMapping[envVar];
        if (service && (!keys[service] || !keys[service].trim())) {
          missing.push(envVar);
        }
      }
    });

    return missing;
  }

  public getVaultStats() {
    const totalKeys = Object.keys(this.vault.keys).length;
    const activeKeys = Object.values(this.vault.keys).filter(k => k.key && k.key.trim()).length;
    const encryptedKeys = Object.values(this.vault.keys).filter(k => k.encrypted).length;

    return {
      totalKeys,
      activeKeys,
      encryptedKeys,
      encryptionEnabled: this.vault.metadata.encryptionEnabled,
      lastModified: this.vault.metadata.lastModified,
    };
  }
}
