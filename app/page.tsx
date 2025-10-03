'use client';

import { useState } from 'react';
import MentionTextarea from '../components/MentionTextarea';
import MentionDisplay from '../components/MentionDisplay';

export default function Home() {
  const [text, setText] = useState('');
  const [displayText, setDisplayText] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mention Textarea Demo</h1>
      <div className="space-y-4">
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            Type @ to see mentions. If you type something that doesn't match existing mentions, you can create a custom mention.
          </p>
        </div>
        <MentionTextarea
          value={text}
          onChange={setText}
          placeholder="Type @ to mention someone..."
          className="w-full"
          maxOptions={5}
          maxWidth="300px"
          keepOpenOnSpace={true}
          mentionFields={['name', 'id']}
          allowCustomMentions={true}
        />
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Preview:</h2>
            <button
              onClick={() => setDisplayText(text)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Update Display
            </button>
          </div>
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
            {displayText ? (
              <MentionDisplay
                value={displayText}
                className="text-gray-800"
                mentionFields={['name', 'id']}
              />
            ) : (
              <p className="text-gray-500 italic">Click "Update Display" to see the formatted text</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
