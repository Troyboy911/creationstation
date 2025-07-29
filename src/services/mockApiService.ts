import { APIResponse, ProjectData, RepoData, PromptData, PathData } from '../types';

class MockApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<APIResponse<T>> {
    await this.delay(500);
    return this.mockResponse(endpoint, data) as APIResponse<T>;
  }

  async get(endpoint: string) {
    await this.delay(300);
    return this.mockResponse(endpoint);
  }

  private mockResponse(endpoint: string, data?: unknown): APIResponse {
    if (endpoint.includes('/dev/start')) {
      return { success: true, url: 'http://localhost:3000' };
    }
    if (endpoint.includes('/docker/build')) {
      return { success: true, imageId: 'mock-image-id' };
    }
    if (endpoint.includes('/git/commit')) {
      return { success: true, commitId: 'mock-commit-id' };
    }
    if (endpoint.includes('/deploy/firebase')) {
      return { success: true, url: 'https://mock-firebase-app.web.app' };
    }
    if (endpoint.includes('/backup/create')) {
      return { success: true, backupId: 'mock-backup-id', downloadUrl: '#' };
    }
    if (endpoint.includes('/sync/')) {
      return { success: true, syncedItems: 42 };
    }
    if (endpoint.includes('/files/open')) {
      return { success: true, url: '#' };
    }
    if (endpoint.includes('/social/promote')) {
      return { success: true, urls: ['https://facebook.com', 'https://twitter.com'] };
    }
    if (endpoint.includes('/shopify/sync')) {
      return { success: true, products: [] };
    }
    if (endpoint.includes('/email/campaign')) {
      return { success: true, recipients: 1247 };
    }
    if (endpoint.includes('/email/sms')) {
      return { success: true, recipients: 856 };
    }
    if (endpoint.includes('/ai/generate-image')) {
      return { success: true, imageUrl: 'https://picsum.photos/400/300?random=' + Date.now() };
    }
    if (endpoint.includes('/ai/generate-video')) {
      return { success: true, videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4' };
    }
    if (endpoint.includes('/vscode/open')) {
      return { success: true, url: 'vscode://file' + ((data as PathData)?.path || '/tmp/file.txt') };
    }
    if (endpoint.includes('/projects/create')) {
      return { 
        success: true, 
        files: [
          {
            id: `file-${Date.now()}`,
            name: 'README.md',
            type: 'document',
            content: `# ${(data as ProjectData)?.project?.name || 'New Project'}\n\nGenerated project files.`,
            position: { x: 100, y: 100 }
          }
        ]
      };
    }
    if (endpoint.includes('/github/clone')) {
      return { 
        success: true,
        project: { 
          id: 'cloned-project', 
          name: 'Cloned Repository',
          lastModified: new Date(),
          createdAt: new Date()
        },
        files: [
          {
            id: `file-${Date.now()}`,
            name: 'index.js',
            type: 'code',
            content: 'console.log("Hello from cloned repo");',
            position: { x: 150, y: 150 }
          }
        ]
      };
    }
    if (endpoint.includes('/integrations/')) {
      return { 
        success: true, 
        authUrl: 'https://oauth.example.com/auth',
        message: 'Integration connection initiated'
      };
    }
    if (endpoint.includes('/mcp/tool-call')) {
      return { success: true, result: 'MCP tool executed successfully' };
    }
    if (endpoint.includes('/workflows/')) {
      return { success: true, executionId: 'workflow-' + Date.now() };
    }
    if (endpoint.includes('/automations/run')) {
      return { success: true, status: 'completed', duration: '2.3s' };
    }
    if (endpoint.includes('/customers/export')) {
      return { success: true, data: new Blob(['name,email,orders\nJohn Doe,john@example.com,5'], { type: 'text/csv' }) };
    }
    if (endpoint.includes('/knowledge/export')) {
      return { success: true, data: new Blob(['# Knowledge Base\n\nExported notes and documentation.'], { type: 'text/markdown' }) };
    }
    if (endpoint.includes('/products/import')) {
      return { 
        success: true, 
        products: [
          { id: Date.now() + 1, name: 'Imported Product 1', price: 49.99, stock: 100, sales: 0 },
          { id: Date.now() + 2, name: 'Imported Product 2', price: 79.99, stock: 50, sales: 0 }
        ]
      };
    }
    if (endpoint.includes('/vscode/open')) {
      return { success: true, url: 'vscode://file' + ((data as PathData)?.path || '/tmp/file.txt') };
    }
    if (endpoint.includes('/ai/generate-image')) {
      return { 
        success: true, 
        imageUrl: `https://picsum.photos/512/512?random=${Date.now()}`,
        prompt: (data as PromptData)?.prompt || 'Generated image'
      };
    }
    if (endpoint.includes('/ai/generate-video')) {
      return { 
        success: true, 
        videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4?t=${Date.now()}`,
        prompt: (data as PromptData)?.prompt || 'Generated video'
      };
    }
    if (endpoint.includes('/github/clone')) {
      return {
        success: true,
        project: {
          id: `github-${Date.now()}`,
          name: (data as RepoData)?.repoUrl?.split('/').pop() || 'GitHub Project',
          description: `Cloned from ${(data as RepoData)?.repoUrl}`,
          type: 'react',
          lastModified: new Date(),
          createdAt: new Date(),
          status: 'active'
        },
        files: [
          {
            id: `readme-${Date.now()}`,
            name: 'README.md',
            type: 'document',
            content: `# ${(data as RepoData)?.repoUrl?.split('/').pop() || 'Project'}\n\nCloned from ${(data as RepoData)?.repoUrl}`,
            position: { x: 150, y: 150 }
          }
        ]
      };
    }
    return { success: true, message: 'Mock response' };
  }
}

export const mockApiService = new MockApiService();
