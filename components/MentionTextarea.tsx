'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MentionOption {
  name: string;
  id?: string;
  [key: string]: string | number | boolean | undefined; // Allow additional custom fields
}

interface MentionTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxOptions?: number;
  maxWidth?: string;
  keepOpenOnSpace?: boolean;
  mentionFields?: string[];
  allowCustomMentions?: boolean;
}

const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value = '',
  onChange,
  placeholder = 'Type @ to mention someone...',
  className = '',
  maxOptions = 5,
  maxWidth = '200px',
  keepOpenOnSpace = false,
  mentionFields = ['name'],
  allowCustomMentions = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setMentionStartIndex] = useState(-1);
  const [storedCursorPosition, setStoredCursorPosition] = useState(-1);
  const [isRebuilding, setIsRebuilding] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Test data for mentions
  const mentionOptions: MentionOption[] = [
    { name: 'John Doe', id: '1' },
    { name: 'Jane Smith', id: '2' },
    { name: 'Bob Johnson', id: '3' },
    { name: 'Alice Brown', id: '4' },
    { name: 'Charlie Wilson', id: '5' },
    { name: 'Diana Davis', id: '6' },
    { name: 'Eve Miller', id: '7' },
    { name: 'Frank Garcia', id: '8' }
  ];

  const filteredOptions = mentionOptions
    .filter(option =>
      option.name.toLowerCase().includes(mentionQuery.toLowerCase())
    )
    .slice(0, maxOptions);

  // Add custom mention option if enabled and conditions are met
  const shouldShowCustomOption = allowCustomMentions && 
    mentionQuery.length > 0 && 
    !mentionQuery.includes(' ') && 
    !filteredOptions.some(option => option.name.toLowerCase() === mentionQuery.toLowerCase());

  const allOptions = shouldShowCustomOption 
    ? [...filteredOptions, { name: `Create "${mentionQuery}"`, id: 'custom', isCustom: true }]
    : filteredOptions;

  const formatMention = (option: MentionOption): string => {
    const parts: string[] = [];
    
    for (let i = 0; i < mentionFields.length; i++) {
      const field = mentionFields[i] || 'name';
      const value = option[field] || option.name;
      parts.push(`[${value}]`);
    }
    
    return `@${parts.join('')}`;
  };

  const cleanupEditor = () => {
    if (!editorRef.current) return;
    
    // Remove all BR elements that are not necessary
    const brElements = editorRef.current.querySelectorAll('br');
    brElements.forEach(br => {
      // Only remove BR elements that are not the last child or are empty
      if (br.nextSibling === null || br.textContent === '') {
        br.remove();
      }
    });
    
    // Only clear innerHTML if there are no text nodes and no mention elements
    const hasTextNodes = editorRef.current.querySelectorAll('*').length === 0 && 
                        editorRef.current.textContent?.trim() === '';
    const hasMentions = editorRef.current.querySelectorAll('.mention').length > 0;
    
    if (hasTextNodes && !hasMentions) {
      // Only clear if there are no mentions and no meaningful content
      editorRef.current.innerHTML = '';
    }
  };

  const rebuildMentionsFromText = (textContent?: string) => {
    if (!editorRef.current) {
      return;
    }
    
    if (isRebuilding) {
      // If already rebuilding, wait a bit and try again
      setTimeout(() => rebuildMentionsFromText(textContent), 10);
      return;
    }
    
    setIsRebuilding(true);
    
    // Use raw text content if not provided, which contains the full bracket format
    const rawTextContent = textContent || getRawTextContent();
    
    // Find all mentions in the text using bracket patterns
    const mentionPattern = /@(?:\[[^\]]+\])+/g;
    let match;
    const mentions = [];
    
    while ((match = mentionPattern.exec(rawTextContent)) !== null) {
      mentions.push({
        text: match[0],
        index: match.index
      });
    }
    
    
    // If no mentions found, just set the text content and return
    if (mentions.length === 0) {
      editorRef.current.textContent = rawTextContent;
      // Clean up any leftover BR elements
      cleanupEditor();
      // Reset the rebuilding flag
      setIsRebuilding(false);
      return;
    }
    
    // Clear the editor and rebuild from scratch
    editorRef.current.innerHTML = '';
    
    // Create a document fragment to build the content
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    for (const mention of mentions) {
      // Add text before the mention
      if (mention.index > lastIndex) {
        const textBefore = rawTextContent.substring(lastIndex, mention.index);
        if (textBefore) {
          fragment.appendChild(document.createTextNode(textBefore));
        }
      }
      
      // Add the mention element
      const mentionElement = document.createElement('span');
      mentionElement.className = 'mention';
      mentionElement.setAttribute('data-mention', mention.text);
      mentionElement.setAttribute('contenteditable', 'false');
      
      // Extract the first field (name) from the mention text for display
      // Format: @[name][id] -> @name
      const nameMatch = mention.text.match(/@\[([^\]]+)\]/);
      const displayText = nameMatch ? `@${nameMatch[1]}` : mention.text;
      mentionElement.textContent = displayText;
      
      fragment.appendChild(mentionElement);
      
      lastIndex = mention.index + mention.text.length;
    }
    
    // Add any remaining text after the last mention
    if (lastIndex < rawTextContent.length) {
      const textAfter = rawTextContent.substring(lastIndex);
      if (textAfter) {
        fragment.appendChild(document.createTextNode(textAfter));
      }
    }
    
    // Append the fragment to the editor
    editorRef.current.appendChild(fragment);
    
    // Reset the rebuilding flag immediately after DOM updates
    requestAnimationFrame(() => {
      setIsRebuilding(false);
    });
  };

  useEffect(() => {
    if (onChange && !isRebuilding) {
      onChange(getRawTextContent());
    }
  }, [value, onChange, isRebuilding]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('mention')) {
        e.preventDefault();
        e.stopPropagation();
        // Place cursor after the mention
        const range = document.createRange();
        range.setStartAfter(target);
        range.setEndAfter(target);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    };

    editor.addEventListener('click', handleClick);
    return () => {
      editor.removeEventListener('click', handleClick);
    };
  }, []);


  const getRawTextContent = () => {
    if (!editorRef.current) return '';
    
    // Build text content by walking through all nodes and preserving mention data
    let text = '';
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          // Skip text nodes that are children of mention elements
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (parent && parent.classList.contains('mention')) {
              return NodeFilter.FILTER_REJECT;
            }
          }
          // Skip BR elements
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'BR') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.classList.contains('mention')) {
          // Get the raw mention data from the data-mention attribute
          const rawMention = element.getAttribute('data-mention');
          if (rawMention) {
            text += rawMention;
          } else {
            // Fallback to text content if no data attribute
            text += element.textContent || '';
          }
        }
      }
    }
    return text;
  };

  const getCaretPosition = () => {
    if (!editorRef.current) return { top: 0, left: 0 };
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { top: 0, left: 0 };
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    
    return {
      top: rect.bottom - editorRect.top + editorRef.current.scrollTop,
      left: rect.left - editorRect.left + editorRef.current.scrollLeft
    };
  };

  const checkIfCursorIsAfterMention = (): boolean => {
    if (!editorRef.current) return false;
    
    // Get all mention elements
    const mentions = editorRef.current.querySelectorAll('.mention');
    if (mentions.length === 0) return false;
    
    // Get the current cursor position
    const cursorPosition = getCursorPositionInRawText();
    
    // Get the text content to find mention positions
    const textContent = getRawTextContent();
    
    // Find the mention that ends closest to the cursor position
    let closestMentionEnd = -1;
    
    for (const mention of mentions) {
      const mentionElement = mention as HTMLElement;
      const rawMentionText = mentionElement.getAttribute('data-mention') || '';
      
      const mentionIndex = textContent.indexOf(rawMentionText);
      
      if (mentionIndex !== -1) {
        const endOfMention = mentionIndex + rawMentionText.length;
        
        // Only consider mentions that end before or at the cursor position
        if (endOfMention <= cursorPosition && endOfMention > closestMentionEnd) {
          closestMentionEnd = endOfMention;
        }
      }
    }
    
    // Only return true if the cursor is immediately after the closest mention
    if (closestMentionEnd !== -1) {
      return cursorPosition >= closestMentionEnd && cursorPosition <= closestMentionEnd + 1;
    }
    return false;
  };


  const getCursorPositionInRawText = (): number => {
    if (!editorRef.current) return 0;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    
    const range = selection.getRangeAt(0);
    
    // If the editor is empty, return 0
    if (editorRef.current.textContent?.trim() === '') {
      return 0;
    }
    
    // Create a range from the start of the editor to the cursor position
    const startRange = document.createRange();
    startRange.setStart(editorRef.current, 0);
    startRange.setEnd(range.startContainer, range.startOffset);
    
    // Get the raw text content of this range by walking through nodes
    let textBeforeCursor = '';
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          // Skip text nodes that are children of mention elements
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (parent && parent.classList.contains('mention')) {
              return NodeFilter.FILTER_REJECT;
            }
          }
          // Skip BR elements
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'BR') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node === range.startContainer) {
        // We've reached the cursor position, stop here
        if (node.nodeType === Node.TEXT_NODE) {
          textBeforeCursor += (node.textContent || '').substring(0, range.startOffset);
        }
        break;
      } else if (node.nodeType === Node.TEXT_NODE) {
        textBeforeCursor += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.classList.contains('mention')) {
          const rawMention = element.getAttribute('data-mention');
          if (rawMention) {
            textBeforeCursor += rawMention;
          } else {
            textBeforeCursor += element.textContent || '';
          }
        }
      }
    }
    
    return textBeforeCursor.length;
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    
    // Clean up any leftover BR elements first
    cleanupEditor();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    
    // Check if cursor is right after a mention
    const isAfterMention = checkIfCursorIsAfterMention();
    if (isAfterMention) {
      setShowDropdown(false);
      setMentionStartIndex(-1);
      return;
    }
    
    // Use the correct cursor position calculation
    const cursorPosition = getCursorPositionInRawText();
    const textContent = getRawTextContent();
    const textBeforeCursor = textContent.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    // Special handling for empty editor - check if user just typed @
    if (textContent === '' && editorRef.current.textContent === '@') {
      setMentionQuery('');
      setShowDropdown(true);
      setSelectedIndex(0);
      setMentionStartIndex(0);
      setStoredCursorPosition(1);
      
      const position = getCaretPosition();
      setDropdownPosition(position);
      return;
    }
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      // Show dropdown if there's no space after @ (including when textAfterAt is empty)
      if (!hasSpaceAfterAt) {
        setMentionQuery(textAfterAt);
        setShowDropdown(true);
        setSelectedIndex(0);
        setMentionStartIndex(atIndex);
        setStoredCursorPosition(cursorPosition); // Store the cursor position when dropdown is shown
        
        const position = getCaretPosition();
        setDropdownPosition(position);
      } else {
        // If keepOpenOnSpace is true and there are still filtered options, keep dropdown open
        if (keepOpenOnSpace && filteredOptions.length > 0) {
          setMentionQuery(textAfterAt);
          setShowDropdown(true);
          setSelectedIndex(0);
          setMentionStartIndex(atIndex);
          setStoredCursorPosition(cursorPosition); // Store the cursor position when dropdown is shown
          
          const position = getCaretPosition();
          setDropdownPosition(position);
        } else {
          setShowDropdown(false);
          setMentionStartIndex(-1);
          setStoredCursorPosition(-1);
        }
      }
    } else {
      setShowDropdown(false);
      setMentionStartIndex(-1);
      setStoredCursorPosition(-1);
    }
    
    // Always call onChange when input changes
    if (onChange && !isRebuilding) {
      onChange(getRawTextContent());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showDropdown) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : allOptions.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (allOptions[selectedIndex]) {
            insertMention(allOptions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setMentionStartIndex(-1);
          break;
      }
    } else if (e.key === 'Backspace') {
      // Handle backspace when cursor is after a mention
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const cursorPosition = getCursorPositionInRawText();
        const textContent = getRawTextContent();
        
        // Check if cursor is right after a mention using span elements
        if (cursorPosition > 0) {
          const mentions = editorRef.current?.querySelectorAll('.mention');
          if (mentions && mentions.length > 0) {
            // Find the mention that ends exactly at the cursor position
            let targetMention = null;
            let targetMentionIndex = -1;
            
            for (const mention of mentions) {
              const mentionElement = mention as HTMLElement;
              const rawMentionText = mentionElement.getAttribute('data-mention') || '';
              const mentionIndex = textContent.indexOf(rawMentionText);
              
              if (mentionIndex !== -1) {
                const endOfMention = mentionIndex + rawMentionText.length;
                
                if (cursorPosition === endOfMention) {
                  targetMention = mentionElement;
                  targetMentionIndex = mentionIndex;
                  break;
                }
              }
            }
            
            // If we found a mention that ends at the cursor position, delete it
            if (targetMention && targetMentionIndex !== -1) {
              e.preventDefault();
              
              // Store the cursor position before removing the mention
              const cursorPosition = targetMentionIndex;
              
              // Remove the mention element
              targetMention.remove();
              
              // Rebuild all remaining mentions to preserve formatting
              // rebuildMentionsFromText will handle clearing and rebuilding
              rebuildMentionsFromText();
              
              // Set cursor position where the mention was
              // We need to find the correct position in the rebuilt content
              const newTextContent = getRawTextContent();
              const targetPosition = Math.min(cursorPosition, newTextContent.length);
              
              // Find the node and offset that corresponds to the target position
              const newRange = document.createRange();
              let currentPosition = 0;
              let found = false;
              
              const walker = document.createTreeWalker(
                editorRef.current!,
                NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                {
                  acceptNode: (node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                      const parent = node.parentElement;
                      if (parent && parent.classList.contains('mention')) {
                        return NodeFilter.FILTER_REJECT;
                      }
                    }
                    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'BR') {
                      return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                  }
                }
              );
              
              let node;
              while (node = walker.nextNode()) {
                if (node.nodeType === Node.TEXT_NODE) {
                  const textLength = (node.textContent || '').length;
                  if (currentPosition + textLength >= targetPosition) {
                    const offset = targetPosition - currentPosition;
                    newRange.setStart(node, offset);
                    newRange.setEnd(node, offset);
                    found = true;
                    break;
                  }
                  currentPosition += textLength;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  if (element.classList.contains('mention')) {
                    const rawMention = element.getAttribute('data-mention');
                    if (rawMention) {
                      const mentionLength = rawMention.length;
                      if (currentPosition + mentionLength >= targetPosition) {
                        // Position is within this mention, place cursor after it
                        newRange.setStartAfter(element);
                        newRange.setEndAfter(element);
                        found = true;
                        break;
                      }
                      currentPosition += mentionLength;
                    }
                  }
                }
              }
              
              if (!found) {
                // Fallback: place cursor at the end
                newRange.selectNodeContents(editorRef.current!);
                newRange.collapse(false);
              }
              
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
      }
    }
  };

  const insertMention = (option: MentionOption) => {
    if (!editorRef.current) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const textContent = getRawTextContent();
    
    // Use the stored cursor position instead of calculating a new one
    const cursorPosition = storedCursorPosition !== -1 ? storedCursorPosition : getCursorPositionInRawText();
    
    
    // Handle custom mention creation
    let mentionToInsert = option;
    if (option.isCustom) {
      // Create a custom mention object with the query text
      mentionToInsert = {
        name: mentionQuery,
        id: `custom-${Date.now()}`,
        isCustom: true
      };
    }
    
    // Find the @ symbol that's currently being typed (the one right before the cursor)
    let atIndex = -1;
    
    // Search backwards from the cursor to find the most recent @ that's not part of an existing mention
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (textContent[i] === '@') {
        // Check if this @ is part of an existing mention
        let isPartOfMention = false;
        
        const mentions = editorRef.current?.querySelectorAll('.mention');
        if (mentions && mentions.length > 0) {
          for (const mention of mentions) {
            const mentionElement = mention as HTMLElement;
            const rawMentionText = mentionElement.getAttribute('data-mention') || '';
            const mentionIndex = textContent.indexOf(rawMentionText);
            
            if (mentionIndex !== -1 && mentionIndex <= i && i < mentionIndex + rawMentionText.length) {
              isPartOfMention = true;
              break;
            }
          }
        }
        
        if (!isPartOfMention) {
          // This @ is not part of an existing mention, use it
          atIndex = i;
          break;
        }
      }
    }
    
    if (atIndex !== -1) {
      // Only proceed if this @ is not part of an existing mention
      if (true) { // We already verified this @ is not part of an existing mention
        const beforeAt = textContent.substring(0, atIndex);
        const afterCursor = textContent.substring(cursorPosition);
        const mentionText = formatMention(mentionToInsert);
        
        // Use a more robust approach that works with the overall text content
        // and then rebuilds the DOM structure properly
        const newText = beforeAt + mentionText + afterCursor;
        
        // Now we need to find and format all mentions in the content
        // rebuildMentionsFromText will handle clearing and rebuilding
        rebuildMentionsFromText(newText);
        
        // Find the inserted mention element for cursor positioning
        const insertedMentionElement = editorRef.current?.querySelector(`[data-mention="${formatMention(mentionToInsert)}"]`);
        
        // Set cursor position after the inserted mention
        if (insertedMentionElement) {
          const newRange = document.createRange();
          newRange.setStartAfter(insertedMentionElement);
          newRange.setEndAfter(insertedMentionElement);
          
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
          
          // Ensure the editor is focused and cursor is positioned correctly
          if (editorRef.current) {
            editorRef.current.focus();
          }
        } else {
          // Fallback: place cursor at the end of the content
          const newRange = document.createRange();
          newRange.selectNodeContents(editorRef.current!);
          newRange.collapse(false);
          
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
          
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }
        
        // State is already cleared in handleOptionClick
      }
    }
  };

  const handleOptionClick = (option: MentionOption) => {
    // Prevent double-click issues and multiple rapid clicks
    if (showDropdown && !isRebuilding) {
      // Close dropdown immediately to prevent multiple clicks
      setShowDropdown(false);
      setMentionStartIndex(-1);
      setStoredCursorPosition(-1);
      
      insertMention(option);
      // Focus back to the editor
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };


  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={`w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-pre-wrap ${className}`}
        style={{ 
          minHeight: '120px',
          overflow: 'auto'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      {showDropdown && allOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            minWidth: maxWidth,
            maxWidth: maxWidth
          }}
        >
          {allOptions.map((option, index) => (
            <div
              key={option.name}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              <div className="font-medium text-gray-900 break-words">{option.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionTextarea;

