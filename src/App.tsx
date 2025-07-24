import React from 'react';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { TopNavigation } from './components/Navigation/TopNavigation';
import { ToolPanel } from './components/Sidebar/ToolPanel';
import { DeskCanvas } from './components/Workspace/DeskCanvas';
import { PanelManager } from './components/Panels/PanelManager';

function App() {
  return (
    <WorkspaceProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        {/* Top Navigation */}
        <TopNavigation />
        
        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Left Sidebar - Tool Panel */}
          <ToolPanel />
          
          {/* Main Workspace */}
          <div className="flex-1 relative">
            <DeskCanvas />
            <PanelManager />
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
}

export default App;