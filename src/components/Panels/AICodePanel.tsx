import { useState } from 'react';
import { Mic, Code, Image, Sparkles, Copy, Plus } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { FileItem } from '../../types';
import { environment } from '../../config/environment';

const quickActions = [
  {
    label: '🚀 Bootstrap React App',
    action: (dispatch: React.Dispatch<{ type: 'ADD_FILE'; payload: FileItem }>) => {
      const files = [
        {
          id: `app-${Date.now()}`,
          name: 'App.jsx',
          type: 'code' as const,
          content: `import React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;`,
          position: { x: 100, y: 100 },
        },
        {
          id: `package-${Date.now()}`,
          name: 'package.json',
          type: 'code' as const,
          content: `{\n  "name": "react-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}`,
          position: { x: 150, y: 150 },
        }
      ];
      files.forEach(file => dispatch({ type: 'ADD_FILE', payload: file }));
    }
  },
  {
    label: '🎯 Generate API Endpoint',
    action: (dispatch: React.Dispatch<{ type: 'ADD_FILE'; payload: FileItem }>) => {
      const apiCode = `const express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  res.json({ users: [] });\n});\n\napp.listen(3000);`;
      const newFile = {
        id: `api-${Date.now()}`,
        name: 'server.js',
        type: 'code' as const,
        content: apiCode,
        position: { x: 200, y: 100 },
      };
      dispatch({ type: 'ADD_FILE', payload: newFile });
    }
  },
  {
    label: '🎨 Create UI Component',
    action: (dispatch: React.Dispatch<{ type: 'ADD_FILE'; payload: FileItem }>) => {
      const componentCode = `import React from 'react';\n\nexport function Button({ children, onClick }) {\n  return (\n    <button \n      onClick={onClick}\n      className="px-4 py-2 bg-blue-500 text-white rounded"\n    >\n      {children}\n    </button>\n  );\n}`;
      const newFile = {
        id: `component-${Date.now()}`,
        name: 'Button.jsx',
        type: 'code' as const,
        content: componentCode,
        position: { x: 250, y: 150 },
      };
      dispatch({ type: 'ADD_FILE', payload: newFile });
    }
  }
];

export function AICodePanel() {
  const { dispatch } = useWorkspace();
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCode = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI code generation with more realistic examples
    setTimeout(() => {
      const codeTemplates = {
        'react component': `import React from 'react';

export function ${prompt.replace(/[^a-zA-Z]/g, '')}Component() {
  return (
    <div className="p-4">
      <h2>Generated Component</h2>
      <p>Based on: "${prompt}"</p>
    </div>
  );
}`,
        'api endpoint': `app.get('/api/${prompt.replace(/\s+/g, '-').toLowerCase()}', async (req, res) => {
  try {
    // Generated based on: "${prompt}"
    const result = await processRequest(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,
        'default': `function ${prompt.replace(/\s+/g, '')}() {
  // Generated based on: "${prompt}"
  console.log('Executing ${prompt}');
  return true;
}`
      };
      
      const promptLower = prompt.toLowerCase();
      let code = codeTemplates.default;
      
      if (promptLower.includes('component') || promptLower.includes('react')) {
        code = codeTemplates['react component'];
      } else if (promptLower.includes('api') || promptLower.includes('endpoint')) {
        code = codeTemplates['api endpoint'];
      }
      
      setGeneratedCode(code);
      setIsGenerating(false);
    }, 1500);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setPrompt('Create a login form with validation');
        setIsRecording(false);
      }, 3000);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const addToEditor = () => {
    // Add code to workspace as a file
    const newFile = {
      id: `code-${Date.now()}`,
      name: `generated-${prompt.replace(/\s+/g, '-').toLowerCase()}.js`,
      type: 'code' as const,
      content: generatedCode,
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
    };
    dispatch({ type: 'ADD_FILE', payload: newFile });
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const apiKeys = JSON.parse(sessionStorage.getItem('creation-station-api-keys') || '{}');
      const openaiKey = apiKeys.openai || environment.openai.apiKey;
      
      if (!openaiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const imageUrl = data.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from API');
      }
      
      const newFile = {
        id: `image-${Date.now()}`,
        name: `generated-${imagePrompt.replace(/\s+/g, '-').toLowerCase()}.jpg`,
        type: 'image' as const,
        url: imageUrl,
        position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      };
      
      dispatch({ type: 'ADD_FILE', payload: newFile });
      setImagePrompt('');
      
    } catch (error) {
      console.error('Image generation failed:', error);
      
      const fallbackImages = [
        'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
        'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
        'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg',
      ];
      
      const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
      
      const newFile = {
        id: `image-${Date.now()}`,
        name: `fallback-${imagePrompt.replace(/\s+/g, '-').toLowerCase()}.jpg`,
        type: 'image' as const,
        url: randomImage,
        position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      };
      
      dispatch({ type: 'ADD_FILE', payload: newFile });
      setImagePrompt('');
      console.error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Using fallback image.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt })
      });
      
      if (response.ok) {
        const result = await response.json();
        const newFile = {
          id: `video-${Date.now()}`,
          name: `generated-video-${Date.now()}.mp4`,
          type: 'video' as const,
          url: result.videoUrl,
          position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
        };
        dispatch({ type: 'ADD_FILE', payload: newFile });
      } else {
        throw new Error('Video generation API failed');
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      
      const newFile = {
        id: `video-${Date.now()}`,
        name: `generated-video-${Date.now()}.mp4`,
        type: 'video' as const,
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      };
      dispatch({ type: 'ADD_FILE', payload: newFile });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Text-to-Code */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Code className="w-4 h-4" />
          Text-to-Code Generator
        </h3>
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build..."
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            rows={3}
            aria-label="Code generation prompt"
          />
          <div className="flex gap-2">
            <button
              onClick={handleGenerateCode}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-500 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
              aria-label={isGenerating ? 'Generating code...' : 'Generate code from prompt'}
              type="button"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Code'}
            </button>
            <button
              onClick={handleVoiceRecord}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 animate-pulse shadow-lg shadow-red-500/40' 
                  : 'bg-gray-700 hover:bg-gray-600 hover:shadow-lg hover:shadow-gray-500/20'
              }`}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
              type="button"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generated Code Output */}
      {generatedCode && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-medium mb-3">Generated Code</h3>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-sm overflow-x-auto">
            <code>{generatedCode}</code>
          </pre>
          <div className="flex gap-2 mt-3">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
              aria-label="Copy generated code to clipboard"
              type="button"
            >
              <Copy className="w-3 h-3" />
              Copy to Clipboard
            </button>
            <button 
              onClick={addToEditor}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              aria-label="Add generated code to workspace editor"
              type="button"
            >
              <Plus className="w-3 h-3" />
              Add to Editor
            </button>
          </div>
        </div>
      )}

      {/* Image/Video Generation */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Visual Asset Generator
        </h3>
        <div className="space-y-3">
          <input
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            type="text"
            placeholder="Describe the image or video you need..."
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-purple-500 focus:outline-none transition-all duration-300"
            aria-label="Image and video generation prompt"
          />
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={generateImage}
              disabled={!imagePrompt.trim() || isGenerating}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
              aria-label={isGenerating ? 'Generating image...' : 'Generate image from prompt'}
              type="button"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </button>
            <button 
              onClick={generateVideo}
              disabled={!imagePrompt.trim() || isGenerating}
              className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 flex items-center justify-center gap-2"
              aria-label={isGenerating ? 'Generating video...' : 'Generate video from prompt'}
              type="button"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Video'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-gray-400 text-sm font-medium">Quick Actions</h4>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              onClick={() => action.action(dispatch)}
              className="text-left bg-gray-800/30 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-gray-700 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
