import * as monaco from 'monaco-editor';

export interface SuggestionItem {
  label: string;
  kind: monaco.languages.CompletionItemKind;
  insertText: string;
  insertTextRules?: monaco.languages.CompletionItemInsertTextRule;
  documentation: string;
  detail?: string;
  sortText?: string;
}

export const getPlantUMLSuggestions = (
  monacoInstance: typeof import('monaco-editor'),
  range: monaco.IRange
): monaco.languages.CompletionItem[] => {
  const suggestions: SuggestionItem[] = [
    // Basic diagram types
    {
      label: '@startuml',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: '@startuml\n$0\n@enduml',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Start a new UML diagram',
      detail: 'UML Diagram Start',
      sortText: '001'
    },
    {
      label: '@enduml',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: '@enduml',
      documentation: 'End UML diagram',
      detail: 'UML Diagram End',
      sortText: '002'
    },

    // Sequence diagram elements
    {
      label: 'actor',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'actor ${1:name} as ${2:alias}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define an actor in sequence diagram',
      detail: 'Sequence Diagram Element',
      sortText: '100'
    },
    {
      label: 'participant',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'participant ${1:name} as ${2:alias}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define a participant in sequence diagram',
      detail: 'Sequence Diagram Element',
      sortText: '101'
    },
    {
      label: 'activate',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'activate ${1:participant}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Activate a participant',
      detail: 'Sequence Diagram Control',
      sortText: '102'
    },
    {
      label: 'deactivate',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'deactivate ${1:participant}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Deactivate a participant',
      detail: 'Sequence Diagram Control',
      sortText: '103'
    },

    // Class diagram elements
    {
      label: 'class',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'class ${1:ClassName} {\n\t${2:+method()}\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define a class',
      detail: 'Class Diagram Element',
      sortText: '200'
    },
    {
      label: 'interface',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'interface ${1:InterfaceName} {\n\t${2:+method()}\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define an interface',
      detail: 'Class Diagram Element',
      sortText: '201'
    },
    {
      label: 'enum',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'enum ${1:EnumName} {\n\t${2:VALUE1}\n\t${3:VALUE2}\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define an enumeration',
      detail: 'Class Diagram Element',
      sortText: '202'
    },
    {
      label: 'abstract',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'abstract class ${1:AbstractClassName} {\n\t${2:+method()}\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define an abstract class',
      detail: 'Class Diagram Element',
      sortText: '203'
    },

    // Component diagram elements
    {
      label: 'component',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'component ${1:ComponentName}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define a component',
      detail: 'Component Diagram Element',
      sortText: '300'
    },
    {
      label: 'node',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'node ${1:NodeName}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define a node',
      detail: 'Component Diagram Element',
      sortText: '301'
    },
    {
      label: 'package',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'package ${1:PackageName} {\n\t${2:// content}\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define a package',
      detail: 'Component Diagram Element',
      sortText: '302'
    },
    {
      label: 'folder',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'folder ${1:FolderName}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define a folder',
      detail: 'Component Diagram Element',
      sortText: '303'
    },

    // State diagram elements
    {
      label: 'state',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'state ${1:StateName}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Define a state',
      detail: 'State Diagram Element',
      sortText: '400'
    },
    {
      label: '[*]',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: '[*]',
      documentation: 'Start/End state',
      detail: 'State Diagram Special',
      sortText: '401'
    },

    // Control flow
    {
      label: 'alt',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'alt ${1:condition}\n\t${2:// if true}\nelse\n\t${3:// if false}\nend',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Alternative sequence',
      detail: 'Control Flow',
      sortText: '500'
    },
    {
      label: 'opt',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'opt ${1:condition}\n\t${2:// optional sequence}\nend',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Optional sequence',
      detail: 'Control Flow',
      sortText: '501'
    },
    {
      label: 'loop',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'loop ${1:condition}\n\t${2:// repeated sequence}\nend',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Loop sequence',
      detail: 'Control Flow',
      sortText: '502'
    },
    {
      label: 'par',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'par\n\t${1:// parallel sequence 1}\nand\n\t${2:// parallel sequence 2}\nend',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Parallel sequence',
      detail: 'Control Flow',
      sortText: '503'
    },
    {
      label: 'critical',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'critical\n\t${1:// critical section}\nend',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Critical section',
      detail: 'Control Flow',
      sortText: '504'
    },

    // Arrows and connections
    {
      label: '->',
      kind: monacoInstance.languages.CompletionItemKind.Operator,
      insertText: '-> ${1:target} : ${2:message}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Synchronous message arrow',
      detail: 'Arrow',
      sortText: '600'
    },
    {
      label: '-->',
      kind: monacoInstance.languages.CompletionItemKind.Operator,
      insertText: '--> ${1:target} : ${2:message}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Asynchronous message arrow (dotted)',
      detail: 'Arrow',
      sortText: '601'
    },
    {
      label: '<->',
      kind: monacoInstance.languages.CompletionItemKind.Operator,
      insertText: '<-> ${1:target} : ${2:message}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Bidirectional arrow',
      detail: 'Arrow',
      sortText: '602'
    },
    {
      label: '<--',
      kind: monacoInstance.languages.CompletionItemKind.Operator,
      insertText: '<-- ${1:target} : ${2:message}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Return message arrow (dotted)',
      detail: 'Arrow',
      sortText: '603'
    },
    {
      label: '||',
      kind: monacoInstance.languages.CompletionItemKind.Operator,
      insertText: '|| ${1:delay} ||',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Delay in sequence diagram',
      detail: 'Special Arrow',
      sortText: '604'
    },

    // Styling and formatting
    {
      label: 'skinparam',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'skinparam ${1:parameter} ${2:value}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Set skin parameter for styling',
      detail: 'Styling',
      sortText: '700'
    },
    {
      label: 'title',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'title ${1:Diagram Title}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Set diagram title',
      detail: 'Styling',
      sortText: '701'
    },
    {
      label: 'note',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'note ${1|left,right,top,bottom|} of ${2:element} : ${3:note text}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Add a note to an element',
      detail: 'Annotation',
      sortText: '702'
    },
    {
      label: 'legend',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'legend ${1|left,right,top,bottom|}\n${2:legend text}\nendlegend',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Add a legend to the diagram',
      detail: 'Annotation',
      sortText: '703'
    },
    {
      label: 'header',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'header ${1:header text}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Add header to the diagram',
      detail: 'Styling',
      sortText: '704'
    },
    {
      label: 'footer',
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: 'footer ${1:footer text}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Add footer to the diagram',
      detail: 'Styling',
      sortText: '705'
    },

    // Common snippets and templates
    {
      label: 'sbasic',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: '@startuml\n!theme plain\ntitle ${1:State Diagram}\n\n[*] --> ${2:State1}\n${2:State1} --> ${3:State2} : ${4:condition}\n${3:State2} --> [*]\n\n@enduml',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Basic state diagram template (short alias)',
      detail: 'Template',
      sortText: '804'
    },
    {
      label: 'sequence-basic',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: '@startuml\n!theme plain\ntitle ${1:Sequence Diagram}\n\nactor ${2:User} as U\nparticipant ${3:System} as S\n\nU -> S : ${4:request}\nactivate S\nS --> U : ${5:response}\ndeactivate S\n\n@enduml',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Basic sequence diagram template with actor and participant',
      detail: 'Template',
      sortText: '800'
    },
    {
      label: 'class-basic',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: '@startuml\n!theme plain\ntitle ${1:Class Diagram}\n\nclass ${2:ClassName} {\n\t${3:+attribute : type}\n\t${4:+method() : returnType}\n}\n\n@enduml',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Basic class diagram template with a simple class',
      detail: 'Template',
      sortText: '801'
    },
    {
      label: 'usecase-basic',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: '@startuml\n!theme plain\ntitle ${1:Use Case Diagram}\n\nactor ${2:User} as U\nusecase ${3:UseCase} as UC\n\nU --> UC\n\n@enduml',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Basic use case diagram template',
      detail: 'Template',
      sortText: '802'
    },
    {
      label: 'component-basic',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: '@startuml\n!theme plain\ntitle ${1:Component Diagram}\n\npackage "${2:Package}" {\n\tcomponent ${3:Component1}\n\tcomponent ${4:Component2}\n}\n\n${3:Component1} --> ${4:Component2}\n\n@enduml',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Basic component diagram template',
      detail: 'Template',
      sortText: '803'
    },
    {
      label: 'state-basic',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: '@startuml\n!theme plain\ntitle ${1:State Diagram}\n\n[*] --> ${2:State1}\n${2:State1} --> ${3:State2} : ${4:condition}\n${3:State2} --> [*]\n\n@enduml',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Basic state diagram template',
      detail: 'Template',
      sortText: '005'
    }
  ];

  // Convert to Monaco completion items with range
  return suggestions.map(suggestion => ({
    ...suggestion,
    range: range
  }));
};

// Hover information for PlantUML keywords
export const plantUMLHoverInfo: { [key: string]: string } = {
  '@startuml': 'Start a new UML diagram. All PlantUML diagrams must begin with this directive.',
  '@enduml': 'End UML diagram. All PlantUML diagrams must end with this directive.',
  'actor': 'Define an actor in sequence diagrams. Actors are external entities that interact with the system.',
  'participant': 'Define a participant in sequence diagrams. Participants are internal components or systems.',
  'class': 'Define a class in class diagrams. Classes represent objects with attributes and methods.',
  'interface': 'Define an interface in class diagrams. Interfaces define contracts that classes can implement.',
  'enum': 'Define an enumeration. Enums represent a fixed set of constants.',
  'abstract': 'Define an abstract class that cannot be instantiated directly.',
  'component': 'Define a component in component diagrams. Components are modular parts of a system.',
  'node': 'Define a node in deployment diagrams. Nodes represent hardware or execution environments.',
  'package': 'Define a package to group related elements together.',
  'folder': 'Define a folder to organize components or files.',
  'state': 'Define a state in state diagrams. States represent conditions or situations.',
  'activate': 'Activate a participant in sequence diagrams to show it is processing.',
  'deactivate': 'Deactivate a participant to show it has finished processing.',
  'alt': 'Alternative sequence - executes one branch based on a condition.',
  'opt': 'Optional sequence - executes only if condition is true.',
  'loop': 'Loop sequence - repeats while condition is true.',
  'par': 'Parallel sequence - executes multiple sequences simultaneously.',
  'critical': 'Critical section - ensures atomic execution.',
  'note': 'Add explanatory notes to diagram elements.',
  'title': 'Set the title of the diagram.',
  'header': 'Add a header to the top of the diagram.',
  'footer': 'Add a footer to the bottom of the diagram.',
  'legend': 'Add a legend to explain diagram symbols.',
  'skinparam': 'Configure visual styling parameters for the diagram.',
  '->': 'Synchronous message arrow in sequence diagrams.',
  '-->': 'Asynchronous message arrow (dotted line) in sequence diagrams.',
  '<->': 'Bidirectional message arrow.',
  '<--': 'Return message arrow (dotted line).',
  'as': 'Create an alias for an element to use shorter names.',
  'hide': 'Hide specific elements or stereotypes from the diagram.',
  'show': 'Show specific elements or stereotypes in the diagram.',
  'usecase': 'Define a use case in use case diagrams.',
  'rectangle': 'Define a rectangular element for generic purposes.',
  'database': 'Define a database element in component diagrams.',
  'cloud': 'Define a cloud element for cloud services.',
  'frame': 'Define a frame to group elements together.'
};
