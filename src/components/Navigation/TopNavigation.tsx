import { useState } from 'react';
import { ChevronDown, Plus, FolderOpen, Layers, Settings } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export function TopNavigation() {
  const { state, dispatch } = useWorkspace();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const projectTemplates = [
    { id: 'react', name: 'React App', icon: '⚛️' },
    { id: 'vue', name: 'Vue.js App', icon: '💚' },
    { id: 'flutter', name: 'Flutter App', icon: '📱' },
    { id: 'shopify', name: 'Shopify Store', icon: '🛍️' },
    { id: 'blank', name: 'Blank Project', icon: '📄' },
  ];

  const createNewProject = (template: string) => {
    const newProject = {
      id: `project-${Date.now()}`,
      name: `New ${template.charAt(0).toUpperCase() + template.slice(1)} Project`,
      type: template as 'react' | 'vue' | 'flutter' | 'shopify' | 'blank',
      lastModified: new Date(),
      status: 'active' as const,
    };
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: newProject });
    setActiveDropdown(null);
  };

  const loadLocalFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      alert(`Loading ${files.length} files from local directory...`);
      setActiveDropdown(null);
    };
    
    input.click();
  };

  const loadFromGitHub = () => {
    const repoUrl = prompt('Enter GitHub repository URL:');
    if (repoUrl) {
      alert(`Cloning repository: ${repoUrl}`);
      setActiveDropdown(null);
    }
  };

  const loadFromZip = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`Extracting ZIP file: ${file.name}`);
        setActiveDropdown(null);
      }
    };
    
    input.click();
  };

  const loadFromCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`Importing CSV data: ${file.name}`);
        setActiveDropdown(null);
      }
    };
    
    input.click();
  };

  return (
    <nav className="h-16 bg-gradient-to-r from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-6 relative z-50 shadow-lg shadow-cyan-500/10">
      {/* Holographic accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      
      {/* Left - New Project */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'new' ? null : 'new')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/90 hover:to-blue-500/90 rounded-lg transition-all duration-300 group shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 border border-cyan-400/30"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Project</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'new' ? 'rotate-180' : ''}`} />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
        
        {activeDropdown === 'new' && (
          <div className="absolute top-full mt-2 left-0 w-64 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 animate-slide-in">
            {projectTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => createNewProject(template.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 text-left first:rounded-t-xl last:rounded-b-xl hover:shadow-lg hover:shadow-cyan-500/10 border-b border-gray-700/30 last:border-b-0"
              >
                <span className="text-xl">{template.icon}</span>
                <span className="text-cyan-100 group-hover:text-cyan-300 transition-colors">{template.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center - Load/Import */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'load' ? null : 'load')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 rounded-lg transition-all duration-300 border border-gray-700/50 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="font-medium">Load Project</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'load' ? 'rotate-180' : ''}`} />
        </button>
        
        {activeDropdown === 'load' && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-56 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 animate-slide-in">
            <button 
              onClick={loadLocalFiles}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 text-left rounded-t-xl hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <span>📁</span>
              <span className="text-cyan-100 hover:text-cyan-300 transition-colors">Local Files</span>
            </button>
            <button 
              onClick={loadFromGitHub}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 text-left hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <span>🐙</span>
              <span className="text-cyan-100 hover:text-cyan-300 transition-colors">GitHub Repository</span>
            </button>
            <button 
              onClick={loadFromZip}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 text-left hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <span>🗜️</span>
              <span className="text-cyan-100 hover:text-cyan-300 transition-colors">ZIP Archive</span>
            </button>
            <button 
              onClick={loadFromCSV}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 text-left rounded-b-xl hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <span>📊</span>
              <span className="text-cyan-100 hover:text-cyan-300 transition-colors">CSV Data</span>
            </button>
          </div>
        )}
      </div>

      {/* Right - Switch Project & Settings */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'switch' ? null : 'switch')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 rounded-lg transition-all duration-300 border border-gray-700/50 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <Layers className="w-4 h-4" />
            <span className="font-medium">
              {state.currentProject?.name || 'No Project'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'switch' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeDropdown === 'switch' && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 max-h-64 overflow-y-auto animate-slide-in">
              {state.projects.length === 0 ? (
                <div className="px-4 py-3 text-cyan-400/60 text-center">No projects yet</div>
              ) : (
                state.projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors text-left first:rounded-t-lg last:rounded-b-lg ${
                      state.currentProject?.id === project.id ? 'bg-blue-600/20' : ''
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium">{project.name}</div>
                      <div className="text-gray-400 text-sm">{project.type}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      project.status === 'active' ? 'bg-green-500' : 
                      project.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button className="p-2 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 rounded-lg transition-all duration-300 border border-gray-700/50 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Click outside to close dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
}
