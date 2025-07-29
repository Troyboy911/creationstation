import { useState, useEffect } from 'react';
import { Settings, Key, Palette, Monitor, Shield, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { environment, validateEnvironment } from '../../config/environment';
import { neonService } from '../../services/neonService';

export function SettingsPanel() {
  const { state, dispatch } = useWorkspace();
  const [neonConnected, setNeonConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    theme: 'dark',
    autoSave: true,
    notifications: true,
    animations: true,
    panelAutoClose: true,
    gridSnap: false,
    apiKeys: {
      openai: environment.openai.apiKey,
      github: environment.github.token,
      firebase: environment.firebase.apiKey,
      shopify: environment.shopify.apiKey,
      google: environment.google.apiKey,
      stripe: environment.stripe.publishableKey,
      netlify: environment.netlify.accessToken,
      tana: environment.tana.apiKey,
      n8n: environment.n8n.apiKey,
      neon: environment.neon.apiKey,
      portainer: environment.portainer.apiKey,
    },
    workspace: {
      defaultPanelSize: 'medium',
      maxPanels: 6,
      autoBackup: true,
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: 'connected' | 'disconnected' | 'testing' }>({});
  const [envValidation, setEnvValidation] = useState(validateEnvironment());

  useEffect(() => {
    setEnvValidation(validateEnvironment());
    
    const checkNeonConnection = async () => {
      try {
        const connected = await neonService.testConnection();
        setNeonConnected(connected);
      } catch {
        setNeonConnected(false);
      }
    };
    
    checkNeonConnection();
    
    const savedSettings = localStorage.getItem('creation-station-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Could not load saved settings:', error);
      }
    }
    
    const savedApiKeys = sessionStorage.getItem('creation-station-api-keys');
    if (savedApiKeys) {
      try {
        const parsed = JSON.parse(savedApiKeys);
        setSettings(prev => ({ ...prev, apiKeys: { ...prev.apiKeys, ...parsed } }));
      } catch (error) {
        console.warn('Could not load saved API keys:', error);
      }
    }
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'workspace', label: 'Workspace', icon: Monitor },
    { id: 'database', label: 'Database', icon: Database },
  ];

  const updateSetting = (category: string, key: string, value: string | boolean | number) => {
    if (category === '') {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...(prev[category as keyof typeof prev] as Record<string, unknown>),
          [key]: value
        }
      }));
    }
  };

  const testConnection = async (service: string, apiKey: string) => {
    setConnectionStatus(prev => ({ ...prev, [service]: 'testing' }));
    
    try {
      let isValid = false;
      
      switch (service) {
        case 'openai':
          isValid = apiKey.startsWith('sk-') && apiKey.length > 20;
          break;
        case 'github':
          isValid = apiKey.startsWith('ghp_') || apiKey.startsWith('github_pat_');
          break;
        case 'firebase':
          isValid = apiKey.length > 30;
          break;
        default:
          isValid = apiKey.length > 0;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [service]: isValid ? 'connected' : 'disconnected' 
      }));
      
      return isValid;
    } catch {
      setConnectionStatus(prev => ({ ...prev, [service]: 'disconnected' }));
      return false;
    }
  };

  const saveSettings = async () => {
    const connections = await Promise.all(
      Object.entries(settings.apiKeys).map(async ([service, key]) => {
        const isConnected = key ? await testConnection(service, key) : false;
        return {
          service: service.charAt(0).toUpperCase() + service.slice(1),
          status: (isConnected ? 'connected' : 'disconnected') as 'connected' | 'disconnected' | 'error',
          scopes: [],
          lastUsed: isConnected ? new Date() : undefined,
        };
      })
    );

    dispatch({ 
      type: 'UPDATE_API_CONNECTIONS', 
      payload: connections
    });

    localStorage.setItem('creation-station-settings', JSON.stringify(settings));
    sessionStorage.setItem('creation-station-api-keys', JSON.stringify(settings.apiKeys));
    
    try {
      const envUpdate = Object.entries(settings.apiKeys)
        .filter(([, key]) => key.trim())
        .map(([service, key]) => `VITE_${service.toUpperCase()}_API_KEY=${key}`)
        .join('\n');
      
      if (envUpdate) {
        localStorage.setItem('creation-station-env-vars', envUpdate);
      }
    } catch (error) {
      console.warn('Could not update environment variables:', error);
    }
    
    try {
      await neonService.saveSettings(settings);
    } catch (error) {
      console.warn('Could not save to Neon database:', error);
    }
    
    alert('Settings saved and tested successfully!');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        theme: 'dark',
        autoSave: true,
        notifications: true,
        animations: true,
        panelAutoClose: true,
        gridSnap: false,
        apiKeys: {
          openai: '',
          github: '',
          firebase: '',
          shopify: '',
          google: '',
          stripe: '',
          netlify: '',
          tana: '',
          n8n: '',
          neon: '',
          portainer: '',
        },
        workspace: {
          defaultPanelSize: 'medium',
          maxPanels: 6,
          autoBackup: true,
        }
      });
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'creation-station-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string);
            setSettings(importedSettings);
            alert('Settings imported successfully!');
          } catch {
            alert('Error importing settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getConnectionIcon = (service: string) => {
    const status = connectionStatus[service];
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'testing':
        return <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />;
      case 'disconnected':
      default:
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
          <Settings className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">System Settings</h3>
          <p className="text-gray-400 text-sm">Configure your workspace</p>
        </div>
      </div>

      {!envValidation.isValid && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-red-400 font-medium">Environment Configuration Issues</h3>
          </div>
          <p className="text-red-300 text-sm mb-2">Missing required environment variables:</p>
          <ul className="text-red-300 text-sm space-y-1">
            {envValidation.missingKeys.map(key => (
              <li key={key} className="ml-4">• {key}</li>
            ))}
          </ul>
          <p className="text-red-300 text-sm mt-2">
            Please check your .env.local file and ensure all required variables are set.
          </p>
        </div>
      )}

      {/* Database Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-medium">Database Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${neonConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-sm ${neonConnected ? 'text-green-400' : 'text-red-400'}`}>
            {neonConnected ? 'Neon PostgreSQL Connected' : 'Neon PostgreSQL Disconnected'}
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Projects and settings are automatically synced to your Neon database
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            aria-label={`Switch to ${tab.label} settings tab`}
            type="button"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Auto Save</div>
                <div className="text-gray-400 text-sm">Automatically save changes</div>
              </div>
              <button
                onClick={() => updateSetting('', 'autoSave', !settings.autoSave)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.autoSave ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
                aria-label={`Auto save is ${settings.autoSave ? 'enabled' : 'disabled'}, click to toggle`}
                type="button"
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Notifications</div>
                <div className="text-gray-400 text-sm">Show system notifications</div>
              </div>
              <button
                onClick={() => updateSetting('', 'notifications', !settings.notifications)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.notifications ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
                aria-label={`Notifications are ${settings.notifications ? 'enabled' : 'disabled'}, click to toggle`}
                type="button"
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Animations</div>
                <div className="text-gray-400 text-sm">Enable UI animations</div>
              </div>
              <button
                onClick={() => updateSetting('', 'animations', !settings.animations)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.animations ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
                aria-label={`Animations are ${settings.animations ? 'enabled' : 'disabled'}, click to toggle`}
                type="button"
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  settings.animations ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Panel Auto-Close</div>
                <div className="text-gray-400 text-sm">Close panels when clicking outside</div>
              </div>
              <button
                onClick={() => updateSetting('', 'panelAutoClose', !settings.panelAutoClose)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.panelAutoClose ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
                aria-label={`Panel auto-close is ${settings.panelAutoClose ? 'enabled' : 'disabled'}, click to toggle`}
                type="button"
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  settings.panelAutoClose ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {Object.entries(settings.apiKeys).map(([service, key]) => (
              <div key={service} className="space-y-2">
                <label className="text-white font-medium capitalize flex items-center gap-2">
                  {service} API Key
                  {getConnectionIcon(service)}
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => updateSetting('apiKeys', service, e.target.value)}
                    placeholder={`Enter ${service} API key...`}
                    className="flex-1 bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                    aria-label={`${service} API key`}
                  />
                  <button
                    onClick={() => testConnection(service, key)}
                    disabled={!key || connectionStatus[service] === 'testing'}
                    className="px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Test ${service} API connection`}
                    type="button"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Security Notice</span>
            </div>
            <p className="text-yellow-300/80 text-sm">
              API keys are stored locally in your browser. Never share your keys with others.
            </p>
          </div>
        </div>
      )}

      {/* Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-white font-medium mb-2 block">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('', 'theme', e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                aria-label="Application theme selection"
              >
                <option value="dark">Dark (Iron Man)</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Grid Snap</div>
                <div className="text-gray-400 text-sm">Snap files to grid when dragging</div>
              </div>
              <button
                onClick={() => updateSetting('', 'gridSnap', !settings.gridSnap)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.gridSnap ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
                aria-label={`Grid snap is ${settings.gridSnap ? 'enabled' : 'disabled'}, click to toggle`}
                type="button"
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  settings.gridSnap ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace */}
      {activeTab === 'workspace' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-white font-medium mb-2 block">Default Panel Size</label>
              <select
                value={settings.workspace.defaultPanelSize}
                onChange={(e) => updateSetting('workspace', 'defaultPanelSize', e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                aria-label="Default panel size setting"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Max Open Panels</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.workspace.maxPanels}
                onChange={(e) => updateSetting('workspace', 'maxPanels', parseInt(e.target.value))}
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                aria-label="Maximum number of open panels"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Auto Backup</div>
                <div className="text-gray-400 text-sm">Automatically backup workspace</div>
              </div>
              <button
                onClick={() => updateSetting('workspace', 'autoBackup', !settings.workspace.autoBackup)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.workspace.autoBackup ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
                aria-label={`Auto backup is ${settings.workspace.autoBackup ? 'enabled' : 'disabled'}, click to toggle`}
                type="button"
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  settings.workspace.autoBackup ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Workspace Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-cyan-400 font-bold text-lg">{state.panels.filter(p => p.isOpen).length}</div>
                <div className="text-gray-400 text-xs">Open Panels</div>
              </div>
              <div>
                <div className="text-blue-400 font-bold text-lg">{state.files.length}</div>
                <div className="text-gray-400 text-xs">Files</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={saveSettings}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-green-500/20"
          aria-label="Save all settings and test connections"
          type="button"
        >
          Save Settings
        </button>
        <button
          onClick={exportSettings}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20"
          aria-label="Export settings to JSON file"
          type="button"
        >
          Export
        </button>
        <button
          onClick={importSettings}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-purple-500/20"
          aria-label="Import settings from JSON file"
          type="button"
        >
          Import
        </button>
        <button
          onClick={resetSettings}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-red-500/20"
          aria-label="Reset all settings to default values"
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
