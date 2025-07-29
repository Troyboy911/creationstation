import { 
  Cloud, 
  Wrench, 
  ShoppingBag, 
  Brain, 
  Settings,
  Palette,
  FileText,
  Zap
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export function ToolPanel() {
  const { state, dispatch } = useWorkspace();

  const tools = [
    { id: 'ai-code', icon: Brain, label: 'AI & Code', color: 'blue' },
    { id: 'cloud-storage', icon: Cloud, label: 'Cloud', color: 'green' },
    { id: 'dev-tools', icon: Wrench, label: 'Dev Tools', color: 'purple' },
    { id: 'ecommerce', icon: ShoppingBag, label: 'E-Commerce', color: 'orange' },
    { id: 'no-code', icon: Palette, label: 'No-Code', color: 'pink' },
    { id: 'knowledge', icon: FileText, label: 'Knowledge', color: 'yellow' },
    { id: 'automations', icon: Zap, label: 'Automations', color: 'cyan' },
  ];

  const handleToolClick = (toolId: string) => {
    dispatch({ type: 'TOGGLE_PANEL', payload: toolId });
  };

  const handleSettingsClick = () => {
    dispatch({ type: 'TOGGLE_PANEL', payload: 'settings' });
  };
  return (
    <div className="w-16 bg-gradient-to-b from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col items-center py-4 space-y-2 shadow-2xl shadow-cyan-500/10">
      {/* Arc Reactor Style Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      {tools.map((tool) => {
        const isActive = state.panels.find(p => p.id === tool.id)?.isOpen;
        const glowColor = tool.color === 'cyan' ? 'cyan' : tool.color === 'blue' ? 'blue' : 'cyan';
        return (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group relative transform hover:scale-110 ${
              isActive
                ? `bg-gradient-to-br from-${glowColor}-500/30 to-${glowColor}-600/50 text-${glowColor}-300 shadow-lg shadow-${glowColor}-500/30 border border-${glowColor}-400/50`
                : 'bg-gray-800/50 text-gray-400 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20 border border-gray-700/50 hover:border-cyan-400/30'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-3 bg-gray-900/95 backdrop-blur-sm border border-cyan-400/30 text-cyan-300 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg shadow-cyan-500/20">
              {tool.label}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-cyan-400/30 rotate-45" />
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-lg shadow-cyan-500/50" />
            )}
            
            {/* Holographic glow effect */}
            {isActive && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 animate-pulse" />
            )}
          </button>
        );
      })}

      {/* Settings at bottom */}
      <div className="flex-1" />
      <button 
        onClick={handleSettingsClick}
        className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-800/50 text-gray-400 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20 border border-gray-700/50 hover:border-cyan-400/30 transition-all duration-300 group transform hover:scale-110"
      >
        <Settings className="w-5 h-5" />
        <div className="absolute left-full ml-3 bg-gray-900/95 backdrop-blur-sm border border-cyan-400/30 text-cyan-300 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg shadow-cyan-500/20">
          Settings
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-cyan-400/30 rotate-45" />
        </div>
      </button>
    </div>
  );
}
