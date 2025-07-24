import React, { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { AICodePanel } from './AICodePanel';
import { ECommercePanel } from './ECommercePanel';
import { DevToolsPanel } from './DevToolsPanel';
import { CloudStoragePanel } from './CloudStoragePanel';
import { AutomationsPanel } from './AutomationsPanel';
import { NoCodePanel } from './NoCodePanel';
import { KnowledgePanel } from './KnowledgePanel';
import { SettingsPanel } from './SettingsPanel';

export function PanelManager() {
  const { state, dispatch } = useWorkspace();
  const panelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [panelStates, setPanelStates] = useState<{ [key: string]: { isMinimized: boolean; isMaximized: boolean } }>({});

  const getPanelContent = (panelId: string) => {
    switch (panelId) {
      case 'ai-code':
        return <AICodePanel />;
      case 'ecommerce':
        return <ECommercePanel />;
      case 'dev-tools':
        return <DevToolsPanel />;
      case 'cloud-storage':
        return <CloudStoragePanel />;
      case 'automations':
        return <AutomationsPanel />;
      case 'no-code':
        return <NoCodePanel />;
      case 'knowledge':
        return <KnowledgePanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <div className="text-gray-400">Panel content coming soon...</div>;
    }
  };

  const toggleMinimize = (panelId: string) => {
    setPanelStates(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        isMinimized: !prev[panelId]?.isMinimized,
        isMaximized: false,
      }
    }));
  };

  const toggleMaximize = (panelId: string) => {
    setPanelStates(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        isMaximized: !prev[panelId]?.isMaximized,
        isMinimized: false,
      }
    }));
  };

  const constrainToViewport = (panel: any) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelState = panelStates[panel.id];
    
    let { x, y } = panel.position;
    let { width, height } = panel.size;
    
    if (panelState?.isMaximized) {
      return {
        left: 80, // Account for sidebar
        top: 64, // Account for top nav
        width: viewportWidth - 100,
        height: viewportHeight - 84,
      };
    }
    
    // Ensure panel stays within viewport
    x = Math.max(80, Math.min(x, viewportWidth - width - 20));
    y = Math.max(64, Math.min(y, viewportHeight - height - 20));
    
    return {
      left: x,
      top: y,
      width: panelState?.isMinimized ? width : width,
      height: panelState?.isMinimized ? 57 : height,
    };
  };
  // Auto-minimize panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside all open panels
      const openPanels = state.panels.filter(p => p.isOpen);
      let clickedInsidePanel = false;
      
      openPanels.forEach(panel => {
        const panelElement = panelRefs.current[panel.id];
        if (panelElement && panelElement.contains(target)) {
          clickedInsidePanel = true;
        }
      });
      
      // Also check if clicked on sidebar tool buttons
      const toolPanel = document.querySelector('.w-16.bg-gradient-to-b');
      if (toolPanel && toolPanel.contains(target)) {
        clickedInsidePanel = true;
      }
      
      if (!clickedInsidePanel && openPanels.length > 0) {
        openPanels.forEach(panel => {
          dispatch({ type: 'TOGGLE_PANEL', payload: panel.id });
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.panels, dispatch]);
  return (
    <>
      {state.panels.map((panel) => (
        panel.isOpen && (
          (() => {
            const panelStyle = constrainToViewport(panel);
            const panelState = panelStates[panel.id];
            
            return (
          <div
            ref={(el) => { panelRefs.current[panel.id] = el; }}
            key={panel.id}
            className="fixed bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 z-40 resize overflow-hidden animate-slide-in"
            style={{
              left: panelStyle.left,
              top: panelStyle.top,
              width: panelStyle.width,
              height: panelStyle.height,
              minWidth: 280,
              minHeight: 200,
              boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.25), 0 0 0 1px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Holographic border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            
            {/* Panel Header */}
            <div className="flex items-center justify-between p-3 border-b border-cyan-500/20 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
              <h2 className="text-cyan-300 font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                {panel.title}
              </h2>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => toggleMinimize(panel.id)}
                  className="p-1 hover:bg-cyan-500/20 rounded text-gray-400 hover:text-cyan-300 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
                  title={panelState?.isMinimized ? 'Restore' : 'Minimize'}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleMaximize(panel.id)}
                  className="p-1 hover:bg-cyan-500/20 rounded text-gray-400 hover:text-cyan-300 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
                  title={panelState?.isMaximized ? 'Restore' : 'Maximize'}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: panel.id })}
                  className="p-1 hover:bg-red-500/30 rounded text-gray-400 hover:text-red-300 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            {!panelState?.isMinimized && (
              <div className="p-4 h-full overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 57px)' }}>
                {getPanelContent(panel.id)}
              </div>
            )}
          </div>
            );
          })()
        )
      ))}
    </>
  );
}