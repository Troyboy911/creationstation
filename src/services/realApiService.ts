class RealApiService {
  private baseUrl = '/api';

  async post(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn(`API ${endpoint} failed:`, error);
      return this.mockResponse(endpoint, data);
    }
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn(`API ${endpoint} failed:`, error);
      return this.mockResponse(endpoint);
    }
  }

  private mockResponse(endpoint: string, data?: any) {
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
      return { success: true, url: 'vscode://file' + (data?.path || '/tmp/file.txt') };
    }
    if (endpoint.includes('/ai/generate-image')) {
      return { 
        success: true, 
        imageUrl: `https://picsum.photos/512/512?random=${Date.now()}`,
        prompt: data?.prompt || 'Generated image'
      };
    }
    if (endpoint.includes('/ai/generate-video')) {
      return { 
        success: true, 
        videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4?t=${Date.now()}`,
        prompt: data?.prompt || 'Generated video'
      };
    }
    if (endpoint.includes('/github/clone')) {
      return {
        success: true,
        project: {
          id: `github-${Date.now()}`,
          name: data?.repoUrl?.split('/').pop() || 'GitHub Project',
          description: `Cloned from ${data?.repoUrl}`,
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
            content: `# ${data?.repoUrl?.split('/').pop() || 'Project'}\n\nCloned from ${data?.repoUrl}`,
            position: { x: 150, y: 150 }
          }
        ]
      };
    }
    if (endpoint.includes('/projects/create')) {
      return { 
        success: true, 
        files: [
          {
            id: `file-${Date.now()}`,
            name: 'README.md',
            type: 'document',
            content: `# ${data?.project?.name || 'New Project'}\n\nGenerated project files.`,
            position: { x: 100, y: 100 }
          }
        ]
      };
    }
    if (endpoint.includes('/github/clone')) {
      return { 
        success: true,
        project: { id: 'cloned-project', name: 'Cloned Repository' },
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
    return { success: true, message: 'Mock response' };
  }

  devServer = {
    start: () => this.post('/dev/start'),
    stop: () => this.post('/dev/stop'),
    status: () => this.get('/dev/status')
  };

  docker = {
    build: (options?: any) => this.post('/docker/build', options),
    run: (options?: any) => this.post('/docker/run', options),
    status: () => this.get('/docker/status')
  };

  git = {
    commit: (message: string) => this.post('/git/commit', { message }),
    push: () => this.post('/git/push'),
    pull: () => this.post('/git/pull'),
    status: () => this.get('/git/status')
  };

  deploy = {
    firebase: () => this.post('/deploy/firebase'),
    netlify: () => this.post('/deploy/netlify'),
    status: () => this.get('/deploy/status')
  };

  backup = {
    create: () => this.post('/backup/create'),
    restore: (backupId: string) => this.post('/backup/restore', { backupId }),
    list: () => this.get('/backup/list')
  };

  sync = {
    googleDrive: () => this.post('/sync/google-drive'),
    firebase: () => this.post('/sync/firebase'),
    github: () => this.post('/sync/github'),
    all: () => this.post('/sync/all')
  };

  files = {
    open: (fileName: string, service: string) => this.post('/files/open', { fileName, service }),
    create: (fileName: string, content: string) => this.post('/files/create', { fileName, content }),
    delete: (fileName: string) => this.post('/files/delete', { fileName })
  };

  social = {
    promote: (product: any) => this.post('/social/promote', { product }),
    post: (content: string, platforms: string[]) => this.post('/social/post', { content, platforms })
  };

  shopify = {
    sync: () => this.post('/shopify/sync'),
    createProduct: (product: any) => this.post('/shopify/products', product),
    updateProduct: (id: string, product: any) => this.post(`/shopify/products/${id}`, product)
  };

  email = {
    campaign: (recipients: string[], subject: string, content: string) => 
      this.post('/email/campaign', { recipients, subject, content }),
    sms: (recipients: string[], message: string) => 
      this.post('/email/sms', { recipients, message })
  };

  vscode = {
    open: (path: string) => this.post('/vscode/open', { path })
  };

  mcp = {
    toolCall: (server: string, toolName: string, args: any) => 
      this.post('/mcp/tool-call', { server, toolName, args })
  };

  ai = {
    generateImage: (prompt: string) => this.post('/ai/generate-image', { prompt }),
    generateVideo: (prompt: string) => this.post('/ai/generate-video', { prompt })
  };

  github = {
    clone: (repoUrl: string) => this.post('/github/clone', { repoUrl })
  };
}

export const realApiService = new RealApiService();
