import React from 'react';
import { UserIcon, BotIcon, CopyIcon } from './Icon';
import { formatTimestamp } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';

export interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-3 px-4 py-3',
      isUser ? '' : 'bg-[var(--color-border)]/30'
    )}>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg',
        isUser ? 'bg-[var(--color-btn-bg)]' : 'bg-[var(--color-accent)]'
      )}>
        {isUser ? (
          <UserIcon size={24} className="text-[var(--color-btn-fg)]" />
        ) : (
          <BotIcon size={24} className="text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-small-strong uppercase tracking-wide">
            {isUser ? '你' : 'TurboClaw'}
          </span>
          <span className="text-small text-[var(--color-muted)]">
            {formatTimestamp(message.timestamp)}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="ml-auto text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
              title={copied ? '已复制' : '复制'}
            >
              {copied ? (
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <CopyIcon size={12} />
              )}
            </button>
          )}
        </div>

        <div className="chat-markdown text-body text-[var(--color-fg)] break-words w-full overflow-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                  />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.files && message.files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.files.map((file, idx) => (
              <div
                key={idx}
                className="text-small text-[var(--color-dim)] bg-[var(--color-border)] px-2 py-1 rounded"
              >
                📎 {file}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
