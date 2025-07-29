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
  path?: string;
  position: { x: number; y: number };
  metadata?: Record<string, unknown>;
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

export interface Product {
  id: string | number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  status?: 'active' | 'inactive' | 'draft';
}

export interface DockerOptions {
  image?: string;
  tag?: string;
  ports?: string[];
  volumes?: string[];
  environment?: Record<string, string>;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  url?: string;
  imageId?: string;
  commitId?: string;
  backupId?: string;
  downloadUrl?: string;
  syncedItems?: number;
  urls?: string[];
  products?: unknown[];
  recipients?: number;
  campaignId?: string;
  messageId?: string;
  result?: unknown;
  status?: string;
  logs?: string[];
  files?: FileItem[];
  content?: string;
  path?: string;
  projectId?: string;
  branches?: unknown[];
  tables?: unknown[];
  schemas?: unknown[];
  rows?: unknown[];
  query?: string;
  execution_time?: number;
  imageUrl?: string;
  videoUrl?: string;
  prompt?: string;
  project?: Project;
  repoUrl?: string;
  authUrl?: string;
  executionId?: string;
  duration?: string;
}

export interface MCPArgs {
  [key: string]: unknown;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface ProjectData {
  project?: {
    name?: string;
  };
}

export interface RepoData {
  repoUrl?: string;
}

export interface PromptData {
  prompt?: string;
}

export interface PathData {
  path?: string;
}
