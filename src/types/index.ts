export interface Project {
  id: string;
  name: string;
  description?: string;
  type?: 'react' | 'vue' | 'flutter' | 'shopify' | 'blank';
  template?: string;
  lastModified: Date;
  createdAt?: Date;
  status?: 'active' | 'paused' | 'completed';
  files?: FileItem[];
  settings?: Record<string, unknown>;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'code' | 'image' | 'video' | 'document' | 'data';
  content?: string;
  url?: string;
  size?: number;
  position: { x: number; y: number };
}

export interface AutomationRecipe {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'development' | 'ecommerce' | 'marketing' | 'content' | 'deployment';
  steps: string[];
}

export interface APIConnection {
  service: string;
  status: 'connected' | 'disconnected' | 'error';
  scopes: string[];
  lastUsed?: Date;
}

export interface Panel {
  id: string;
  title: string;
  category: 'ai-code' | 'cloud-storage' | 'dev-tools' | 'no-code' | 'ecommerce' | 'knowledge';
  isOpen: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
