import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [dragState, setDragState] = useState<{ 
    isDragging: boolean; 
    panelId: string | null; 
    offset: { x: number; y: number } 
  }>({ isDragging: false, panelId: null, offset: { x: 0, y: 0 } });

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

  const handleMouseDown = useCallback((e: React.MouseEvent, panelId: string) => {
    if (panelStates[panelId]?.isMaximized) {
      return;
    }
    
    const panel = state.panels.find(p => p.id === panelId);
    if (!panel) {
      return;
    }
    
    const offset = {
      x: e.clientX - panel.position.x,
      y: e.clientY - panel.position.y
    };
    
    setDragState({ isDragging: true, panelId, offset });
    dispatch({ type: 'SET_DRAGGING', payload: true });
    
    e.preventDefault();
    e.stopPropagation();
  }, [panelStates, state.panels, dispatch]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.panelId) return;
    
    const newPosition = {
      x: e.clientX - dragState.offset.x,
      y: e.clientY - dragState.offset.y
    };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    newPosition.x = Math.max(80, Math.min(newPosition.x, viewportWidth - 300));
    newPosition.y = Math.max(64, Math.min(newPosition.y, viewportHeight - 200));
    
    dispatch({ 
      type: 'UPDATE_PANEL_POSITION', 
      payload: { id: dragState.panelId, position: newPosition }
    });
  }, [dragState, dispatch]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, panelId: null, offset: { x: 0, y: 0 } });
    dispatch({ type: 'SET_DRAGGING', payload: false });
  }, [dispatch]);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const constrainToViewport = (panel: { id: string; position: { x: number; y: number }; size: { width: number; height: number } }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelState = panelStates[panel.id];
    
    let { x, y } = panel.position;
    const { width, height } = panel.size;
    
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
            className="holographic-border fixed bg-high-contrast rounded-xl shadow-2xl shadow-cyan-500/30 z-40 resize overflow-hidden animate-slide-in"
            style={{
              left: panelStyle.left,
              top: panelStyle.top,
              width: panelStyle.width,
              height: panelStyle.height,
              minWidth: 280,
              minHeight: 200,
              boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.4), 0 0 0 2px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
            role="dialog"
            aria-labelledby={`panel-title-${panel.id}`}
            aria-describedby={`panel-content-${panel.id}`}
            tabIndex={-1}
          >
            {/* Holographic border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            
            {/* Panel Header */}
            <div 
              className="panel-header flex items-center justify-between p-3 cursor-move select-none"
              onMouseDown={(e) => handleMouseDown(e, panel.id)}
              style={{ 
                cursor: panelStates[panel.id]?.isMaximized ? 'default' : 'move',
                userSelect: 'none'
              }}
              role="banner"
              aria-label={`${panel.title} panel header - drag to move`}
            >
              <h2 className="text-high-contrast font-semibold flex items-center gap-2 select-none" role="heading" aria-level={2}>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" aria-hidden="true" />
                {panel.title}
              </h2>
              <div className="flex items-center gap-1" role="toolbar" aria-label="Panel controls">
                <button 
                  onClick={() => toggleMinimize(panel.id)}
                  className="btn-secondary p-2 rounded-md transition-all duration-200 focus:ring-2 focus:ring-cyan-500"
                  title={panelState?.isMinimized ? 'Restore panel' : 'Minimize panel'}
                  aria-label={panelState?.isMinimized ? `Restore ${panel.title} panel` : `Minimize ${panel.title} panel`}
                  type="button"
                >
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button 
                  onClick={() => toggleMaximize(panel.id)}
                  className="btn-secondary p-2 rounded-md transition-all duration-200 focus:ring-2 focus:ring-cyan-500"
                  title={panelState?.isMaximized ? 'Restore panel' : 'Maximize panel'}
                  aria-label={panelState?.isMaximized ? `Restore ${panel.title} panel` : `Maximize ${panel.title} panel`}
                  type="button"
                >
                  <Maximize2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: panel.id })}
                  className="p-2 rounded-md text-gray-300 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200 focus:ring-2 focus:ring-red-500"
                  title="Close panel"
                  aria-label={`Close ${panel.title} panel`}
                  type="button"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            {!panelState?.isMinimized && (
              <div 
                className="p-4 h-full overflow-y-auto custom-scrollbar bg-medium-contrast" 
                style={{ height: 'calc(100% - 57px)' }}
                id={`panel-content-${panel.id}`}
                role="main"
                aria-label={`${panel.title} panel content`}
              >
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
