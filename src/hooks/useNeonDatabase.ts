import { useState, useEffect } from 'react';
import { neonService } from '../services/neonService';
import { Project } from '../types';

interface UseNeonDatabaseReturn {
  isConnected: boolean;
  saveProject: (project: Project) => Promise<void>;
  loadProjects: () => Promise<Project[]>;
  saveSettings: (settings: Record<string, unknown>) => Promise<void>;
  loadSettings: () => Promise<Record<string, unknown>>;
  testConnection: () => Promise<boolean>;
}

export function useNeonDatabase(): UseNeonDatabaseReturn {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await neonService.testConnection();
        setIsConnected(connected);
      } catch (error) {
        console.warn('Neon connection check failed:', error);
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  const saveProject = async (project: Project) => {
    try {
      const neonProject = {
        id: project.id,
        name: project.name,
        description: project.description || '',
        createdAt: project.createdAt || new Date(),
        lastModified: project.lastModified,
        template: project.template || 'blank',
        files: project.files || [],
        settings: project.settings || {}
      };
      await neonService.saveProject(neonProject);
    } catch (error) {
      console.error('Failed to save project to Neon:', error);
      throw error;
    }
  };

  const loadProjects = async (): Promise<Project[]> => {
    try {
      const projects = await neonService.loadProjects();
      return projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
        lastModified: new Date(project.lastModified),
        template: project.template || 'blank',
        files: project.files || [],
        settings: project.settings || {},
        type: (project.template as 'react' | 'vue' | 'flutter' | 'shopify' | 'blank') || 'blank',
        status: 'active' as const
      }));
    } catch (error) {
      console.error('Failed to load projects from Neon:', error);
      return [];
    }
  };

  const saveSettings = async (settings: Record<string, unknown>) => {
    try {
      await neonService.saveSettings(settings);
    } catch (error) {
      console.error('Failed to save settings to Neon:', error);
      throw error;
    }
  };

  const loadSettings = async (): Promise<Record<string, unknown>> => {
    try {
      const settings = await neonService.loadSettings();
      return settings || {};
    } catch (error) {
      console.error('Failed to load settings from Neon:', error);
      return {};
    }
  };

  const testConnection = async () => {
    try {
      const connected = await neonService.testConnection();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Neon connection test failed:', error);
      setIsConnected(false);
      return false;
    }
  };

  return {
    isConnected,
    saveProject,
    loadProjects,
    saveSettings,
    loadSettings,
    testConnection,
  };
}
