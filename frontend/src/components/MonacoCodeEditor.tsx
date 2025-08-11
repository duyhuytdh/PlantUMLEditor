import React, { useRef, useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { getPlantUMLSuggestions, plantUMLHoverInfo } from '../config/plantuml-suggestions';

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  onSaveHistory?: () => void;
  placeholder?: string;
  debounceMs?: number;
}

const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({ 
  value, 
  onChange, 
  onDebouncedChange,
  onSaveHistory,
  placeholder,
  debounceMs = 3000 
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  const debouncedCallback = useCallback((newValue: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = window.setTimeout(() => {
      if (onDebouncedChange) {
        onDebouncedChange(newValue);
      }
    }, debounceMs);
  }, [onDebouncedChange, debounceMs]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    try {
      // Check if language is already registered
      const existingLanguages = monacoInstance.languages.getLanguages();
      const plantumlExists = existingLanguages.some(lang => lang.id === 'plantuml');
      
      if (!plantumlExists) {
        // Register PlantUML language
        monacoInstance.languages.register({ id: 'plantuml' });

        // Set language configuration
        monacoInstance.languages.setLanguageConfiguration('plantuml', {
          comments: {
            lineComment: "'",
            blockComment: ["/'", "'/"]
          },
          brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
          ],
          autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
          surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ]
        });

        // Set Monarch tokenizer for PlantUML
        monacoInstance.languages.setMonarchTokensProvider('plantuml', {
          keywords: [
            'startuml', 'enduml', 'startdot', 'enddot', 'startsalt', 'endsalt',
            'actor', 'participant', 'class', 'object', 'interface', 'enum',
            'component', 'node', 'folder', 'frame', 'cloud', 'database', 'storage',
            'artifact', 'boundary', 'control', 'entity', 'rectangle', 'agent',
            'note', 'title', 'header', 'footer', 'legend', 'skinparam',
            'activate', 'deactivate', 'create', 'destroy', 'ref', 'alt', 'else',
            'opt', 'loop', 'par', 'break', 'critical', 'group', 'end',
            'if', 'then', 'endif', 'elseif', 'switch', 'case', 'endswitch',
            'while', 'endwhile', 'repeat', 'fork', 'again', 'split',
            'namespace', 'package', 'state', 'hide', 'show', 'autonumber',
            'newpage', 'left', 'right', 'top', 'bottom', 'center', 'over',
            'of', 'on', 'link', 'as'
          ],

          operators: [
            '->','-->','<-','<--','<->','<-->','-','--','=','==',
          ],

          // Define token patterns
          tokenizer: {
            root: [
              // Start/End directives (highest priority)
              [/@(start|end)(uml|dot|salt)\b/, 'keyword.control'],
              
              // Comments
              [/'.*$/, 'comment'],
              [/\/\*/, 'comment', '@comment'],
              
              // Preprocessor directives
              [/^!\w+/, 'keyword.preprocessor'],
              
              // Keywords
              [/\b(?:actor|participant|class|object|interface|enum|component|node|folder|frame|cloud|database|storage|artifact|boundary|control|entity|rectangle|agent|note|title|header|footer|legend|skinparam|activate|deactivate|create|destroy|ref|alt|else|opt|loop|par|break|critical|group|end|if|then|endif|elseif|switch|case|endswitch|while|endwhile|repeat|fork|again|split|namespace|package|state|hide|show|autonumber|newpage|left|right|top|bottom|center|over|of|on|link|as)\b/, 'keyword'],
              
              // Strings
              [/"([^"\\]|\\.)*$/, 'string.invalid'],
              [/"/, 'string', '@string'],
              
              // Colors (hex)
              [/#[0-9A-Fa-f]{6}\b/, 'number.hex'],
              [/#[0-9A-Fa-f]{3}\b/, 'number.hex'],
              
              // Arrows and connections
              [/(<-+>|->+|<-+|-->+|<-->+|-+>|=+>|<=+>|<==+>|==+>)/, 'operator.arrow'],
              [/[-=\.]{2,}/, 'operator'],
              
              // Numbers
              [/\d+/, 'number'],
              
              // Brackets
              [/[{}()\[\]]/, '@brackets'],
              
              // Delimiters
              [/[;,.]/, 'delimiter'],
              
              // Identifiers
              [/[a-zA-Z_]\w*/, 'identifier']
            ],
            
            comment: [
              [/[^\/*]+/, 'comment'],
              [/\*\//, 'comment', '@pop'],
              [/[\/*]/, 'comment']
            ],
            
            string: [
              [/[^\\"]+/, 'string'],
              [/\\./, 'string.escape'],
              [/"/, 'string', '@pop']
            ]
          }
        });

        // Register completion provider for PlantUML
        monacoInstance.languages.registerCompletionItemProvider('plantuml', {
          provideCompletionItems: (model, position) => {
            console.log('Completion provider triggered');
            console.log('Current language:', model.getLanguageId());
            
            const word = model.getWordUntilPosition(position);
            const lineContent = model.getLineContent(position.lineNumber);
            const textBeforeCursor = lineContent.substring(0, position.column - 1);
            
            console.log('Current word:', word);
            console.log('Line content:', lineContent);
            console.log('Text before cursor:', textBeforeCursor);
            
            // Check if we're typing after @ symbol
            const atSymbolMatch = textBeforeCursor.match(/@(\w*)$/);
            let range;
            
            if (atSymbolMatch) {
              // If typing after @, include the @ in the range to replace
              const startColumn = position.column - atSymbolMatch[0].length;
              range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: startColumn,
                endColumn: position.column
              };
              console.log('@ symbol detected, range:', range);
            } else {
              // Default range for regular words
              range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
              };
            }

            const suggestions = getPlantUMLSuggestions(monacoInstance, range);
            console.log('Suggestions count:', suggestions.length);
            console.log('First 5 suggestions:', suggestions.slice(0, 5).map(s => s.label));
            
            return { suggestions: suggestions };
          },
          triggerCharacters: ['@', 's', 'c', 'a', 'p', 'n', 't', 'l', 'u', '-', ' '] // Add space and common starting letters
        });

        // Register hover provider for PlantUML
        monacoInstance.languages.registerHoverProvider('plantuml', {
          provideHover: (model, position) => {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const info = plantUMLHoverInfo[word.word];
            if (info) {
              return {
                range: new monacoInstance.Range(
                  position.lineNumber,
                  word.startColumn,
                  position.lineNumber,
                  word.endColumn
                ),
                contents: [
                  { value: `**${word.word}**` },
                  { value: info }
                ]
              };
            }

            return null;
          }
        });
      }

      // Define custom themes for PlantUML
      monacoInstance.editor.defineTheme('plantuml-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword.control', foreground: '0066cc', fontStyle: 'bold' },
          { token: 'keyword.preprocessor', foreground: 'ff6600', fontStyle: 'bold' },
          { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
          { token: 'operator.arrow', foreground: 'dc2626', fontStyle: 'bold' },
          { token: 'operator', foreground: 'dc2626' },
          { token: 'comment', foreground: '16a34a', fontStyle: 'italic' },
          { token: 'string', foreground: 'ea580c' },
          { token: 'string.invalid', foreground: 'ef4444', fontStyle: 'underline' },
          { token: 'string.escape', foreground: '059669', fontStyle: 'bold' },
          { token: 'number.hex', foreground: '7c2d12', fontStyle: 'bold' },
          { token: 'number', foreground: '059669' },
          { token: 'delimiter.bracket', foreground: '6b7280' },
          { token: 'delimiter', foreground: '6b7280' },
          { token: 'identifier', foreground: '374151' },
        ],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#000000',
          'editorLineNumber.foreground': '#999999',
          'editorLineNumber.activeForeground': '#0066cc',
        }
      });

      monacoInstance.editor.defineTheme('plantuml-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword.control', foreground: '60a5fa', fontStyle: 'bold' },
          { token: 'keyword.preprocessor', foreground: 'fb923c', fontStyle: 'bold' },
          { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
          { token: 'operator.arrow', foreground: 'f87171', fontStyle: 'bold' },
          { token: 'operator', foreground: 'f87171' },
          { token: 'comment', foreground: '4ade80', fontStyle: 'italic' },
          { token: 'string', foreground: 'fb923c' },
          { token: 'string.invalid', foreground: 'f87171', fontStyle: 'underline' },
          { token: 'string.escape', foreground: '34d399', fontStyle: 'bold' },
          { token: 'number.hex', foreground: 'a3a3a3', fontStyle: 'bold' },
          { token: 'number', foreground: '34d399' },
          { token: 'delimiter.bracket', foreground: '9ca3af' },
          { token: 'delimiter', foreground: '9ca3af' },
          { token: 'identifier', foreground: 'e5e7eb' },
        ],
        colors: {
          'editor.background': '#1e293b',
          'editor.foreground': '#f1f5f9',
          'editorLineNumber.foreground': '#64748b',
          'editorLineNumber.activeForeground': '#60a5fa',
        }
      });

      // Set the initial theme
      monacoInstance.editor.setTheme('plantuml-light');

      // Switch to PlantUML language
      const model = editor.getModel();
      if (model) {
        monacoInstance.editor.setModelLanguage(model, 'plantuml');
        console.log('Model language set to:', model.getLanguageId());
      } else {
        console.error('No model found for editor');
      }

      // Add keyboard shortcuts
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
        // Trigger diagram generation
        const event = new CustomEvent('generateDiagram');
        window.dispatchEvent(event);
      });

      // Add manual trigger for suggestions
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Space, () => {
        console.log('Manual trigger suggestions');
        editor.trigger('manual', 'editor.action.triggerSuggest', {});
      });

    } catch (error) {
      console.error('Monaco Editor configuration error:', error);
      // Fallback to text language if PlantUML registration fails
      console.log('Falling back to text language');
    }

    // Focus the editor
    editor.focus();
  };

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    if (editorRef.current && monacoRef.current) {
      const themeName = newTheme ? 'plantuml-dark' : 'plantuml-light';
      monacoRef.current.editor.setTheme(themeName);
      console.log('Theme switched to:', themeName);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    onChange(newValue);
    
    // Trigger debounced callback for diagram generation
    debouncedCallback(newValue);
  };

  return (
    <div className="h-full flex flex-col">
      <div className={`px-4 py-2 border-b transition-colors h-14 ${
        isDarkTheme 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-gray-200 border-gray-200'
      }`}>
        <div className="flex items-center justify-between h-full">
          <h2 className={`text-lg font-semibold transition-colors ${
            isDarkTheme ? 'text-slate-200' : 'text-gray-700'
          }`}>
            PlantUML Editor
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                isDarkTheme 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
            >
              {isDarkTheme ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
            </button>

            {/* Save History Button */}
            {onSaveHistory && (
              <button
                onClick={onSaveHistory}
                disabled={!value.trim()}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                  isDarkTheme 
                    ? 'bg-purple-700 hover:bg-purple-600 text-purple-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title="Save current diagram to history"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save</span>
              </button>
            )}

            <div className={`flex items-center space-x-2 text-xs transition-colors ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <span>Monaco Editor</span>
              <span>•</span>
              <span>PlantUML Syntax</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <Editor
          height="100%"
          language="plaintext"
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Monaco, Menlo, 'Ubuntu Mono', monospace",
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
            },
            suggest: {
              showWords: true,
              showMethods: true,
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showOperators: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showTypeParameters: true,
              filterGraceful: true,
              snippetsPreventQuickSuggestions: false,
              localityBonus: true,
              shareSuggestSelections: false,
              showIcons: true,
              insertMode: 'insert'
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            parameterHints: { enabled: true },
            placeholder: placeholder || 'Enter your PlantUML code here...',
          }}
        />
      </div>
    </div>
  );
};

export default MonacoCodeEditor;
