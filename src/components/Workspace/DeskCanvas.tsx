import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { FileIcon, Image, Video, FileText, Database, Code } from 'lucide-react';

export function DeskCanvas() {
  const { state, dispatch } = useWorkspace();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (canvasRect) {
      files.forEach((file, index) => {
        const fileType = getFileType(file.type);
        const newFile = {
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          type: fileType,
          size: file.size,
          position: {
            x: e.clientX - canvasRect.left - 50,
            y: e.clientY - canvasRect.top - 50 + (index * 20),
          },
        };
        dispatch({ type: 'ADD_FILE', payload: newFile });
      });
    }
  };

  const getFileType = (mimeType: string): 'code' | 'image' | 'video' | 'document' | 'data' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('text/') || mimeType.includes('javascript') || mimeType.includes('json')) return 'code';
    if (mimeType.includes('csv') || mimeType.includes('database')) return 'data';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'code': return <Code className="w-6 h-6" />;
      case 'data': return <Database className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const handleFileClick = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const file = state.files.find(f => f.id === fileId);
    if (file) {
      if (file.type === 'code' && file.content) {
        try {
          const response = await fetch('/api/vscode/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              fileName: file.name, 
              content: file.content,
              path: file.path || `/tmp/${file.name}`
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.url) {
              window.open(result.url, '_blank');
            }
          } else {
            throw new Error('VS Code integration failed');
          }
        } catch (error) {
          console.error('Failed to open in VS Code:', error);
          const blob = new Blob([file.content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      } else if (file.type === 'image' && file.url) {
        window.open(file.url, '_blank');
      } else {
        try {
          const response = await fetch('/api/files/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, path: file.path })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.url) {
              window.open(result.url, '_blank');
            }
          } else {
            throw new Error('File open failed');
          }
        } catch (error) {
          console.error('Failed to open file:', error);
        }
      }
    }
  };

  return (
    <div 
      ref={canvasRef}
      className={`flex-1 relative overflow-hidden transition-all duration-500 ${
        dragOver 
          ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30' 
          : 'bg-gradient-to-br from-gray-900 via-black to-gray-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 80%),
          linear-gradient(135deg, transparent 0%, rgba(6, 182, 212, 0.03) 50%, transparent 100%)
        `,
      }}
    >
      {/* Advanced carbon fiber texture with holographic overlay */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(6, 182, 212, 0.05) 1px,
            rgba(6, 182, 212, 0.05) 2px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 1px,
            rgba(6, 182, 212, 0.05) 1px,
            rgba(6, 182, 212, 0.05) 2px
          ),
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(59, 130, 246, 0.02) 4px,
            rgba(59, 130, 246, 0.02) 8px
          )
        `,
      }} />
      
      {/* Scanning line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan" />
      </div>

      {/* Drop zone hint */}
      {state.files.length === 0 && !dragOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <FileIcon className="w-20 h-20 text-cyan-400/60 mx-auto" />
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-cyan-400/30 rounded-full animate-ping" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-cyan-300/80 mb-2">
                Drag & Drop Files Here
              </h3>
              <p className="text-gray-400/80">
                Drop code files, images, videos, or documents onto your workspace
              </p>
              <div className="mt-4 flex justify-center">
                <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg text-cyan-400/60 text-sm">
                  Holographic Workspace Active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag over overlay */}
      {dragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-dashed border-cyan-400 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📁</div>
            <h3 className="text-xl font-medium text-cyan-300">
              Drop files to add them to your workspace
            </h3>
            <div className="mt-2 text-cyan-400/80 text-sm">
              Initializing holographic file system...
            </div>
          </div>
        </div>
      )}

      {/* Files on canvas */}
      {state.files.map((file) => (
        <div
          key={file.id}
          className="absolute cursor-pointer group"
          style={{
            left: file.position.x,
            top: file.position.y,
          }}
          onClick={(e) => handleFileClick(file.id, e)}
        >
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 group-hover:border-cyan-400/60 transform">
            {/* Holographic glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center gap-3 mb-2">
              <div className="text-cyan-400 relative">
                {getFileIcon(file.type)}
                <div className="absolute inset-0 text-cyan-400/30 animate-pulse">
                  {getFileIcon(file.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-cyan-100 font-medium truncate text-sm">
                  {file.name}
                </div>
                {file.size && (
                  <div className="text-cyan-400/60 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-cyan-400/50 capitalize">
              {file.type} file
            </div>
          </div>
        </div>
      ))}

      {/* Current project indicator */}
      {state.currentProject && (
        <div className="absolute bottom-6 left-6">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-4 py-3 shadow-lg shadow-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <div className="text-cyan-400/80 text-xs font-medium">ACTIVE PROJECT</div>
            </div>
            <div className="text-cyan-100 font-semibold">{state.currentProject.name}</div>
            <div className="text-cyan-400/60 text-xs capitalize">{state.currentProject.type}</div>
          </div>
        </div>
      )}
    </div>
  );
}
