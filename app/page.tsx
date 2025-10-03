'use client';

import { useState } from 'react';
import MentionTextarea from '../components/MentionTextarea';

export default function Home() {
  const [text, setText] = useState('');

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
      </div>
    </div>
  );
}
