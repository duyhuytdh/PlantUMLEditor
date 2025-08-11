import React, { useState, useCallback, useEffect, useRef } from 'react';
import MonacoCodeEditor from './components/MonacoCodeEditor';
import DiagramViewer from './components/DiagramViewer';
import HistoryPanel from './components/HistoryPanel';
import { PlantUMLService } from './services/plantuml';
import { HistoryService } from './services/historyService';

const DEFAULT_PLANTUML = `@startuml
!theme plain
title Simple Sequence Diagram

Alice -> Bob: Hello Bob, how are you?
Bob --> Alice: I am good thanks!
Alice -> Bob: Can you help me with something?
Bob --> Alice: Sure, what do you need?

@enduml`;

function App() {
  const [plantumlCode, setPlantumlCode] = useState(DEFAULT_PLANTUML);
  const [svgContent, setSvgContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const hasInitialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkServerStatus = useCallback(async () => {
    try {
      await PlantUMLService.healthCheck();
      setServerStatus('online');
      return true;
    } catch {
      setServerStatus('offline');
      return false;
    }
  }, []);

  const generateDiagram = useCallback(async (code: string) => {
    if (!code.trim()) {
      setSvgContent('');
      setError(null);
      return;
    }

    // Don't generate if server is not online
    if (serverStatus !== 'online') {
      if (serverStatus === 'checking') {
        // When checking, just wait - don't show error, user will see loading state
        return;
      } else {
        // Only show error when server is definitely offline
        setError('Server is not available. Please make sure Java PlantUML server is running on port 8090.');
      }
      return;
    }

    // Don't start a new request if already loading
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add timeout and retry logic for API call
      const response = await Promise.race([
        PlantUMLService.generateSVG(code),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]) as any;
      
      setSvgContent(response.svg);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // If it's a timeout or network error, try to check server status
      if (errorMessage.includes('timeout') || errorMessage.includes('Network')) {
        const isServerOnline = await checkServerStatus();
        if (!isServerOnline) {
          setError('Server connection lost. Please check if Java PlantUML server is running on port 8090.');
        } else {
          setError('Request timeout. Please try again.');
        }
      } else {
        setError(errorMessage);
      }
      setSvgContent('');
    } finally {
      setIsLoading(false);
    }
  }, [serverStatus, checkServerStatus, isLoading]);

  useEffect(() => {
    const initializeApp = async () => {
      // Prevent multiple initializations
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      
      // Try to check server status with retry
      let attempts = 0;
      const maxAttempts = 10;
      setRetryAttempt(0);
      
      while (attempts < maxAttempts) {
        setRetryAttempt(attempts + 1);
        const isServerOnline = await checkServerStatus();
        if (isServerOnline) {
          // Server is online, generate diagram if we have code
          if (plantumlCode.trim()) {
            // Add a small delay to ensure server is fully ready
            setTimeout(() => {
              generateDiagram(plantumlCode);
            }, 100);
          }
          setRetryAttempt(0);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          const delay = Math.min(500 + (attempts * 200), 2000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      setRetryAttempt(0);
    };
    
    // Add event listener for Monaco Editor Ctrl+Enter
    const handleGenerateDiagram = () => {
      if (serverStatus === 'online' && plantumlCode.trim()) {
        generateDiagram(plantumlCode);
      }
    };
    
    window.addEventListener('generateDiagram', handleGenerateDiagram);
    
    initializeApp();
    
    return () => {
      window.removeEventListener('generateDiagram', handleGenerateDiagram);
    };
  }, []);

  // Separate effect to handle server status changes (but not initial load)
  useEffect(() => {
    // Only run if already initialized and server comes online
    if (hasInitialized.current && serverStatus === 'online' && plantumlCode.trim() && !svgContent && !isLoading) {
      const timeoutId = setTimeout(() => {
        generateDiagram(plantumlCode);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [serverStatus]);

  const handleCodeChange = useCallback((newCode: string) => {
    setPlantumlCode(newCode);
    // No debouncing here - just update the code immediately
    // Diagram generation will be handled by onDebouncedChange
  }, []);

  const handleDebouncedCodeChange = useCallback((newCode: string) => {
    // Only generate if server is online
    if (serverStatus === 'online') {
      generateDiagram(newCode);
    }
  }, [generateDiagram, serverStatus]);

  const handleRefresh = () => {
    generateDiagram(plantumlCode);
  };

  const handleRetryConnection = async () => {
    setServerStatus('checking');
    const isServerOnline = await checkServerStatus();
    if (isServerOnline && plantumlCode.trim()) {
      generateDiagram(plantumlCode);
    }
  };

  const handleClear = () => {
    setPlantumlCode('');
    setSvgContent('');
    setError(null);
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setIsHistoryOpen(false);
  };

  const handleLoadFromHistory = (historicalCode: string) => {
    setPlantumlCode(historicalCode);
    // Generate diagram if server is online
    if (serverStatus === 'online') {
      generateDiagram(historicalCode);
    }
  };

  const handleSaveHistory = useCallback(() => {
    if (!plantumlCode.trim()) {
      alert('No code to save!');
      return;
    }

    try {
      const savedHistory = HistoryService.saveToHistory(plantumlCode);
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
      notification.textContent = `Saved: ${savedHistory.title}`;
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    } catch (error) {
      console.error('Error saving to history:', error);
      alert('Failed to save to history. Please try again.');
    }
  }, [plantumlCode]);

  // Handle resizing panels
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
    setLeftPanelWidth(constrainedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Double-click to reset to 50-50
  const handleDoubleClick = useCallback(() => {
    setLeftPanelWidth(50);
  }, []);

  // Preset panel sizes
  const handlePresetSize = useCallback((percentage: number) => {
    setLeftPanelWidth(percentage);
  }, []);

  // Add event listeners for mouse events
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PlantUML Editor</h1>
            <p className="text-sm text-gray-600">Create UML diagrams with PlantUML syntax</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Server Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' : 
                serverStatus === 'offline' ? 'bg-red-500' : 
                'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="text-sm text-gray-600">
                {serverStatus === 'checking' ? (
                  <>
                    <span className="animate-pulse">Connecting to Java server...</span>
                    {retryAttempt > 0 && <span className="text-xs text-gray-500"> (attempt {retryAttempt})</span>}
                  </>
                ) : (
                  `Server ${serverStatus}`
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Panel Layout Presets */}
              <div className="flex items-center space-x-1 mr-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1.5 shadow-sm border border-gray-100">
                <span className="text-xs text-gray-500 px-2 font-medium">Layout:</span>
                <button
                  onClick={() => handlePresetSize(25)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium ${
                    leftPanelWidth === 25 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border border-blue-400' 
                      : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 shadow-sm border border-gray-150 hover:border-blue-200'
                  }`}
                >
                  25%
                </button>
                <button
                  onClick={() => handlePresetSize(50)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium ${
                    leftPanelWidth === 50 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border border-blue-400' 
                      : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 shadow-sm border border-gray-150 hover:border-blue-200'
                  }`}
                >
                  50%
                </button>
                <button
                  onClick={() => handlePresetSize(75)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium ${
                    leftPanelWidth === 75 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border border-blue-400' 
                      : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 shadow-sm border border-gray-150 hover:border-blue-200'
                  }`}
                >
                  75%
                </button>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading || serverStatus !== 'online'}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200 border border-blue-400 hover:shadow-lg"
              >
                {isLoading ? 'Generating...' : 'Refresh'}
              </button>

              {/* History Button */}
              <button
                onClick={handleOpenHistory}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-md transition-all duration-200 border border-purple-400 hover:shadow-lg"
                title="View and manage diagram history"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>History</span>
              </button>

              {/* Retry Connection Button - show when server offline */}
              {serverStatus === 'offline' && (
                <button
                  onClick={handleRetryConnection}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-md transition-all duration-200 border border-orange-400 hover:shadow-lg"
                >
                  Retry Connection
                </button>
              )}
              
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 shadow-md transition-all duration-200 border border-gray-400 hover:shadow-lg"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex relative bg-white">
        {/* Left Panel - Code Editor */}
        <div 
          className="border-r border-gray-100 relative shadow-sm"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <MonacoCodeEditor
            value={plantumlCode}
            onChange={handleCodeChange}
            onDebouncedChange={handleDebouncedCodeChange}
            onSaveHistory={handleSaveHistory}
            placeholder="Enter your PlantUML code here..."
            debounceMs={3000}
          />
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 cursor-col-resize relative group transition-all duration-300 ${
            isResizing ? 'from-blue-100 to-blue-200 w-1 shadow-lg' : 'hover:shadow-md'
          }`}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          {/* Main resize line - elegant gradient */}
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent group-hover:via-blue-300 transition-all duration-300"></div>
          
          {/* Center dot indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-1 h-8 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-sm">
              <div className="w-0.5 h-6 bg-gradient-to-b from-white via-gray-50 to-white rounded-full"></div>
            </div>
          </div>
          
          {/* Invisible wider hover area */}
          <div className="absolute inset-y-0 -left-2 -right-2 w-5"></div>
          
          {/* Elegant tooltip */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3 bg-gray-800 text-white text-xs px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 pointer-events-none transform translate-x-2 group-hover:translate-x-0 border border-gray-700">
            <div className="font-medium">Resize panels</div>
            <div className="text-xs opacity-75 mt-0.5">Double-click to reset</div>
            {/* Arrow pointer */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-800 transform rotate-45 border-l border-b border-gray-700"></div>
          </div>
        </div>

        {/* Right Panel - Diagram Viewer */}
        <div 
          className="relative shadow-sm"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <DiagramViewer
            svgContent={svgContent}
            isLoading={isLoading || serverStatus === 'checking'}
            error={error}
            serverStatus={serverStatus}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-lg border border-gray-150 shadow-sm">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded text-xs font-mono shadow-sm">Ctrl+Enter</kbd>
              <span>to generate diagram</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
              <span>Editor:</span>
              <span className="font-mono text-blue-600 font-semibold">{Math.round(leftPanelWidth)}%</span>
              <span className="text-gray-300">|</span>
              <span>Viewer:</span>
              <span className="font-mono text-green-600 font-semibold">{Math.round(100 - leftPanelWidth)}%</span>
            </div>
          </div>
          <div>
            Learn more about <a 
              href="https://plantuml.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              PlantUML syntax
            </a>
          </div>
        </div>
      </footer>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={handleCloseHistory}
        onLoadHistory={handleLoadFromHistory}
        currentCode={plantumlCode}
      />
    </div>
  );
}

export default App;
