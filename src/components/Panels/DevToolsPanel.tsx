import { useState } from 'react';
import { Terminal, Github, Container, Code2, Play, GitBranch, ExternalLink } from 'lucide-react';

export function DevToolsPanel() {
  const [services, setServices] = useState([
    { id: 'docker', name: 'Docker', icon: Container, status: 'inactive', color: 'blue' },
    { id: 'github', name: 'GitHub', icon: Github, status: 'connected', color: 'gray' },
    { id: 'vscode', name: 'VS Code', icon: Code2, status: 'active', color: 'blue' },
    { id: 'terminal', name: 'Terminal', icon: Terminal, status: 'active', color: 'green' },
  ]);

  const toggleService = (serviceId: string) => {
    setServices(services.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            status: service.status === 'active' ? 'inactive' : 'active' 
          }
        : service
    ));
  };

  const startDevServer = async () => {
    try {
      const response = await fetch('/api/dev/start', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (result.url) {
          window.open(result.url, '_blank');
        } else {
          window.open('http://localhost:3000', '_blank');
        }
        setServices(services.map(service => 
          service.id === 'terminal' 
            ? { ...service, status: 'active' }
            : service
        ));
      } else {
        throw new Error('Failed to start dev server');
      }
    } catch (error) {
      console.error('Failed to start dev server:', error);
      window.open('http://localhost:3000', '_blank');
    }
  };

  const buildDockerImage = async () => {
    try {
      setServices(services.map(service => 
        service.id === 'docker' 
          ? { ...service, status: 'active' }
          : service
      ));
      
      const response = await fetch('/api/docker/build', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Docker build failed');
      }
      
      const result = await response.json();
      console.log('Docker build completed:', result);
    } catch (error) {
      console.error('Docker build failed:', error);
      setServices(services.map(service => 
        service.id === 'docker' 
          ? { ...service, status: 'inactive' }
          : service
      ));
    }
  };

  const deployToFirebase = async () => {
    try {
      const response = await fetch('/api/deploy/firebase', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (result.url) {
          window.open(result.url, '_blank');
        }
        console.log('Firebase deployment successful:', result);
      } else {
        throw new Error('Firebase deployment failed');
      }
    } catch (error) {
      console.error('Firebase deployment failed:', error);
    }
  };

  const openStackBlitz = () => {
    window.open('https://stackblitz.com/fork/github/Troyboy911/creationstation', '_blank');
  };

  const commitChanges = async () => {
    const message = prompt('Enter commit message:', 'Update project files');
    if (message) {
      try {
        const response = await fetch('/api/git/commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Git commit successful:', result);
          setServices(services.map(service => 
            service.id === 'github' 
              ? { ...service, status: 'connected' }
              : service
          ));
        } else {
          throw new Error('Git commit failed');
        }
      } catch (error) {
        console.error('Git commit failed:', error);
      }
    }
  };

  const createPullRequest = async () => {
    try {
      const response = await fetch('/api/git/pull-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Feature update from CreationStation',
          description: 'Automated pull request created from CreationStation workspace'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.url) {
          window.open(result.url, '_blank');
        }
        console.log('Pull request created:', result);
      } else {
        throw new Error('Failed to create pull request');
      }
    } catch (error) {
      console.error('Failed to create pull request:', error);
    }
  };

  const mergeToMain = async () => {
    if (confirm('Are you sure you want to merge to main branch?')) {
      try {
        const response = await fetch('/api/git/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branch: 'main' })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Successfully merged to main branch:', result);
        } else {
          throw new Error('Merge failed');
        }
      } catch (error) {
        console.error('Merge failed:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Service Status */}
      <div className="space-y-2">
        <h3 className="text-white font-medium">Development Tools</h3>
        {services.map((service) => (
          <div 
            key={service.id} 
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-cyan-400/30 transition-all duration-300 cursor-pointer"
            onClick={() => toggleService(service.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <service.icon className="w-5 h-5 text-gray-400" />
                <span className="text-white font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  service.status === 'active' ? 'bg-green-500' :
                  service.status === 'connected' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <span className="text-gray-400 text-xs capitalize">{service.status}</span>
              </div>
            </div>
            {service.id === 'github' && service.status === 'connected' && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <GitBranch className="w-3 h-3" />
                  <span>main branch • 3 commits ahead</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-gray-400 text-sm font-medium">Quick Actions</h4>
        <div className="space-y-2">
          <button 
            onClick={startDevServer}
            className="w-full text-left bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-green-600/30 flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/20"
            aria-label="Start development server on localhost:3000"
            type="button"
          >
            <Play className="w-4 h-4" />
            Start Dev Server
          </button>
          <button 
            onClick={buildDockerImage}
            className="w-full text-left bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-blue-600/30 hover:shadow-lg hover:shadow-blue-500/20"
            aria-label="Build Docker image for containerized deployment"
            type="button"
          >
            🐳 Build Docker Image
          </button>
          <button 
            onClick={deployToFirebase}
            className="w-full text-left bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-purple-600/30 hover:shadow-lg hover:shadow-purple-500/20"
            aria-label="Deploy application to Firebase hosting"
            type="button"
          >
            🚀 Deploy to Firebase
          </button>
          <button 
            onClick={openStackBlitz}
            className="w-full text-left bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-orange-600/30 hover:shadow-lg hover:shadow-orange-500/20 flex items-center gap-2"
            aria-label="Open project in StackBlitz online IDE"
            type="button"
          >
            <ExternalLink className="w-4 h-4" />
            📝 Open in StackBlitz
          </button>
        </div>
      </div>

      {/* GitHub Panel */}
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <h4 className="text-white font-medium mb-2">Repository Actions</h4>
        <div className="space-y-2">
          <button 
            onClick={commitChanges}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-gray-500/20"
            aria-label="Commit current changes to Git repository"
            type="button"
          >
            Commit Changes
          </button>
          <button 
            onClick={createPullRequest}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20"
            aria-label="Create new pull request for code review"
            type="button"
          >
            Create Pull Request
          </button>
          <button 
            onClick={mergeToMain}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-green-500/20"
            aria-label="Merge current branch to main branch"
            type="button"
          >
            Merge to Main
          </button>
        </div>
      </div>
    </div>
  );
}
