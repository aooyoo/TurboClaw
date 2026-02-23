import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, PlusIcon, LoaderIcon, StopIcon } from './Icon';
import { cn } from '../lib/utils';
import { SelectFiles, GetSkills } from '../../wailsjs/go/main/App';
import { useI18n } from '../i18n/index';
import { main } from '../../wailsjs/go/models';

export interface ChatInputProps {
  onSend: (content: string, files: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
}) => {
  const { t } = useI18n();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [skills, setSkills] = useState<main.Skill[]>([]);
  const [showSkills, setShowSkills] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState<main.Skill[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    GetSkills()
      .then((res) => setSkills(res || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSkills && filteredSkills.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredSkills.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredSkills.length) % filteredSkills.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertSkill(filteredSkills[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSkills(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    const match = /(?:^|\s|\n)\/([a-zA-Z0-9_-]*)$/.exec(val);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = skills.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
      setFilteredSkills(filtered);
      setShowSkills(true);
      setSelectedIndex(0);
    } else {
      setShowSkills(false);
    }
  };

  const insertSkill = (skill: main.Skill) => {
    const newVal = content.replace(/(^|\s|\n)\/[a-zA-Z0-9_-]*$/, `$1/${skill.name} `);
    setContent(newVal);
    setShowSkills(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 10);
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (trimmed || files.length > 0) {
      onSend(trimmed, [...files]);
      setContent('');
      setFiles([]);
      setShowSkills(false);
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
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 relative">
      {/* Skills Dropdown */}
      {showSkills && filteredSkills.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-72 max-h-60 overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-xl z-50 py-1 flex flex-col">
          {filteredSkills.map((skill, idx) => (
            <button
              key={idx}
              onClick={() => insertSkill(skill)}
              className={cn(
                "w-full text-left px-3 py-2 flex items-center gap-3 transition-colors outline-none",
                selectedIndex === idx
                  ? "bg-[var(--color-border)] text-[var(--color-fg)]"
                  : "text-[var(--color-dim)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-fg)]"
              )}
            >
              <span className="text-xl flex-shrink-0">{skill.emoji || '🔧'}</span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-[var(--color-fg)] truncate">/{skill.name}</div>
                <div className="text-xs text-[var(--color-muted)] truncate">{skill.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

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
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.inputPlaceholder')}
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

        {/* Loading Spinner placed to the left of the send button when disabled(loading) */}
        {disabled && (
          <div className="flex items-center justify-center w-10 h-10 text-[var(--color-accent)] animate-spin">
            <LoaderIcon size={18} />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={disabled || (!content.trim() && files.length === 0)}
          className={cn(
            'flex-shrink-0 flex items-center justify-center',
            'w-10 h-10 rounded-lg transition-colors',
            'disabled:opacity-80 disabled:cursor-not-allowed',
            (!content.trim() && files.length === 0 && !disabled)
              ? 'bg-[var(--color-border)] text-[var(--color-muted)]'
              : 'bg-[var(--color-accent)] text-white hover:opacity-90',
            disabled && 'bg-red-500 hover:bg-red-600 text-white' // Stop button styling
          )}
          title={disabled ? "停止" : "发送"}
        >
          {disabled ? <StopIcon size={14} /> : <SendIcon size={18} />}
        </button>
      </div>
    </div>
  );
};
