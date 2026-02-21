import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { ChatIcon, SkillsIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from './Icon';
import { useI18n } from '../i18n/index';

export interface SidebarProps {
  currentPage: 'chat' | 'skills' | 'settings';
  onPageChange: (page: 'chat' | 'skills' | 'settings') => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  sessions?: Array<{ id: string; name: string }>;
  currentSessionId?: string;
  onSessionSelect?: (id: string) => void;
  onCreateSession?: () => void;
  onDeleteSession?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  collapsed = false,
  onToggleCollapse,
  sessions = [],
  currentSessionId,
  onSessionSelect,
  onCreateSession,
  onDeleteSession,
}) => {
  const { t } = useI18n();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeleteSession?.(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 3000);
    }
  };

  const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-2 py-2 w-full transition-colors',
        'font-mono text-sm',
        active
          ? 'bg-[var(--color-accent)] text-white'
          : 'text-[var(--color-dim)] hover:text-[var(--color-fg)] hover:bg-[var(--color-border)]'
      )}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <aside
      className={cn(
        'flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]',
        'transition-all duration-200 pt-[env(titlebar-area-height,26px)] overflow-hidden',
        collapsed ? 'w-12' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="py-1.5 px-3 border-b border-[var(--color-border)] flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">🦞</span>
            <span className="font-mono font-bold text-sm text-[var(--color-fg)]">TurboClaw</span>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <span className="text-lg">🦞</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="text-[var(--color-dim)] hover:text-[var(--color-fg)] transition-colors"
        >
          {collapsed ? <ChevronRightIcon size={14} /> : <ChevronLeftIcon size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-2 flex flex-col gap-1">
        <NavItem
          icon={<ChatIcon size={16} />}
          label={t('sidebar.chat')}
          active={currentPage === 'chat'}
          onClick={() => onPageChange('chat')}
        />
        <NavItem
          icon={<SkillsIcon size={16} />}
          label={t('sidebar.skills')}
          active={currentPage === 'skills'}
          onClick={() => onPageChange('skills')}
        />
        <NavItem
          icon={<SettingsIcon size={16} />}
          label={t('sidebar.settings')}
          active={currentPage === 'settings'}
          onClick={() => onPageChange('settings')}
        />
      </nav>

      {/* Sessions Section - Only show on chat page */}
      {currentPage === 'chat' && !collapsed && (
        <div className="flex-1 min-h-0 overflow-y-auto px-2 flex flex-col gap-0.5">
          <div className="text-small text-[var(--color-muted)] uppercase tracking-wide py-1">
            {t('sidebar.history')}
          </div>
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                'group flex items-center transition-colors rounded-sm',
                currentSessionId === session.id
                  ? 'bg-[var(--color-border)] text-[var(--color-fg)]'
                  : 'text-[var(--color-dim)] hover:text-[var(--color-fg)] hover:bg-[var(--color-border)]'
              )}
            >
              <button
                onClick={() => onSessionSelect?.(session.id)}
                className="flex-1 text-left px-2 py-1.5 text-sm font-mono truncate min-w-0"
              >
                {session.name}
              </button>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className={cn(
                  'flex-shrink-0 px-1.5 py-1 text-xs transition-all mr-1',
                  confirmDeleteId === session.id
                    ? 'text-red-500 opacity-100'
                    : 'text-[var(--color-muted)] opacity-0 group-hover:opacity-100 hover:text-red-500'
                )}
                title={confirmDeleteId === session.id ? t('sidebar.confirmDeleteTitle') : t('sidebar.deleteTitle')}
              >
                {confirmDeleteId === session.id ? (
                  <span className="font-mono text-xs">{t('sidebar.confirmDelete')}</span>
                ) : (
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                )}
              </button>
            </div>
          ))}
          <button
            onClick={onCreateSession}
            className="text-left px-2 py-1.5 text-sm font-mono text-[var(--color-accent)] hover:underline"
          >
            {t('sidebar.newSession')}
          </button>
        </div>
      )}

      {/* Bottom Section */}
      <div className="px-3 py-2 border-t border-[var(--color-border)]">
        <div className="text-small text-[var(--color-muted)]">
          {!collapsed && 'v1.0.0'}
        </div>
      </div>
    </aside>
  );
};
