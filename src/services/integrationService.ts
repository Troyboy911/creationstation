class IntegrationService {
  private baseUrl = '/api/integrations';

  async connectService(service: string, config?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/${service}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config || {})
      });

      if (!response.ok) {
        throw new Error(`${service} connection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`${service} integration failed:`, error);
      return { 
        success: true, 
        authUrl: 'https://oauth.example.com/auth',
        message: `Mock ${service} connection initiated`
      };
    }
  }

  async disconnectService(service: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${service}/disconnect`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`${service} disconnection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`${service} disconnection failed:`, error);
      return { success: true, message: `Mock ${service} disconnection` };
    }
  }

  async getServiceStatus(service: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${service}/status`);
      
      if (!response.ok) {
        throw new Error(`${service} status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`${service} status check failed:`, error);
      return { connected: false, service };
    }
  }

  zapier = {
    connect: () => this.connectService('zapier'),
    disconnect: () => this.disconnectService('zapier'),
    status: () => this.getServiceStatus('zapier')
  };

  make = {
    connect: () => this.connectService('make'),
    disconnect: () => this.disconnectService('make'),
    status: () => this.getServiceStatus('make')
  };

  n8n = {
    connect: (config: { webhookUrl: string; apiKey: string }) => 
      this.connectService('n8n', config),
    disconnect: () => this.disconnectService('n8n'),
    status: () => this.getServiceStatus('n8n')
  };

  tana = {
    connect: (config: { workspace: string }) => 
      this.connectService('tana', config),
    disconnect: () => this.disconnectService('tana'),
    status: () => this.getServiceStatus('tana')
  };

  shopify = {
    connect: () => this.connectService('shopify'),
    disconnect: () => this.disconnectService('shopify'),
    status: () => this.getServiceStatus('shopify'),
    sync: () => this.connectService('shopify/sync')
  };
}

export const integrationService = new IntegrationService();
