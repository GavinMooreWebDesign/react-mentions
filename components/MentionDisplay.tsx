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
        padding: 0px 4px;
        border-radius: 3px;
        font-weight: 500;
        font-size: 0.875em;
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
          // Split by newlines and create separate text parts for each line
          const lines = textBefore.split('\n');
          lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
              // Add a line break before each line (except the first)
              parts.push({
                type: 'linebreak',
                content: '\n'
              });
            }
            if (line) {
              parts.push({
                type: 'text',
                content: line
              });
            }
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
        // Split by newlines and create separate text parts for each line
        const lines = textAfter.split('\n');
        lines.forEach((line, lineIndex) => {
          if (lineIndex > 0) {
            // Add a line break before each line (except the first)
            parts.push({
              type: 'linebreak',
              content: '\n'
            });
          }
          if (line) {
            parts.push({
              type: 'text',
              content: line
            });
          }
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
          } else if (part.type === 'linebreak') {
            return <br key={index} />;
          } else {
            return <span key={index}>{part.content}</span>;
          }
        })}
    </div>
  );
};

export default MentionDisplay;
