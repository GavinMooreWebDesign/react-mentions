# React Mentions Components

A comprehensive React library for @ mention functionality with both editable and read-only display components. Perfect for chat applications, comment systems, and any interface requiring user mentions.

## Components

- **MentionTextarea**: Editable textarea with @ mention support
- **MentionDisplay**: Read-only display component for showing formatted text with mentions

## Features

### MentionTextarea
- **@ Mention Support**: Type `@` to trigger a dropdown with mentionable options
- **Custom Mentions**: Create custom mentions for text that doesn't match existing options
- **Flexible Mention Format**: Support for single or multiple fields in mentions (e.g., `@[name][id]`)
- **Visual Formatting**: Mentions are displayed as styled, non-editable elements
- **Keyboard Navigation**: Navigate dropdown options with arrow keys
- **Customizable Options**: Control number of options shown, dropdown width, and more
- **Raw Data Preservation**: Full mention data is preserved for backend processing
- **Clean Display**: Shows only the first field (name) in the UI while preserving all data
- **Smart Cursor Handling**: Proper cursor positioning when editing and deleting mentions

### MentionDisplay
- **Read-Only Rendering**: Display formatted text with mentions in a non-editable format
- **Mention Parsing**: Automatically parses raw mention format and displays clean text
- **Customizable Styling**: Mentions are styled with badges for clear visual distinction
- **Tooltip Support**: Hover over mentions to see raw mention data

## Installation

```bash
npm install
```

## Basic Usage

### MentionTextarea

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

### MentionDisplay

```tsx
import MentionDisplay from './components/MentionDisplay';

function MessageDisplay({ message }) {
  return (
    <MentionDisplay
      value={message}
      className="text-gray-800"
      mentionFields={['name', 'id']}
    />
  );
}
```

### Combined Usage

```tsx
import { useState } from 'react';
import MentionTextarea from './components/MentionTextarea';
import MentionDisplay from './components/MentionDisplay';

function ChatInterface() {
  const [text, setText] = useState('');
  const [displayText, setDisplayText] = useState('');

  return (
    <div>
      <MentionTextarea
        value={text}
        onChange={setText}
        placeholder="Type @ to mention someone..."
        allowCustomMentions={true}
      />
      <button onClick={() => setDisplayText(text)}>
        Update Display
      </button>
      <MentionDisplay
        value={displayText}
        mentionFields={['name', 'id']}
      />
    </div>
  );
}
```

## Props

### MentionTextarea Props

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
| `allowCustomMentions` | `boolean` | `false` | Allow users to create custom mentions for unmatched text |

### MentionDisplay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The text content with mentions to display |
| `className` | `string` | `''` | Additional CSS classes for the container |
| `mentionFields` | `string[]` | `['name']` | Array of field names to extract from mentions |

## Advanced Usage

### Custom Mentions

Enable users to create custom mentions for text that doesn't match existing options:

```tsx
<MentionTextarea
  value={text}
  onChange={setText}
  allowCustomMentions={true}
  placeholder="Type @ to mention someone..."
/>
```

When `allowCustomMentions` is enabled:
- Users can type `@` followed by any text
- If no existing mention matches, a "Create [text]" option appears
- Selecting this option creates a custom mention with the typed text

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

### Display Component Styling

```tsx
<MentionDisplay
  value={message}
  className="p-4 bg-gray-50 rounded-lg"
  mentionFields={['name', 'id']}
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

## Getting Started

### 1. Import the Components

```tsx
import MentionTextarea from './components/MentionTextarea';
import MentionDisplay from './components/MentionDisplay';
```

### 2. Set Up Your Data

The components work with a predefined list of mentionable users:

```tsx
const users = [
  { name: 'John Doe', id: '1' },
  { name: 'Jane Smith', id: '2' },
  { name: 'Bob Johnson', id: '3' }
];
```

### 3. Use in Your App

```tsx
function MyApp() {
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

## Common Use Cases

### Chat Messages
Perfect for chat applications where users can mention each other:

```tsx
function ChatMessage({ message }) {
  return (
    <div className="message">
      <MentionDisplay
        value={message}
        mentionFields={['name', 'id']}
      />
    </div>
  );
}
```

### Comments and Posts
Great for comment systems and social media posts:

```tsx
function CommentForm() {
  const [comment, setComment] = useState('');
  
  return (
    <MentionTextarea
      value={comment}
      onChange={setComment}
      placeholder="Write a comment..."
      allowCustomMentions={true}
    />
  );
}
```

### Notifications
Use the display component to show mentions in notifications:

```tsx
function Notification({ text }) {
  return (
    <div className="notification">
      <MentionDisplay
        value={text}
        className="text-sm"
        mentionFields={['name']}
      />
    </div>
  );
}
```

## Styling

The components use Tailwind CSS classes. You can customize the appearance by:

1. **Textarea**: Use the `className` prop
2. **Mentions**: Override the `.mention` and `.mention-display` classes in your CSS
3. **Dropdown**: The dropdown uses default Tailwind classes

### Custom Mention Styles

#### MentionTextarea (Editable)
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

#### MentionDisplay (Read-only)
```css
.mention-display {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-block;
  margin: 0 1px;
}
```

## Keyboard Navigation

- **Arrow Keys**: Navigate up/down through dropdown options
- **Enter**: Select the highlighted option
- **Escape**: Close the dropdown
- **Backspace**: Delete mentions when cursor is positioned after them

## Examples

### Chat Application

```tsx
function ChatInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { id: Date.now(), text: message }]);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="bg-gray-100 p-2 rounded">
            <MentionDisplay
              value={msg.text}
              mentionFields={['name', 'id']}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 p-4 border-t">
        <MentionTextarea
          value={message}
          onChange={setMessage}
          placeholder="Type a message..."
          className="flex-1"
          allowCustomMentions={true}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

### Comment System with Preview

```tsx
function CommentBox() {
  const [comment, setComment] = useState('');
  const [preview, setPreview] = useState('');

  return (
    <div className="space-y-4">
      <MentionTextarea
        value={comment}
        onChange={setComment}
        placeholder="Write a comment..."
        mentionFields={['name', 'id']}
        maxOptions={8}
        allowCustomMentions={true}
      />
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {comment.length} characters
        </span>
        <button 
          onClick={() => setPreview(comment)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Preview
        </button>
      </div>
      
      {preview && (
        <div className="p-3 bg-gray-50 rounded border">
          <h4 className="font-semibold mb-2">Preview:</h4>
          <MentionDisplay
            value={preview}
            mentionFields={['name', 'id']}
          />
        </div>
      )}
    </div>
  );
}
```

## Data Format

### Input Format
The components work with text containing mentions in this format:
```
"Hello @[John Doe][1], how are you? @[Jane Smith][2] is also here."
```

### Display Format
In the UI, mentions appear as clean text:
```
"Hello @John Doe, how are you? @Jane Smith is also here."
```

### Backend Processing
When you send data to your backend, you'll receive the full format with all mention data preserved, making it easy to:
- Extract user IDs for notifications
- Store mention relationships
- Process mentions for different purposes

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License
