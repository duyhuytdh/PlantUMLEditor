export interface DiagramHistory {
  id: string;
  title: string;
  plantumlCode: string;
  timestamp: number;
  preview?: string; // First few lines for preview
}

const STORAGE_KEY = 'plantuml_diagram_history';
export const MAX_HISTORY_ITEMS = 100;

export class HistoryService {
  static saveToHistory(plantumlCode: string, customTitle?: string): DiagramHistory {
    const histories = this.getHistories();
    
    // Generate title from code or use custom title
    const title = customTitle || this.generateTitleFromCode(plantumlCode);
    
    // Create new history item
    const newHistory: DiagramHistory = {
      id: Date.now().toString(),
      title,
      plantumlCode,
      timestamp: Date.now(),
      preview: this.generatePreview(plantumlCode)
    };

    // Add to beginning of array
    histories.unshift(newHistory);

    // Keep only last 10 items
    if (histories.length > MAX_HISTORY_ITEMS) {
      histories.splice(MAX_HISTORY_ITEMS);
    }

    // Save to localStorage
    this.saveHistories(histories);
    
    return newHistory;
  }

  static getHistories(): DiagramHistory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  static deleteHistory(id: string): void {
    const histories = this.getHistories();
    const filtered = histories.filter(h => h.id !== id);
    this.saveHistories(filtered);
  }

  static clearAllHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private static saveHistories(histories: DiagramHistory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  private static generateTitleFromCode(code: string): string {
    const lines = code.split('\n').filter(line => line.trim());
    
    // Look for title directive
    const titleLine = lines.find(line => line.trim().startsWith('title '));
    if (titleLine) {
      return titleLine.replace('title ', '').trim();
    }

    // Look for @startuml with name
    const startLine = lines.find(line => line.trim().startsWith('@startuml'));
    if (startLine && startLine.trim().length > '@startuml'.length) {
      return startLine.replace('@startuml', '').trim();
    }

    // Look for diagram type patterns
    const typePatterns = [
      { pattern: /class\s+(\w+)/, type: 'Class Diagram' },
      { pattern: /participant\s+(\w+)/, type: 'Sequence Diagram' },
      { pattern: /state\s+(\w+)/, type: 'State Diagram' },
      { pattern: /component\s+(\w+)/, type: 'Component Diagram' },
      { pattern: /actor\s+(\w+)/, type: 'Use Case Diagram' }
    ];

    for (const { pattern, type } of typePatterns) {
      const match = code.match(pattern);
      if (match) {
        return `${type}: ${match[1]}`;
      }
    }

    // Default title with timestamp
    const date = new Date();
    return `Diagram ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  private static generatePreview(code: string): string {
    const lines = code.split('\n')
      .filter(line => line.trim())
      .filter(line => !line.trim().startsWith('@'))
      .filter(line => !line.trim().startsWith('!'))
      .slice(0, 3);
    
    return lines.join('\n').substring(0, 100) + (lines.join('\n').length > 100 ? '...' : '');
  }
}
