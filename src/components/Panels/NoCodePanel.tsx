import React, { useState } from 'react';
import { Palette, FileText, Workflow, Save, Play, Eye } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export function NoCodePanel() {
  const { dispatch } = useWorkspace();
  const [activeTab, setActiveTab] = useState('visual');
  const [noteContent, setNoteContent] = useState('');
  const [flowNodes, setFlowNodes] = useState([
    { id: 1, type: 'start', label: 'Start', x: 50, y: 50 },
    { id: 2, type: 'process', label: 'Process Data', x: 200, y: 100 },
    { id: 3, type: 'end', label: 'End', x: 350, y: 50 },
  ]);

  const tabs = [
    { id: 'visual', label: 'Visual Flow', icon: Workflow },
    { id: 'notes', label: 'Notepad', icon: FileText },
    { id: 'rich', label: 'Rich Editor', icon: Palette },
  ];

  const saveNote = () => {
    if (noteContent.trim()) {
      const newFile = {
        id: `note-${Date.now()}`,
        name: `note-${Date.now()}.txt`,
        type: 'document' as const,
        content: noteContent,
        position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      };
      dispatch({ type: 'ADD_FILE', payload: newFile });
      alert('Note saved to workspace!');
    }
  };

  const runFlow = () => {
    alert('Executing visual flow...\nFlow completed successfully!');
  };

  const previewFlow = () => {
    alert('Previewing flow execution...');
  };

  const addFlowNode = () => {
    const newNode = {
      id: Date.now(),
      type: 'process',
      label: 'New Node',
      x: Math.random() * 200 + 100,
      y: Math.random() * 150 + 100,
    };
    setFlowNodes([...flowNodes, newNode]);
  };

  return (
    <div className="space-y-4">
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

      {/* Visual Flow Editor */}
      {activeTab === 'visual' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Visual Flow Editor</h3>
            <div className="flex gap-2">
              <button
                onClick={addFlowNode}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-green-500/20"
              >
                + Node
              </button>
              <button
                onClick={previewFlow}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
              <button
                onClick={runFlow}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
            {flowNodes.map((node) => (
              <div
                key={node.id}
                className="absolute bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-400/30 rounded-lg p-2 text-xs text-white cursor-move hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                style={{ left: node.x, top: node.y }}
              >
                <div className="font-medium">{node.label}</div>
                <div className="text-gray-400 text-xs">{node.type}</div>
              </div>
            ))}
            
            {flowNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div>Drag nodes to build your flow</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notepad */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Quick Notes</h3>
            <button
              onClick={saveNote}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              Save Note
            </button>
          </div>
          
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your notes here..."
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-3 text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none resize-none transition-all duration-300"
            rows={12}
          />
        </div>
      )}

      {/* Rich Text Editor */}
      {activeTab === 'rich' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Rich Text Editor</h3>
            <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20">
              Export HTML
            </button>
          </div>
          
          {/* Formatting Toolbar */}
          <div className="flex gap-1 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
            <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
              <strong>B</strong>
            </button>
            <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
              <em>I</em>
            </button>
            <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
              <u>U</u>
            </button>
            <div className="w-px bg-gray-600 mx-1" />
            <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors text-xs">
              H1
            </button>
            <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors text-xs">
              H2
            </button>
          </div>
          
          <div
            contentEditable
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-3 text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none min-h-[200px] transition-all duration-300"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            Start typing your rich content here...
          </div>
        </div>
      )}
    </div>
  );
}