import React, { useEffect, useState } from 'react';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { Card } from '../components/Card';
import { PlusIcon } from '../components/Icon';
import { ChatSession } from '../types';

export interface ChatPageProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onCreateSession: () => void;
  onSessionSelect: (id: string) => void;
  onSendMessage: (content: string, files: string[]) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  loading?: boolean;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  sessions,
  currentSessionId,
  onCreateSession,
  onSessionSelect,
  onSendMessage,
  onDeleteSession,
  onRenameSession,
  loading = false,
}) => {
  const [mounted, setMounted] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-bg)] rounded-lg flex items-center justify-center">
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-accent)]">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="font-mono text-lg text-[var(--color-fg)] mb-2">开始新的对话</h2>
        <p className="text-body text-[var(--color-dim)] mb-4">
          选择一个现有会话或创建新会话开始与 TurboClaw 交流
        </p>
        <button
          onClick={onCreateSession}
          className="font-mono bg-[var(--color-accent)] text-white px-4 py-2 rounded btn-terminal hover:opacity-90 transition-colors"
        >
          <PlusIcon size={16} className="inline-block mr-2" />
          新建会话
        </button>
      </Card>
    </div>
  );

  const WelcomeState = () => (
    <div className="flex-1 flex items-center justify-center overflow-y-auto">
      <div className="max-w-2xl w-full px-4">
        <div className="text-center mb-8">
          <h1 className="font-mono text-h1 uppercase tracking-widest text-[var(--color-fg)] mb-2">
            TurboClaw
          </h1>
          <p className="text-body text-[var(--color-dim)]">OpenClaw 本地客户端</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-2">
              本地 AI 助手
            </h3>
            <p className="text-body text-[var(--color-dim)]">
              无需联网，在本地使用 AI 助手处理您的任务
            </p>
          </Card>
          <Card>
            <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-2">
              多模型支持
            </h3>
            <p className="text-body text-[var(--color-dim)]">
              支持配置自定义模型和 API
            </p>
          </Card>
          <Card>
            <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-2">
              文件上传
            </h3>
            <p className="text-body text-[var(--color-dim)]">
              支持上传文件进行分析和处理
            </p>
          </Card>
          <Card>
            <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-2">
              会话管理
            </h3>
            <p className="text-body text-[var(--color-dim)]">
              创建多个对话会话，随时切换
            </p>
          </Card>
        </div>
      </div>
    </div>
  );

  const ChatView = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {currentSession && currentSession.messages.length > 0 ? (
          <div className={mounted ? 'terminal-fadein' : ''}>
            {currentSession.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <WelcomeState />
        )}
      </div>

      <ChatInput
        onSend={onSendMessage}
        disabled={loading}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      {!currentSession && (
        <EmptyState />
      )}
      {currentSession && (
        <ChatView />
      )}
    </div>
  );
};
