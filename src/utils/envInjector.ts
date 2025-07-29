import { UniversalAPIKeyManager } from './apiKeyManager';

export interface EnvFileData {
  content: string;
  missingKeys: string[];
  recommendedKeys: string[];
}

export class EnvironmentInjector {
  private keyManager: UniversalAPIKeyManager;

  constructor() {
    this.keyManager = UniversalAPIKeyManager.getInstance();
  }

  public analyzeEnvExample(envExampleContent: string): EnvFileData {
    const missingKeys = this.keyManager.detectMissingKeys(envExampleContent);
    const recommendedKeys = [
      'OPENAI_API_KEY',
      'FIREBASE_API_KEY', 
      'SUPABASE_URL',
      'SUPABASE_KEY',
      'GITHUB_TOKEN'
    ];

    return {
      content: envExampleContent,
      missingKeys,
      recommendedKeys,
    };
  }

  public generateEnvFromExample(envExampleContent: string): string {
    const lines = envExampleContent.split('\n');
    const keys = this.keyManager.getAllKeys();
    const result: string[] = [];

    const serviceMapping: Record<string, string> = {
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
      if (line.startsWith('#') || line.trim() === '') {
        result.push(line);
      } else {
        const match = line.match(/^([A-Z_]+)=/);
        if (match) {
          const envVar = match[1];
          const service = serviceMapping[envVar];
          const key = service ? keys[service] : '';
          
          if (key && key.trim()) {
            result.push(`${envVar}=${key}`);
          } else {
            result.push(`${envVar}=`);
          }
        } else {
          result.push(line);
        }
      }
    });

    return result.join('\n');
  }

  public downloadEnvFile(content: string, filename: string = '.env'): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public copyToClipboard(content: string): Promise<boolean> {
    return navigator.clipboard.writeText(content)
      .then(() => true)
      .catch(() => false);
  }

  public generateProjectReport(envData: EnvFileData): string {
    const lines: string[] = [];
    
    lines.push('🔍 Environment Analysis Report');
    lines.push('='.repeat(35));
    
    if (envData.missingKeys.length > 0) {
      lines.push('\n🚨 Missing API Keys:');
      envData.missingKeys.forEach(key => lines.push(`  - ${key}`));
    } else {
      lines.push('\n✅ All required API keys are available');
    }
    
    if (envData.recommendedKeys.length > 0) {
      lines.push('\n💡 Recommended API Keys for this project:');
      envData.recommendedKeys.forEach(key => lines.push(`  - ${key}`));
    }

    return lines.join('\n');
  }
}
