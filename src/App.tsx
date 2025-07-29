import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TopNavigation } from './components/Navigation/TopNavigation';
import { ToolPanel } from './components/Sidebar/ToolPanel';
import { DeskCanvas } from './components/Workspace/DeskCanvas';
import { PanelManager } from './components/Panels/PanelManager';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <WorkspaceProvider>
          <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            <TopNavigation />
            
            <div className="flex-1 flex relative">
              <ToolPanel />
              
              <div className="flex-1 relative">
                <DeskCanvas />
                <PanelManager />
              </div>
            </div>
          </div>
        </WorkspaceProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
