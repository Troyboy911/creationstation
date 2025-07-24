import React, { useState } from 'react';
import { Settings, Key, Palette, Monitor, Bell, Shield, Database, Wifi } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export function SettingsPanel() {
  const { state } = useWorkspace();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
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
    },
    workspace: {
      defaultPanelSize: 'medium',
      maxPanels: 6,
      autoBackup: true,
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'workspace', label: 'Workspace', icon: Monitor },
  ];

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('creation-station-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
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
          } catch (error) {
            alert('Error importing settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
                <label className="text-white font-medium capitalize">{service} API Key</label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => updateSetting('apiKeys', service, e.target.value)}
                  placeholder={`Enter ${service} API key...`}
                  className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                />
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
        >
          Save Settings
        </button>
        <button
          onClick={exportSettings}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20"
        >
          Export
        </button>
        <button
          onClick={importSettings}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-purple-500/20"
        >
          Import
        </button>
        <button
          onClick={resetSettings}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-red-500/20"
        >
          Reset
        </button>
      </div>
    </div>
  );
}