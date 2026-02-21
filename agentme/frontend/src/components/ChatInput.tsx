import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, PlusIcon } from './Icon';
import { cn } from '../lib/utils';
import { SelectFiles } from '../../wailsjs/go/main/App';

export interface ChatInputProps {
  onSend: (content: string, files: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入消息...（Enter 发送，Shift+Enter 换行）'
}) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (trimmed || files.length > 0) {
      onSend(trimmed, [...files]);
      setContent('');
      setFiles([]);
    }
  };

  const handleFileSelect = async () => {
    try {
      const result = await SelectFiles();
      if (result && result.length > 0) {
        setFiles(prev => [...prev, ...result]);
      }
    } catch (err) {
      console.error('Failed to select files:', err);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-small bg-[var(--color-bg)] px-2 py-1 rounded border border-[var(--color-border)]"
            >
              <span className="truncate max-w-[200px]">📎 {file.split('/').pop()}</span>
              <button
                onClick={() => removeFile(idx)}
                className="text-[var(--color-muted)] hover:text-[var(--color-error)]"
              >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleFileSelect}
          className={cn(
            'flex-shrink-0 flex items-center justify-center',
            'w-10 h-10 text-[var(--color-dim)] hover:text-[var(--color-fg)]',
            'hover:bg-[var(--color-border)] transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          disabled={disabled}
          title="上传文件"
        >
          <PaperclipIcon size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 font-mono text-sm bg-transparent',
            'text-[var(--color-fg)] placeholder:text-[var(--color-muted)]',
            'focus:outline-none resize-none',
            'min-h-[40px] max-h-[200px] py-2',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          rows={1}
        />

        <button
          onClick={() => setContent('')}
          className={cn(
            'flex-shrink-0 flex items-center justify-center',
            'w-10 h-10 text-[var(--color-dim)] hover:text-[var(--color-fg)]',
            'hover:bg-[var(--color-border)] transition-colors',
            content ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          title="清除"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <button
          onClick={handleSubmit}
          disabled={disabled || (!content.trim() && files.length === 0)}
          className={cn(
            'flex-shrink-0 flex items-center justify-center',
            'w-10 h-10 rounded-lg transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            (!content.trim() && files.length === 0)
              ? 'bg-[var(--color-border)] text-[var(--color-muted)]'
              : 'bg-[var(--color-accent)] text-white hover:opacity-90'
          )}
          title="发送"
        >
          <SendIcon size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'flex items-center gap-1 text-small text-[var(--color-dim)]',
              'hover:text-[var(--color-fg)] transition-colors',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            disabled={disabled}
            title="更多选项"
          >
            <PlusIcon size={14} />
            <span>更多</span>
          </button>
        </div>
      </div>
    </div>
  );
};
