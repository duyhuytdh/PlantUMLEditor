import React, { useState, useEffect } from 'react';
import { DiagramHistory, HistoryService, MAX_HISTORY_ITEMS } from '../services/historyService';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadHistory: (plantumlCode: string) => void;
  currentCode: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  onLoadHistory, 
  currentCode 
}) => {
  const [histories, setHistories] = useState<DiagramHistory[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistories();
    }
  }, [isOpen]);

  const loadHistories = () => {
    const loadedHistories = HistoryService.getHistories();
    setHistories(loadedHistories);
  };

  const handleSaveCurrent = () => {
    if (!currentCode.trim()) {
      alert('No code to save!');
      return;
    }

    if (showSaveInput) {
      // Save with custom title
      HistoryService.saveToHistory(currentCode, saveTitle || undefined);
      setSaveTitle('');
      setShowSaveInput(false);
      loadHistories();
    } else {
      // Show input for custom title
      setShowSaveInput(true);
    }
  };

  const handleLoadHistory = (history: DiagramHistory) => {
    onLoadHistory(history.plantumlCode);
    onClose();
  };

  const handleDeleteHistory = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this history item?')) {
      HistoryService.deleteHistory(id);
      loadHistories();
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      HistoryService.clearAllHistory();
      loadHistories();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      const days = Math.floor(diffDays);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Diagram History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your saved PlantUML diagrams (max {MAX_HISTORY_ITEMS} items)
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Save Current Button */}
            {showSaveInput ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter title (optional)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCurrent();
                    if (e.key === 'Escape') {
                      setShowSaveInput(false);
                      setSaveTitle('');
                    }
                  }}
                />
                <button
                  onClick={handleSaveCurrent}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveInput(false);
                    setSaveTitle('');
                  }}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveCurrent}
                disabled={!currentCode.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save Current</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close history panel"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {histories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-300 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-600">Save your first diagram to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {histories.map((history) => (
                <div
                  key={history.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  onClick={() => handleLoadHistory(history)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {history.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimestamp(history.timestamp)}
                        </span>
                      </div>
                      
                      {history.preview && (
                        <div className="text-sm text-gray-600 bg-gray-100 rounded p-2 font-mono text-xs whitespace-pre-wrap mb-2">
                          {history.preview}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{history.plantumlCode.split('\n').length} lines</span>
                        <span>{history.plantumlCode.length} characters</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleLoadHistory(history)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Load this diagram"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => handleDeleteHistory(history.id, e)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete this history"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {histories.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {histories.length} of {MAX_HISTORY_ITEMS} slots used
            </div>
            
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
