
interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_GITHUB_CLIENT_ID: string
  readonly VITE_GITHUB_CLIENT_SECRET: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  readonly VITE_GOOGLE_API_KEY: string
  readonly VITE_SHOPIFY_API_KEY: string
  readonly VITE_SHOPIFY_API_SECRET: string
  readonly VITE_SHOPIFY_STORE_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_NETLIFY_SITE_ID: string
  readonly VITE_NETLIFY_ACCESS_TOKEN: string
  readonly VITE_TANA_API_KEY: string
  readonly VITE_TANA_WORKSPACE_ID: string
  readonly VITE_N8N_WEBHOOK_URL: string
  readonly VITE_N8N_API_KEY: string
  readonly VITE_NEON_DATABASE_URL: string
  readonly VITE_NEON_API_KEY: string
  readonly VITE_PORTAINER_URL: string
  readonly VITE_PORTAINER_API_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
