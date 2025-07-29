class ApiService {
  private baseUrl = '/api';

  async post(endpoint: string, data?: any) {
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
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
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
}

export const apiService = new ApiService();
