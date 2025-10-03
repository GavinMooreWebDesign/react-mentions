# MentionTextarea Component

A React component that provides a rich text input with @ mention functionality. Users can type `@` to trigger a dropdown with mentionable options, and mentions are displayed as formatted, non-editable elements.

## Features

- **@ Mention Support**: Type `@` to trigger a dropdown with mentionable options
- **Flexible Mention Format**: Support for single or multiple fields in mentions (e.g., `@[name][id]`)
- **Visual Formatting**: Mentions are displayed as styled, non-editable elements
- **Keyboard Navigation**: Navigate dropdown options with arrow keys
- **Customizable Options**: Control number of options shown, dropdown width, and more
- **Raw Data Preservation**: Full mention data is preserved for backend processing
- **Clean Display**: Shows only the first field (name) in the UI while preserving all data

## Installation

```bash
npm install
```

## Basic Usage

```tsx
import MentionTextarea from './components/MentionTextarea';

function App() {
  const [text, setText] = useState('');

  return (
    <MentionTextarea
      value={text}
      onChange={setText}
      placeholder="Type @ to mention someone..."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The current value of the textarea |
| `onChange` | `(value: string) => void` | - | Callback function called when the value changes |
| `placeholder` | `string` | `'Type @ to mention someone...'` | Placeholder text for the textarea |
| `className` | `string` | `''` | Additional CSS classes for the textarea |
| `maxOptions` | `number` | `5` | Maximum number of options to show in the dropdown |
| `maxWidth` | `string` | `'200px'` | Maximum width of the dropdown |
| `keepOpenOnSpace` | `boolean` | `false` | Whether to keep dropdown open when space is pressed |
| `mentionFields` | `string[]` | `['name']` | Array of field names to include in mentions |

## Advanced Usage

### Custom Mention Fields

```tsx
<MentionTextarea
  value={text}
  onChange={setText}
  mentionFields={['name', 'id', 'department']}
  placeholder="Type @ to mention someone..."
/>
```

This will create mentions in the format: `@[name][id][department]`

### Custom Styling

```tsx
<MentionTextarea
  value={text}
  onChange={setText}
  className="w-full h-32 border-2 border-blue-500 rounded-lg"
  maxWidth="400px"
  maxOptions={10}
/>
```

### Keep Dropdown Open on Space

```tsx
<MentionTextarea
  value={text}
  onChange={setText}
  keepOpenOnSpace={true}
  placeholder="Type @ to mention someone..."
/>
```

## Mention Data Format

### Input Data
The component expects mention options in this format:

```tsx
const mentionOptions = [
  { name: 'John Doe', id: '1' },
  { name: 'Jane Smith', id: '2' },
  { name: 'Bob Johnson', id: '3' }
];
```

### Output Format
The `onChange` callback receives the raw text with full mention format:

```
"Hello @[John Doe][1], how are you? @[Jane Smith][2] is also here."
```

### Display Format
In the UI, mentions are displayed as clean text:

```
"Hello @John Doe, how are you? @Jane Smith is also here."
```

## Styling

The component uses Tailwind CSS classes. You can customize the appearance by:

1. **Textarea**: Use the `className` prop
2. **Mentions**: Override the `.mention` class in your CSS
3. **Dropdown**: The dropdown uses default Tailwind classes

### Custom Mention Styles

```css
.mention {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
  margin: 0 1px;
  border: 1px solid #93c5fd;
  user-select: none;
  cursor: default;
}

.mention:hover {
  background-color: #bfdbfe;
}
```

## Keyboard Navigation

- **Arrow Keys**: Navigate up/down through dropdown options
- **Enter**: Select the highlighted option
- **Escape**: Close the dropdown
- **Backspace**: Delete mentions when cursor is positioned after them

## Examples

### Basic Chat Input

```tsx
function ChatInput() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    console.log('Sending message:', message);
    // message contains: "Hey @[John Doe][1], check this out!"
    setMessage('');
  };

  return (
    <div className="flex gap-2">
      <MentionTextarea
        value={message}
        onChange={setMessage}
        placeholder="Type a message..."
        className="flex-1"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### Comment System

```tsx
function CommentBox() {
  const [comment, setComment] = useState('');

  return (
    <div>
      <MentionTextarea
        value={comment}
        onChange={setComment}
        placeholder="Write a comment..."
        mentionFields={['name', 'id']}
        maxOptions={8}
        keepOpenOnSpace={true}
      />
      <div className="mt-2 text-sm text-gray-500">
        {comment.length} characters
      </div>
    </div>
  );
}
```

## Technical Details

### How It Works

1. **Text Input**: Uses a `contentEditable` div for rich text editing
2. **Mention Detection**: Detects `@` symbols and shows dropdown
3. **Data Storage**: Stores full mention data in `data-mention` attributes
4. **Display**: Shows clean text while preserving raw data
5. **Output**: Provides raw text with full mention format via `onChange`

### Data Flow

```
User types "@" → Dropdown appears → User selects option → 
Mention inserted as <span> → Raw data stored in attribute → 
onChange called with raw text → Backend receives full format
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License
