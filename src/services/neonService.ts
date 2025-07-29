import { environment } from '../config/environment';
import { FileItem } from '../types';

interface NeonConfig {
  connectionString: string;
  apiKey: string;
}

interface NeonProject {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModified: Date;
  template?: string;
  files?: FileItem[];
  settings?: Record<string, unknown>;
}


class NeonService {
  private config: NeonConfig;

  constructor() {
    this.config = {
      connectionString: environment.neon.databaseUrl,
      apiKey: environment.neon.apiKey,
    };
  }

  async saveProject(project: NeonProject): Promise<void> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Neon API key not configured');
      }

      const response = await fetch('/api/neon/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`Failed to save project: ${response.statusText}`);
      }

      localStorage.setItem(`neon-project-${project.id}`, JSON.stringify(project));
    } catch (error) {
      console.warn('Neon save failed, using localStorage fallback:', error);
      const savedProjects = JSON.parse(localStorage.getItem('creation-station-projects') || '[]');
      const existingIndex = savedProjects.findIndex((p: NeonProject) => p.id === project.id);
      
      if (existingIndex >= 0) {
        savedProjects[existingIndex] = project;
      } else {
        savedProjects.push(project);
      }
      
      localStorage.setItem('creation-station-projects', JSON.stringify(savedProjects));
    }
  }

  async loadProjects(): Promise<NeonProject[]> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Neon API key not configured');
      }

      const response = await fetch('/api/neon/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Neon load failed, using localStorage fallback:', error);
      const savedProjects = localStorage.getItem('creation-station-projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    }
  }

  async saveSettings(settings: Record<string, unknown>): Promise<void> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Neon API key not configured');
      }

      const response = await fetch('/api/neon/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }

      localStorage.setItem('creation-station-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Neon settings save failed, using localStorage fallback:', error);
      localStorage.setItem('creation-station-settings', JSON.stringify(settings));
    }
  }

  async loadSettings(): Promise<Record<string, unknown> | null> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Neon API key not configured');
      }

      const response = await fetch('/api/neon/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Neon settings load failed, using localStorage fallback:', error);
      const savedSettings = localStorage.getItem('creation-station-settings');
      return savedSettings ? JSON.parse(savedSettings) : null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await fetch('/api/mcp/tool-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: 'neon',
          toolName: 'list_projects',
          args: {}
        })
      });
      
      if (result.ok) {
        return true;
      }
    } catch (error) {
      console.warn('Neon MCP connection test failed:', error);
    }

    try {
      if (!this.config.apiKey) {
        return false;
      }

      const response = await fetch('/api/neon/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.warn('Neon API connection test failed:', error);
      return false;
    }
  }

  async saveProjectWithMCP(project: NeonProject): Promise<void> {
    try {
      const result = await fetch('/api/mcp/tool-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: 'neon',
          toolName: 'create_project',
          args: { project }
        })
      });
      
      if (result.ok) {
        localStorage.setItem(`neon-project-${project.id}`, JSON.stringify(project));
        return;
      }
    } catch (error) {
      console.warn('Neon MCP save failed:', error);
    }
    
    await this.saveProject(project);
  }

  async loadProjectsWithMCP(): Promise<NeonProject[]> {
    try {
      const result = await fetch('/api/mcp/tool-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: 'neon',
          toolName: 'list_projects',
          args: {}
        })
      });
      
      if (result.ok) {
        const data = await result.json();
        return data.projects || [];
      }
    } catch (error) {
      console.warn('Neon MCP load failed:', error);
    }
    
    return await this.loadProjects();
  }
}

export const neonService = new NeonService();
export default neonService;
