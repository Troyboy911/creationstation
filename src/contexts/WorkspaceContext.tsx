import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Project, FileItem, Panel, APIConnection } from '../types';

interface WorkspaceState {
  currentProject: Project | null;
  projects: Project[];
  files: FileItem[];
  panels: Panel[];
  apiConnections: APIConnection[];
  isDragging: boolean;
}

type WorkspaceAction = 
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'ADD_FILE'; payload: FileItem }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'UPDATE_FILE_POSITION'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'TOGGLE_PANEL'; payload: string }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_API_CONNECTIONS'; payload: APIConnection[] };

const initialState: WorkspaceState = {
  currentProject: null,
  projects: [],
  files: [],
  panels: [
    { id: 'ai-code', title: 'AI & Code', category: 'ai-code', isOpen: true, position: { x: 20, y: 120 }, size: { width: 300, height: 400 } },
    { id: 'cloud-storage', title: 'Cloud & Storage', category: 'cloud-storage', isOpen: false, position: { x: 340, y: 120 }, size: { width: 300, height: 400 } },
    { id: 'dev-tools', title: 'Dev Tools', category: 'dev-tools', isOpen: false, position: { x: 660, y: 120 }, size: { width: 300, height: 400 } },
    { id: 'ecommerce', title: 'E-Commerce', category: 'ecommerce', isOpen: false, position: { x: 980, y: 120 }, size: { width: 300, height: 400 } },
    { id: 'automations', title: 'Automation Center', category: 'ai-code', isOpen: false, position: { x: 1300, y: 120 }, size: { width: 350, height: 500 } },
    { id: 'no-code', title: 'No-Code Tools', category: 'no-code', isOpen: false, position: { x: 20, y: 540 }, size: { width: 320, height: 450 } },
    { id: 'knowledge', title: 'Knowledge Base', category: 'knowledge', isOpen: false, position: { x: 360, y: 540 }, size: { width: 320, height: 450 } },
    { id: 'settings', title: 'System Settings', category: 'ai-code', isOpen: false, position: { x: 700, y: 540 }, size: { width: 400, height: 500 } },
  ],
  apiConnections: [
    { service: 'OpenAI', status: 'disconnected', scopes: ['chat', 'completion'] },
    { service: 'Google Drive', status: 'disconnected', scopes: ['read', 'write'] },
    { service: 'GitHub', status: 'disconnected', scopes: ['repo', 'user'] },
    { service: 'Shopify', status: 'disconnected', scopes: ['products', 'orders'] },
  ],
  isDragging: false,
};

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] };
    case 'REMOVE_FILE':
      return { ...state, files: state.files.filter(f => f.id !== action.payload) };
    case 'UPDATE_FILE_POSITION':
      return {
        ...state,
        files: state.files.map(f => 
          f.id === action.payload.id 
            ? { ...f, position: action.payload.position }
            : f
        )
      };
    case 'TOGGLE_PANEL':
      return {
        ...state,
        panels: state.panels.map(p => 
          p.id === action.payload 
            ? { ...p, isOpen: !p.isOpen }
            : p
        )
      };
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_API_CONNECTIONS':
      return { ...state, apiConnections: action.payload };
    default:
      return state;
  }
}

const WorkspaceContext = createContext<{
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
} | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
