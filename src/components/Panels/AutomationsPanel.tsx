import { useState } from 'react';
import { Zap, Play, Clock, CheckCircle } from 'lucide-react';
import { AutomationRecipe } from '../../types';

const automationRecipes: AutomationRecipe[] = [
  {
    id: 'bootstrap-app',
    name: 'Bootstrap New App',
    description: 'Scaffold React/Vue app with CI setup',
    icon: '🚀',
    category: 'development',
    steps: ['Create repo', 'Setup CI', 'Deploy staging'],
  },
  {
    id: 'text-to-code',
    name: 'Text-to-Code Snippet',
    description: 'Generate code from natural language',
    icon: '💬',
    category: 'development',
    steps: ['Process prompt', 'Generate code', 'Insert into editor'],
  },
  {
    id: 'publish-product',
    name: 'Publish Product to Shopify',
    description: 'Upload product with images and inventory',
    icon: '🛍️',
    category: 'ecommerce',
    steps: ['Create product', 'Upload images', 'Set inventory', 'Notify team'],
  },
  {
    id: 'social-post',
    name: 'Post to Facebook',
    description: 'Auto-post new products to Facebook',
    icon: '📱',
    category: 'marketing',
    steps: ['Fetch product', 'Generate caption', 'Post to Facebook'],
  },
  {
    id: 'sales-funnel',
    name: 'Build Sales Funnel',
    description: 'Create landing page with email sequence',
    icon: '🎯',
    category: 'marketing',
    steps: ['Design landing page', 'Setup email sequence', 'Configure analytics'],
  },
  {
    id: 'marketing-doc',
    name: 'Generate Marketing Doc',
    description: 'AI-generated marketing copy',
    icon: '📝',
    category: 'content',
    steps: ['Generate copy', 'Save to Drive', 'Version control'],
  },
  {
    id: 'deploy-firebase',
    name: 'Deploy to Firebase',
    description: 'Build, test, and deploy to Firebase',
    icon: '🔥',
    category: 'deployment',
    steps: ['Run tests', 'Build project', 'Deploy', 'Notify team'],
  },
  {
    id: 'optimize-files',
    name: 'Optimize & Clean Files',
    description: 'Compress images and clean code',
    icon: '🧹',
    category: 'development',
    steps: ['Compress images', 'Lint code', 'Archive logs'],
  },
  {
    id: 'create-invoice',
    name: 'Create & Send Invoice',
    description: 'Generate and email invoice PDF',
    icon: '📄',
    category: 'content',
    steps: ['Pull client data', 'Generate PDF', 'Send email'],
  },
  {
    id: 'voice-to-code',
    name: 'Voice-to-Code',
    description: 'Record voice and generate code',
    icon: '🎤',
    category: 'development',
    steps: ['Record voice', 'Transcribe', 'Generate code'],
  },
];

export function AutomationsPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [runningAutomations, setRunningAutomations] = useState<Set<string>>(new Set());

  const categories = ['all', 'development', 'ecommerce', 'marketing', 'content', 'deployment'];

  const filteredRecipes = selectedCategory === 'all' 
    ? automationRecipes 
    : automationRecipes.filter(recipe => recipe.category === selectedCategory);

  const runAutomation = async (recipe: AutomationRecipe) => {
    setRunningAutomations(prev => new Set([...prev, recipe.id]));
    
    try {
      const response = await fetch('/api/automations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationId: recipe.id, automation: recipe })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Automation "${recipe.name}" completed:`, result);
      } else {
        throw new Error('Automation execution failed');
      }
    } catch (error) {
      console.error('Automation failed:', error);
    } finally {
      setTimeout(() => {
        setRunningAutomations(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipe.id);
          return newSet;
        });
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
          <Zap className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Automation Center</h3>
          <p className="text-gray-400 text-sm">One-click workflow automation</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-gray-400 text-sm font-medium">Filter by Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-300 border ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-cyan-300 border-gray-600/50 hover:border-cyan-400/30'
              }`}
              aria-label={`Filter automations by ${category} category`}
              type="button"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Automation Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredRecipes.map((recipe) => {
          const isRunning = runningAutomations.has(recipe.id);
          return (
            <div
              key={recipe.id}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-400/30 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{recipe.icon}</div>
                  <div>
                    <h4 className="text-white font-medium text-sm group-hover:text-cyan-300 transition-colors">
                      {recipe.name}
                    </h4>
                    <p className="text-gray-400 text-xs">{recipe.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => runAutomation(recipe)}
                  disabled={isRunning}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isRunning
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 animate-pulse'
                      : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-400/30 hover:from-cyan-500/30 hover:to-blue-500/30 hover:shadow-lg hover:shadow-cyan-500/20'
                  }`}
                  aria-label={isRunning ? `${recipe.name} automation is running` : `Run ${recipe.name} automation`}
                  type="button"
                >
                  {isRunning ? <Clock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {recipe.steps.length} steps
                </div>
                {isRunning && (
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
                    Running...
                  </div>
                )}
              </div>
              
              {/* Progress steps when running */}
              {isRunning && (
                <div className="mt-3 space-y-1">
                  {recipe.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg p-3 border border-gray-700/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-cyan-400 font-bold text-lg">{automationRecipes.length}</div>
            <div className="text-gray-400 text-xs">Available</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">{runningAutomations.size}</div>
            <div className="text-gray-400 text-xs">Running</div>
          </div>
        </div>
      </div>
    </div>
  );
}
