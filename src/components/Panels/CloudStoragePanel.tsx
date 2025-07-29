import { Folder, FileText, Database, RefreshCw, ExternalLink } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export function CloudStoragePanel() {
  const { dispatch } = useWorkspace();
  
  const cloudServices = [
    { name: 'Google Drive', icon: '📂', status: 'connected', files: 247 },
    { name: 'Firebase', icon: '🔥', status: 'connected', projects: 3 },
    { name: 'GitHub', icon: '🐙', status: 'connected', repos: 12 },
    { name: 'Dropbox', icon: '📦', status: 'disconnected', files: 0 },
  ];

  const recentFiles = [
    { name: 'Project Proposal.docx', type: 'document', service: 'Google Drive', modified: '2 hours ago' },
    { name: 'Design Assets', type: 'folder', service: 'Google Drive', modified: '1 day ago' },
    { name: 'database-schema.sql', type: 'code', service: 'Firebase', modified: '3 hours ago' },
  ];

  const uploadFiles = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    if (type === 'images') {
      input.accept = 'image/*';
    }
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach((file, index) => {
        const newFile = {
          id: `upload-${Date.now()}-${index}`,
          name: file.name,
          type: type === 'images' ? 'image' as const : 'document' as const,
          size: file.size,
          position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
        };
        dispatch({ type: 'ADD_FILE', payload: newFile });
      });
    };
    
    input.click();
  };

  const createBackup = async () => {
    try {
      const response = await fetch('/api/backup/create', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        console.log('Backup created successfully:', result);
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
        }
      } else {
        throw new Error('Backup creation failed');
      }
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const uploadDatabase = async () => {
    try {
      const response = await fetch('/api/backup/database', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        console.log('Database backup uploaded successfully:', result);
      } else {
        throw new Error('Database backup failed');
      }
    } catch (error) {
      console.error('Database backup failed:', error);
    }
  };

  const syncAllServices = async () => {
    try {
      const services = ['google-drive', 'firebase', 'github'];
      const promises = services.map(service => 
        fetch(`/api/sync/${service}`, { method: 'POST' })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      
      console.log(`Sync completed: ${successful}/${services.length} services synced successfully`);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const deployToFirebase = async () => {
    try {
      const response = await fetch('/api/deploy/firebase', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        console.log('Firebase deployment successful:', result);
        if (result.url) {
          window.open(result.url, '_blank');
        }
      } else {
        throw new Error('Firebase deployment failed');
      }
    } catch (error) {
      console.error('Firebase deployment failed:', error);
    }
  };

  const openFile = async (fileName: string, service: string) => {
    try {
      const response = await fetch('/api/files/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, service })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.url) {
          window.open(result.url, '_blank');
        } else if (result.content) {
          const blob = new Blob([result.content], { type: result.mimeType || 'text/plain' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      } else {
        throw new Error('Failed to open file');
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cloud Services Status */}
      <div className="space-y-2">
        <h3 className="text-white font-medium">Cloud Services</h3>
        {cloudServices.map((service, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{service.icon}</span>
                <div>
                  <div className="text-white font-medium text-sm">{service.name}</div>
                  <div className="text-gray-400 text-xs">
                    {service.status === 'connected' 
                      ? `${service.files || service.projects || service.repos} items`
                      : 'Not connected'
                    }
                  </div>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                service.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Upload */}
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <h4 className="text-white font-medium mb-2">Quick Upload</h4>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => uploadFiles('files')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded px-3 py-2 text-xs transition-all duration-300 shadow-lg shadow-blue-500/20"
            aria-label="Upload files to cloud storage"
            type="button"
          >
            📁 Files
          </button>
          <button 
            onClick={() => uploadFiles('images')}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded px-3 py-2 text-xs transition-all duration-300 shadow-lg shadow-purple-500/20"
            aria-label="Upload images to cloud storage"
            type="button"
          >
            🖼️ Images
          </button>
          <button 
            onClick={createBackup}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded px-3 py-2 text-xs transition-all duration-300 shadow-lg shadow-green-500/20"
            aria-label="Create backup of current workspace"
            type="button"
          >
            💾 Backup
          </button>
          <button 
            onClick={uploadDatabase}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded px-3 py-2 text-xs transition-all duration-300 shadow-lg shadow-orange-500/20"
            aria-label="Upload database backup to cloud"
            type="button"
          >
            🗄️ Database
          </button>
        </div>
      </div>

      {/* Recent Files */}
      <div className="space-y-2">
        <h4 className="text-gray-400 text-sm font-medium">Recent Files</h4>
        {recentFiles.map((file, index) => (
          <button 
            key={index} 
            className="w-full bg-gray-800/30 rounded-lg p-2 border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10"
            onClick={() => openFile(file.name, file.service)}
            aria-label={`Open ${file.name} from ${file.service}`}
            type="button"
          >
            <div className="flex items-center gap-2">
              <div className="text-blue-400">
                {file.type === 'document' && <FileText className="w-4 h-4" />}
                {file.type === 'folder' && <Folder className="w-4 h-4" />}
                {file.type === 'code' && <Database className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{file.name}</div>
                <div className="text-gray-400 text-xs">{file.service} • {file.modified}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button 
          onClick={syncAllServices}
          className="w-full text-left bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-blue-600/30 hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
          aria-label="Synchronize all cloud services"
          type="button"
        >
          <RefreshCw className="w-4 h-4" />
          🔄 Sync All Services
        </button>
        <button 
          onClick={deployToFirebase}
          className="w-full text-left bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-green-600/30 hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
          aria-label="Deploy project to Firebase hosting"
          type="button"
        >
          <ExternalLink className="w-4 h-4" />
          📤 Deploy to Firebase
        </button>
      </div>
    </div>
  );
}
