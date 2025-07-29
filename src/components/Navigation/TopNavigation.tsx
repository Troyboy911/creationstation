import { useState } from 'react';
import { ChevronDown, Plus, FolderOpen, Layers, Settings } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { AuthButton } from '../Auth/AuthButton';
import { FileItem, Project } from '../../types';

export function TopNavigation() {
  const generateTemplateFiles = (template: string, projectId: string): FileItem[] => {
    const baseFiles: FileItem[] = [];
    
    switch (template) {
      case 'react':
        baseFiles.push(
          {
            id: `${projectId}-app-js`,
            name: 'App.jsx',
            type: 'code',
            content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Welcome to your React App!</h1>\n    </div>\n  );\n}\n\nexport default App;',
            position: { x: 100, y: 100 }
          },
          {
            id: `${projectId}-package-json`,
            name: 'package.json',
            type: 'code',
            content: '{\n  "name": "react-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}',
            position: { x: 300, y: 150 }
          }
        );
        break;
      case 'vue':
        baseFiles.push(
          {
            id: `${projectId}-index-js`,
            name: 'main.js',
            type: 'code',
            content: 'import { createApp } from "vue";\n\nconst app = createApp({\n  data() {\n    return {\n      message: "Hello Vue!"\n    }\n  },\n  template: `<h1>{{ message }}</h1>`\n});\n\napp.mount("#app");',
            position: { x: 100, y: 100 }
          }
        );
        break;
      case 'flutter':
        baseFiles.push(
          {
            id: `${projectId}-server-js`,
            name: 'main.dart',
            type: 'code',
            content: 'import "package:flutter/material.dart";\n\nvoid main() {\n  runApp(MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: Scaffold(\n        appBar: AppBar(title: Text("Flutter App")),\n        body: Center(child: Text("Hello Flutter!")),\n      ),\n    );\n  }\n}',
            position: { x: 100, y: 100 }
          }
        );
        break;
      case 'shopify':
        baseFiles.push(
          {
            id: `${projectId}-product-js`,
            name: 'Product.jsx',
            type: 'code',
            content: 'import React from "react";\n\nfunction Product({ name, price, image }) {\n  return (\n    <div className="product">\n      <img src={image} alt={name} />\n      <h3>{name}</h3>\n      <p>${price}</p>\n      <button>Add to Cart</button>\n    </div>\n  );\n}\n\nexport default Product;',
            position: { x: 100, y: 100 }
          }
        );
        break;
      default:
        baseFiles.push(
          {
            id: `${projectId}-readme`,
            name: 'README.md',
            type: 'document',
            content: `# ${template} Project\n\nThis is your new ${template} project. Start building something amazing!`,
            position: { x: 100, y: 100 }
          }
        );
    }
    
    return baseFiles;
  };


  const { state, dispatch } = useWorkspace();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const projectTemplates = [
    { id: 'react', name: 'React App', icon: '⚛️' },
    { id: 'vue', name: 'Vue.js App', icon: '💚' },
    { id: 'flutter', name: 'Flutter App', icon: '📱' },
    { id: 'shopify', name: 'Shopify Store', icon: '🛍️' },
    { id: 'blank', name: 'Blank Project', icon: '📄' },
  ];

  const createNewProject = async (template: string) => {
    const projectName = prompt('Enter project name:') || `New ${template} Project`;
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: projectName,
      description: `${template} project`,
      createdAt: new Date(),
      lastModified: new Date(),
      template,
      files: [],
      settings: {},
      type: template as 'react' | 'vue' | 'flutter' | 'shopify' | 'blank',
      status: 'active'
    };

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: newProject, template })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.files) {
          result.files.forEach((file: any) => {
            dispatch({ type: 'ADD_FILE', payload: file });
          });
        }
      }
    } catch (error) {
      console.error('Project creation API failed:', error);
    }
    
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: newProject });
    
    const savedProjects = JSON.parse(localStorage.getItem('creation-station-projects') || '[]');
    savedProjects.push(newProject);
    localStorage.setItem('creation-station-projects', JSON.stringify(savedProjects));

    const templateFiles = generateTemplateFiles(template, newProject.id);
    templateFiles.forEach((file: FileItem) => {
      dispatch({ type: 'ADD_FILE', payload: file });
    });
    
    setActiveDropdown(null);
  };

  const loadLocalFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      try {
        for (const file of files) {
          const content = await file.text();
          const fileItem = {
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.jsx') || file.name.endsWith('.tsx') ? 'code' as const : 'document' as const,
            content,
            path: file.webkitRelativePath,
            position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 }
          };
          dispatch({ type: 'ADD_FILE', payload: fileItem });
        }
        console.log(`Loaded ${files.length} files from directory`);
      } catch (error) {
        console.error('Failed to load directory:', error);
      }
      setActiveDropdown(null);
    };
    
    input.click();
  };

  const loadFromGitHub = async () => {
    const repoUrl = prompt('Enter GitHub repository URL:');
    if (repoUrl) {
      try {
        const response = await fetch('/api/github/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.project) {
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: result.project });
          }
          if (result.files) {
            result.files.forEach((file: any) => {
              dispatch({ type: 'ADD_FILE', payload: file });
            });
          }
          console.log(`Cloned repository: ${repoUrl}`);
        } else {
          throw new Error('GitHub clone failed');
        }
      } catch (error) {
        console.error('GitHub clone failed:', error);
      }
      setActiveDropdown(null);
    }
  };

  const loadFromZip = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const response = await fetch('/api/files/extract-zip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.files) {
              result.files.forEach((extractedFile: any) => {
                dispatch({ type: 'ADD_FILE', payload: extractedFile });
              });
            }
            console.log(`Extracted ZIP file: ${file.name}`);
          } else {
            throw new Error('ZIP extraction failed');
          }
        } catch (error) {
          console.error('ZIP extraction failed:', error);
        }
        setActiveDropdown(null);
      }
    };
    
    input.click();
  };

  const loadFromCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const csvText = await file.text();
          const response = await fetch('/api/files/import-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, csvData: csvText })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.dataFile) {
              dispatch({ type: 'ADD_FILE', payload: result.dataFile });
            }
            console.log(`Imported CSV data: ${file.name}`);
          } else {
            throw new Error('CSV import failed');
          }
        } catch (error) {
          console.error('CSV import failed:', error);
        }
        setActiveDropdown(null);
      }
    };
    
    input.click();
  };

  return (
    <nav 
      className="h-16 bg-gradient-to-r from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-6 relative z-50 shadow-lg shadow-cyan-500/10"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Holographic accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      
      {/* Left - New Project */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'new' ? null : 'new')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/90 hover:to-blue-500/90 rounded-lg transition-all duration-300 group shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 border border-cyan-400/30"
          aria-label="Create new project"
          aria-expanded={activeDropdown === 'new'}
          aria-haspopup="menu"
          type="button"
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
          aria-label="Load existing project"
          aria-expanded={activeDropdown === 'load'}
          aria-haspopup="menu"
          type="button"
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
            aria-label="Switch between projects"
            aria-expanded={activeDropdown === 'switch'}
            aria-haspopup="menu"
            type="button"
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
                      
                      if (project.files && project.files.length > 0) {
                        project.files.forEach((file: FileItem) => {
                          dispatch({ type: 'ADD_FILE', payload: file });
                        });
                      } else {
                        const templateFiles = generateTemplateFiles(project.template || project.type || 'blank', project.id);
                        templateFiles.forEach((file: FileItem) => {
                          dispatch({ type: 'ADD_FILE', payload: file });
                        });
                      }
                      
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors text-left first:rounded-t-lg last:rounded-b-lg ${
                      state.currentProject?.id === project.id ? 'bg-blue-600/20' : ''
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium">{project.name}</div>
                      <div className="text-gray-400 text-sm">{project.template || project.type || 'Project'}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      (project.status || 'active') === 'active' ? 'bg-green-500' : 
                      (project.status || 'active') === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <AuthButton />
        <button 
          className="p-2 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 rounded-lg transition-all duration-300 border border-gray-700/50 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20"
          aria-label="Open settings"
          type="button"
        >
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
