#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UniversalAPIKeysCLI {
  constructor() {
    this.vaultPath = path.join(process.env.HOME || process.cwd(), '.universal-api-vault.json');
    this.vault = this.loadVault();
  }

  loadVault() {
    try {
      if (fs.existsSync(this.vaultPath)) {
        const data = fs.readFileSync(this.vaultPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load API key vault:', error.message);
    }

    return {
      keys: {},
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        encryptionEnabled: false,
      },
    };
  }

  saveVault() {
    try {
      this.vault.metadata.lastModified = new Date().toISOString();
      fs.writeFileSync(this.vaultPath, JSON.stringify(this.vault, null, 2));
      console.log('✅ Vault saved successfully');
    } catch (error) {
      console.error('❌ Failed to save vault:', error.message);
      process.exit(1);
    }
  }

  async promptForInput(question, isPassword = false) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      if (isPassword) {
        rl.stdoutMuted = true;
        rl._writeToOutput = function _writeToOutput(stringToWrite) {
          if (rl.stdoutMuted) rl.output.write('*');
          else rl.output.write(stringToWrite);
        };
      }

      rl.question(question, (answer) => {
        rl.close();
        if (isPassword) console.log('');
        resolve(answer);
      });
    });
  }

  async addKey(service, key) {
    if (!service) {
      service = await this.promptForInput('Enter service name: ');
    }
    
    if (!key) {
      key = await this.promptForInput(`Enter API key for ${service}: `, true);
    }

    this.vault.keys[service] = {
      service,
      key,
      encrypted: false,
      lastUsed: new Date().toISOString(),
      environment: 'default',
    };

    this.saveVault();
    console.log(`✅ Added API key for ${service}`);
  }

  listKeys() {
    const keys = Object.keys(this.vault.keys);
    
    if (keys.length === 0) {
      console.log('📭 No API keys stored in vault');
      return;
    }

    console.log('\n🔑 Stored API Keys:');
    console.log('==================');
    
    keys.forEach(service => {
      const keyData = this.vault.keys[service];
      const maskedKey = keyData.key ? `${keyData.key.substring(0, 8)}...` : 'Not set';
      const status = keyData.encrypted ? '🔒' : '🔓';
      console.log(`${status} ${service}: ${maskedKey}`);
    });

    console.log(`\nTotal: ${keys.length} keys`);
  }

  removeKey(service) {
    if (!this.vault.keys[service]) {
      console.log(`❌ No API key found for service: ${service}`);
      return;
    }

    delete this.vault.keys[service];
    this.saveVault();
    console.log(`✅ Removed API key for ${service}`);
  }

  generateEnvFile(outputPath = '.env') {
    const keys = this.vault.keys;
    const envLines = [];

    envLines.push('# Universal API Key Management System');
    envLines.push(`# Generated on ${new Date().toISOString()}`);
    envLines.push('');

    const serviceMapping = {
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

    Object.entries(keys).forEach(([service, keyData]) => {
      const envVar = serviceMapping[service] || service.toUpperCase() + '_API_KEY';
      if (keyData.key && keyData.key.trim()) {
        envLines.push(`${envVar}=${keyData.key}`);
      }
    });

    const envContent = envLines.join('\n');
    fs.writeFileSync(outputPath, envContent);
    console.log(`✅ Generated .env file: ${outputPath}`);
  }

  exportVault(outputPath) {
    if (!outputPath) {
      outputPath = `api-vault-backup-${Date.now()}.json`;
    }

    fs.writeFileSync(outputPath, JSON.stringify(this.vault, null, 2));
    console.log(`✅ Vault exported to: ${outputPath}`);
  }

  importVault(inputPath) {
    try {
      const importedData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      
      if (!importedData.keys || !importedData.metadata) {
        throw new Error('Invalid vault format');
      }

      this.vault = importedData;
      this.saveVault();
      console.log(`✅ Vault imported from: ${inputPath}`);
    } catch (error) {
      console.error(`❌ Failed to import vault: ${error.message}`);
      process.exit(1);
    }
  }

  showStats() {
    const totalKeys = Object.keys(this.vault.keys).length;
    const activeKeys = Object.values(this.vault.keys).filter(k => k.key && k.key.trim()).length;
    const encryptedKeys = Object.values(this.vault.keys).filter(k => k.encrypted).length;

    console.log('\n📊 Vault Statistics:');
    console.log('====================');
    console.log(`Total Keys: ${totalKeys}`);
    console.log(`Active Keys: ${activeKeys}`);
    console.log(`Encrypted Keys: ${encryptedKeys}`);
    console.log(`Encryption: ${this.vault.metadata.encryptionEnabled ? '🔒 Enabled' : '🔓 Disabled'}`);
    console.log(`Last Modified: ${this.vault.metadata.lastModified}`);
  }

  showHelp() {
    console.log(`
🔑 Universal API Key Management CLI

Usage: node apiKeysCli.js <command> [options]

Commands:
  add <service> [key]     Add an API key for a service
  list                    List all stored API keys
  remove <service>        Remove an API key
  generate [path]         Generate .env file (default: .env)
  export [path]           Export vault backup
  import <path>           Import vault backup
  stats                   Show vault statistics
  help                    Show this help message

Examples:
  node apiKeysCli.js add openai sk-1234567890
  node apiKeysCli.js list
  node apiKeysCli.js generate .env
  node apiKeysCli.js export backup.json
  node apiKeysCli.js stats
    `);
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'add':
        await this.addKey(args[1], args[2]);
        break;
      case 'list':
        this.listKeys();
        break;
      case 'remove':
        if (!args[1]) {
          console.log('❌ Please specify a service name');
          process.exit(1);
        }
        this.removeKey(args[1]);
        break;
      case 'generate':
        this.generateEnvFile(args[1]);
        break;
      case 'export':
        this.exportVault(args[1]);
        break;
      case 'import':
        if (!args[1]) {
          console.log('❌ Please specify a file path');
          process.exit(1);
        }
        this.importVault(args[1]);
        break;
      case 'stats':
        this.showStats();
        break;
      case 'help':
      default:
        this.showHelp();
        break;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new UniversalAPIKeysCLI();
  cli.run().catch(console.error);
}

export default UniversalAPIKeysCLI;
