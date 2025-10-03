'use client';

import React, { useEffect } from 'react';

interface MentionDisplayProps {
  value: string;
  className?: string;
  mentionFields?: string[];
}

const MentionDisplay: React.FC<MentionDisplayProps> = ({
  value = '',
  className = '',
  mentionFields = ['name']
}) => {
  // Inject styles into document head for portability
  useEffect(() => {
    const styleId = 'mention-display-styles';
    
    // Check if styles already exist
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .mention-display {
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

      .mention-display:hover {
        background-color: #bfdbfe;
      }
    `;
    
    document.head.appendChild(style);

    // Cleanup function to remove styles when component unmounts
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  const parseTextWithMentions = (text: string) => {
    if (!text) return null;

    // Find all mentions in the text using bracket patterns
    const mentionPattern = /@(?:\[[^\]]+\])+/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionPattern.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push({
            type: 'text',
            content: textBefore
          });
        }
      }

      // Parse the mention
      const mentionText = match[0];
      const mentionData = parseMentionText(mentionText);
      
      parts.push({
        type: 'mention',
        content: mentionData.displayText,
        data: mentionData
      });

      lastIndex = match.index + mentionText.length;
    }

    // Add any remaining text after the last mention
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      if (textAfter) {
        parts.push({
          type: 'text',
          content: textAfter
        });
      }
    }

    return parts;
  };

  const parseMentionText = (mentionText: string) => {
    // Extract fields from mention text like @[name][id]
    const fieldMatches = mentionText.match(/\[([^\]]+)\]/g);
    const fields = fieldMatches ? fieldMatches.map(match => match.slice(1, -1)) : [];
    
    // Create mention data object
    const mentionData: { [key: string]: string } = {};
    fields.forEach((field, index) => {
      const fieldName = mentionFields[index] || `field${index}`;
      mentionData[fieldName] = field;
    });

    // Use the first field as display text, or the first field if no name field
    const displayText = mentionData.name || mentionData[mentionFields[0]] || fields[0] || mentionText;

    return {
      displayText: `@${displayText}`,
      data: mentionData,
      raw: mentionText
    };
  };

  const parts = parseTextWithMentions(value);

  if (!parts) {
    return <div className={className}>{value}</div>;
  }

  return (
    <div className={className}>
        {parts.map((part, index) => {
          if (part.type === 'mention') {
            return (
              <span
                key={index}
                className="mention-display"
                title={part.data?.raw || ''}
              >
                {part.content}
              </span>
            );
          } else {
            return <span key={index}>{part.content}</span>;
          }
        })}
    </div>
  );
};

export default MentionDisplay;
