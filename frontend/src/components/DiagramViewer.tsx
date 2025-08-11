import React, { useState, useRef, useCallback, useEffect } from 'react';

interface DiagramViewerProps {
  svgContent: string;
  isLoading: boolean;
  error: string | null;
  serverStatus?: 'checking' | 'online' | 'offline';
}

const DiagramViewer: React.FC<DiagramViewerProps> = ({ svgContent, isLoading, error, serverStatus = 'online' }) => {
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Allow dragging at any zoom level
    e.preventDefault(); // Prevent default drag behavior
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault(); // Prevent default behavior during drag
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.max(25, Math.min(300, prev + delta)));
  }, []);

  // Add wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (container && svgContent) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel, svgContent]);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (svgContent && containerRef.current?.contains(document.activeElement)) {
        if (e.key === '+' || (e.ctrlKey && e.key === '=')) {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-' || (e.ctrlKey && e.key === '-')) {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0' || (e.ctrlKey && e.key === '0')) {
          e.preventDefault();
          handleZoomReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [svgContent, handleZoomIn, handleZoomOut, handleZoomReset]);
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b bg-gray-200 border-gray-200 h-14">
        <div className="flex items-center justify-between h-full">
          <h2 className="text-lg font-semibold text-gray-700">Diagram Preview</h2>
        
          {svgContent && !isLoading && !error && (
            <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom Out"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="text-sm font-mono text-gray-700 min-w-[3rem] text-center">
                {zoom}%
              </span>
              
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom In"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button
                onClick={handleZoomReset}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors text-xs font-medium text-gray-600"
                title="Reset Zoom & Position"
              >
                Reset
              </button>
            </div>
            
            {/* Zoom Info */}
            <div className="text-xs text-gray-500 bg-blue-50 text-blue-700 px-2 py-1 rounded">
              💡 Drag to pan
            </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-white">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">
                {serverStatus === 'checking' ? 'Connecting to Java server...' : 'Generating diagram...'}
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {svgContent && !isLoading && !error && (
          <div 
            ref={containerRef}
            className={`h-full overflow-hidden relative bg-gray-50 ${
              isDragging ? 'select-none' : ''
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: isDragging ? 'none' : 'auto',
              WebkitUserSelect: isDragging ? 'none' : 'auto',
              MozUserSelect: isDragging ? 'none' : 'auto'
            }}
          >
            <div 
              className="flex justify-center items-center h-full transition-transform duration-200 ease-out"
              style={{ 
                transform: `scale(${zoom / 100}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center',
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
            >
              <div 
                className={`bg-white shadow-lg rounded-lg border border-gray-200 max-w-full ${
                  isDragging ? 'select-none pointer-events-none' : ''
                }`}
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}
                onDragStart={(e) => e.preventDefault()}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
            
            {/* Zoom indicator */}
            {zoom !== 100 && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {zoom}%
              </div>
            )}
          </div>
        )}
        
        {!svgContent && !isLoading && !error && (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center text-gray-500 max-w-md">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-6">
                {serverStatus === 'offline' ? (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {serverStatus === 'offline' ? 'Server Offline' : 'Ready to Generate'}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {serverStatus === 'offline' 
                  ? 'Java PlantUML server is not running. Please start the server first.' 
                  : 'Enter PlantUML code in the editor to see your diagram here. You can zoom, pan, and interact with the generated diagrams.'
                }
              </p>
              
              {serverStatus === 'online' && (
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Zoom with wheel</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5T6.5 15a1.5 1.5 0 01-3 0V9.5m3.5 1v5a7.5 7.5 0 00-15 0v-5m6 0v5a1.5 1.5 0 01-3 0V9.5z" />
                    </svg>
                    <span>Drag to pan</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramViewer;
