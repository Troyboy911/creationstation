import { useState } from 'react';
import { Search, Plus, Link, Tag, BookOpen } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export function KnowledgePanel() {
  const { dispatch } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, title: 'Project Ideas', content: 'List of potential projects...', tags: ['ideas', 'projects'], connections: [] },
    { id: 2, title: 'API Documentation', content: 'Important API endpoints...', tags: ['docs', 'api'], connections: [1] },
    { id: 3, title: 'Design Patterns', content: 'Common design patterns...', tags: ['design', 'patterns'], connections: [] },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const createNewNote = () => {
    if (newNoteTitle.trim()) {
      const newNote = {
        id: Date.now(),
        title: newNoteTitle,
        content: '',
        tags: [],
        connections: [],
      };
      setNotes([...notes, newNote]);
      setNewNoteTitle('');
    }
  };

  const openNote = (noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      const newFile = {
        id: `note-${noteId}`,
        name: `${note.title}.md`,
        type: 'document' as const,
        content: note.content,
        position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      };
      dispatch({ type: 'ADD_FILE', payload: newFile });
    }
  };

  const connectToTana = () => {
    alert('Connecting to Tana workspace...\nIntegration will be available soon!');
  };

  const exportKnowledge = () => {
    const exportData = JSON.stringify(notes, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'knowledge-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-400/30">
          <BookOpen className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Knowledge Base</h3>
          <p className="text-gray-400 text-sm">Notes, docs & connections</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge base..."
          className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-3 py-2 text-sm border border-gray-700 focus:border-yellow-500 focus:outline-none transition-all duration-300"
        />
      </div>

      {/* Add New Note */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          placeholder="New note title..."
          className="flex-1 bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-yellow-500 focus:outline-none transition-all duration-300"
          onKeyPress={(e) => e.key === 'Enter' && createNewNote()}
        />
        <button
          onClick={createNewNote}
          disabled={!newNoteTitle.trim()}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-yellow-500/20"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-yellow-400/30 rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 cursor-pointer group"
            onClick={() => openNote(note.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium text-sm group-hover:text-yellow-300 transition-colors">
                {note.title}
              </h4>
              {note.connections.length > 0 && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Link className="w-3 h-3" />
                  <span className="text-xs">{note.connections.length}</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-400 text-xs mb-2 line-clamp-2">
              {note.content || 'No content yet...'}
            </p>
            
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-400/30"
                  >
                    <Tag className="w-2 h-2" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Integrations */}
      <div className="space-y-2">
        <h4 className="text-gray-400 text-sm font-medium">Integrations</h4>
        <button
          onClick={connectToTana}
          className="w-full text-left bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-purple-600/30 hover:shadow-lg hover:shadow-purple-500/20"
        >
          🧠 Connect to Tana
        </button>
        <button
          onClick={exportKnowledge}
          className="w-full text-left bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-blue-600/30 hover:shadow-lg hover:shadow-blue-500/20"
        >
          📤 Export Knowledge Base
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg p-3 border border-gray-700/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-yellow-400 font-bold text-lg">{notes.length}</div>
            <div className="text-gray-400 text-xs">Notes</div>
          </div>
          <div>
            <div className="text-orange-400 font-bold text-lg">
              {notes.reduce((acc, note) => acc + note.connections.length, 0)}
            </div>
            <div className="text-gray-400 text-xs">Connections</div>
          </div>
        </div>
      </div>
    </div>
  );
}
