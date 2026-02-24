import React from 'react';
import { UserIcon, BotIcon, CopyIcon } from './Icon';
import { formatTimestamp } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';
import { useI18n } from '../i18n/index';
import { BrowserOpenURL } from '../../wailsjs/runtime/runtime';
import { OpenLocalPath } from '../../wailsjs/go/main/App';

const preprocessMessage = (content: string) => {
  if (!content) return '';
  // Split by code blocks (```...```) and inline code (`...`) to avoid modifying code content
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return parts.map(part => {
    // If it's a code block or inline code, return untouched
    if (part.startsWith('`')) return part;

    // Replace absolute paths with markdown links, but ignore paths already inside markdown links like [name](/path)
    // We do this by excluding characters like [, ], (, ) from preceding the path.
    return part.replace(/(^|[^a-zA-Z0-9_\/\]\(\)\[])(\/(?:Users|tmp|var|private|Volumes|Library|System)\/[a-zA-Z0-9_.+/-]+)/g, '$1[$2]($2)');
  }).join('');
};

export interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { t } = useI18n();
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
            {isUser ? t('chat.you') : t('chat.bot')}
          </span>
          <span className="text-small text-[var(--color-muted)]">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div className="chat-markdown text-body text-[var(--color-fg)] break-words w-full overflow-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              a({ href, children, ...props }: any) {
                return (
                  <a
                    {...props}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!href) return;
                      // Determine if it's a local file path
                      if (href.startsWith('/Users') || href.startsWith('/tmp') || href.startsWith('/Volumes') || href.startsWith('/var')) {
                        OpenLocalPath(href).catch((err: any) => console.error("Failed to open local path", err));
                      } else {
                        BrowserOpenURL(href);
                      }
                    }}
                    className="text-blue-500 hover:text-blue-400 underline decoration-blue-500/30 hover:decoration-blue-400"
                  >
                    {children}
                  </a>
                );
              },
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const textContent = String(children).replace(/\n$/, '');

                // Allow clicking on code block/inline if it's a local absolute path
                const isPath = !match && (
                  textContent.startsWith('/Users') ||
                  textContent.startsWith('/Volumes') ||
                  textContent.startsWith('/tmp') ||
                  textContent.startsWith('/var') ||
                  textContent.startsWith('/private') ||
                  textContent.startsWith('/Library') ||
                  textContent.startsWith('/System')
                );

                if (isPath) {
                  return (
                    <code
                      {...props}
                      className={cn(className, "cursor-pointer text-blue-500 hover:text-blue-400 hover:underline bg-[var(--color-border)]/50 px-1 py-0.5 rounded")}
                      onClick={() => OpenLocalPath(textContent).catch(console.error)}
                      title="点击打开文件/文件夹"
                    >
                      {children}
                    </code>
                  );
                }

                return match ? (
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
            {preprocessMessage(message.content).replace(/__i18n:([a-zA-Z0-9_\.]+)__/g, (match, key) => t(key as any) || match)}
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

        {!isUser && (
          <div className="mt-2 flex">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors py-1 px-2 -ml-2 rounded hover:bg-[var(--color-border)]/50"
            >
              {copied ? (
                <>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t('chat.copied')}
                </>
              ) : (
                <>
                  <CopyIcon size={12} />
                  {t('chat.copy')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
