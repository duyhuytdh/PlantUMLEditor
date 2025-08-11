# PlantUML Monaco Editor Configuration

Thư mục này chứa các file config cho Monaco Editor với hỗ trợ PlantUML.

## Cấu trúc

### `plantuml-suggestions.ts`
File này chứa tất cả các suggestions (autocompletion) và hover information cho PlantUML syntax trong Monaco Editor.

#### Thành phần chính:

1. **`SuggestionItem` Interface**: Định nghĩa cấu trúc của một suggestion item
2. **`getPlantUMLSuggestions()` Function**: Trả về danh sách suggestions được categorize theo:
   - Basic diagram types (@startuml, @enduml)
   - Sequence diagram elements (actor, participant, activate, deactivate)
   - Class diagram elements (class, interface, enum, abstract)
   - Component diagram elements (component, node, package, folder)
   - State diagram elements (state, [*])
   - Control flow (alt, opt, loop, par, critical)
   - Arrows and connections (->, -->, <->, <--, ||)
   - Styling (skinparam, title, note, legend, header, footer)
   - Templates (sequence-basic, class-basic, usecase-basic, component-basic, state-basic)

3. **`plantUMLHoverInfo` Object**: Chứa thông tin hover cho từng từ khóa PlantUML

#### Cách thêm suggestion mới:

```typescript
{
  label: 'keyword-name',
  kind: monacoInstance.languages.CompletionItemKind.Keyword,
  insertText: 'keyword ${1:placeholder}',
  insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  documentation: 'Mô tả về keyword',
  detail: 'Category',
  sortText: '999' // Số thứ tự sắp xếp
}
```

#### Cách thêm hover info mới:

```typescript
'keyword': 'Thông tin chi tiết về keyword khi hover'
```

## Tính năng

### Autocompletion Features:
- **Snippet Support**: Hỗ trợ placeholders `${1:name}` cho việc tab navigation
- **Categorization**: Suggestions được nhóm theo loại diagram và chức năng
- **Sorting**: Sử dụng `sortText` để sắp xếp suggestions theo thứ tự ưu tiên
- **Rich Documentation**: Mỗi suggestion có documentation và detail category

### Hover Information:
- **Keyword Explanation**: Hiển thị thông tin chi tiết khi hover trên từ khóa
- **Formatted Display**: Sử dụng Markdown formatting cho hover content

## Cách sử dụng

File config này được import và sử dụng trong `MonacoCodeEditor.tsx`:

```typescript
import { getPlantUMLSuggestions, plantUMLHoverInfo } from '../config/plantuml-suggestions';

// Trong completion provider
const suggestions = getPlantUMLSuggestions(monacoInstance, range);

// Trong hover provider
const info = plantUMLHoverInfo[word.word];
```

## Maintenance

### Thêm diagram type mới:
1. Thêm suggestions vào category tương ứng trong `getPlantUMLSuggestions()`
2. Thêm hover info vào `plantUMLHoverInfo`
3. Cập nhật `sortText` để maintain thứ tự

### Thêm template mới:
1. Thêm vào category "Templates" với `kind: Snippet`
2. Sử dụng `insertTextRules: InsertAsSnippet` cho snippet support
3. Đặt `sortText` từ 800+ cho templates

### Testing:
- Kiểm tra autocompletion bằng cách gõ từ khóa trong editor
- Kiểm tra hover bằng cách di chuột qua từ khóa
- Verify snippet placeholders hoạt động với Tab navigation
