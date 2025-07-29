interface EnvironmentConfig {
  openai: {
    apiKey: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  github: {
    token: string;
    clientId: string;
    clientSecret: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    apiKey: string;
  };
  shopify: {
    apiKey: string;
    apiSecret: string;
    storeUrl: string;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
  };
  netlify: {
    siteId: string;
    accessToken: string;
  };
  tana: {
    apiKey: string;
    workspaceId: string;
  };
  n8n: {
    webhookUrl: string;
    apiKey: string;
  };
  neon: {
    databaseUrl: string;
    apiKey: string;
  };
  portainer: {
    url: string;
    apiKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: string;
  };
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key as keyof ImportMetaEnv] || defaultValue;
};

export const environment: EnvironmentConfig = {
  openai: {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  },
  firebase: {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  },
  github: {
    token: getEnvVar('VITE_GITHUB_TOKEN'),
    clientId: getEnvVar('VITE_GITHUB_CLIENT_ID'),
    clientSecret: getEnvVar('VITE_GITHUB_CLIENT_SECRET'),
  },
  google: {
    clientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
    clientSecret: getEnvVar('VITE_GOOGLE_CLIENT_SECRET'),
    apiKey: getEnvVar('VITE_GOOGLE_API_KEY'),
  },
  shopify: {
    apiKey: getEnvVar('VITE_SHOPIFY_API_KEY'),
    apiSecret: getEnvVar('VITE_SHOPIFY_API_SECRET'),
    storeUrl: getEnvVar('VITE_SHOPIFY_STORE_URL'),
  },
  stripe: {
    publishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),
    secretKey: getEnvVar('VITE_STRIPE_SECRET_KEY'),
  },
  netlify: {
    siteId: getEnvVar('VITE_NETLIFY_SITE_ID'),
    accessToken: getEnvVar('VITE_NETLIFY_ACCESS_TOKEN'),
  },
  tana: {
    apiKey: getEnvVar('VITE_TANA_API_KEY'),
    workspaceId: getEnvVar('VITE_TANA_WORKSPACE_ID'),
  },
  n8n: {
    webhookUrl: getEnvVar('VITE_N8N_WEBHOOK_URL'),
    apiKey: getEnvVar('VITE_N8N_API_KEY'),
  },
  neon: {
    databaseUrl: getEnvVar('VITE_NEON_DATABASE_URL'),
    apiKey: getEnvVar('VITE_NEON_API_KEY'),
  },
  portainer: {
    url: getEnvVar('VITE_PORTAINER_URL'),
    apiKey: getEnvVar('VITE_PORTAINER_API_KEY'),
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'CreationStation-GitHubEdition'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    environment: getEnvVar('VITE_ENVIRONMENT', 'development'),
  },
};

export const validateEnvironment = (): { isValid: boolean; missingKeys: string[] } => {
  const requiredKeys = [
    'VITE_OPENAI_API_KEY',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_GITHUB_TOKEN',
    'VITE_GOOGLE_CLIENT_ID',
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key as keyof ImportMetaEnv]);
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
};
