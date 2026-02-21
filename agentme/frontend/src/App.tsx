import React, { useState, useEffect } from 'react';
import './index.css';
import { Sidebar } from './components/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { SkillsPage } from './pages/SkillsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChatSession, Config, PicoclawStatus } from './types';
import {
  GetSessions,
  GetConfig,
  GetPicoclawStatus,
  GetSkills,
  CreateSession,
  SetCurrentSession,
  DeleteSession,
  SendMessage,
  GetAIResponse,
  SaveConfig
} from '../wailsjs/go/main/App';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'chat' | 'skills' | 'settings'>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [config, setConfig] = useState<Config>({
    model_provider: 'zhipu',
    model_name: 'glm-4.7',
    extra_settings: {},
  });
  const [picoclawStatus, setPicoclawStatus] = useState<PicoclawStatus | undefined>();
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSessions();
    loadConfig();
    loadPicoclawStatus();
  }, []);

  const loadSessions = async () => {
    try {
      const result = await GetSessions() as unknown as ChatSession[];
      if (result) {
        setSessions(result);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const loadConfig = async () => {
    try {
      const result = await GetConfig() as unknown as Config;
      if (result) {
        setConfig(result);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const loadPicoclawStatus = async () => {
    try {
      const result = await GetPicoclawStatus() as unknown as PicoclawStatus;
      if (result) {
        setPicoclawStatus(result);
      }
    } catch (err) {
      console.error('Failed to load picoclaw status:', err);
    }
  };

  const handleCreateSession = async () => {
    try {
      const session = await CreateSession(`对话 ${sessions.length + 1}`) as unknown as ChatSession;
      if (session) {
        setSessions(prev => [session, ...prev]);
        setCurrentSessionId(session.id);
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleSessionSelect = async (id: string) => {
    try {
      await SetCurrentSession(id);
      setCurrentSessionId(id);
    } catch (err) {
      console.error('Failed to select session:', err);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await DeleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(undefined);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSendMessage = async (content: string, files: string[]) => {
    if (!content && files.length === 0) return;

    try {
      // Phase 1: Add user message and update UI immediately
      const sessionWithUserMsg = await SendMessage(content, files) as unknown as ChatSession;
      if (sessionWithUserMsg) {
        setSessions(prev => prev.map(s =>
          s.id === sessionWithUserMsg.id ? sessionWithUserMsg : s
        ));
      }

      // Phase 2: Get AI response asynchronously
      setLoading(true);
      const sessionWithAIResponse = await GetAIResponse(content, files) as unknown as ChatSession;
      if (sessionWithAIResponse) {
        setSessions(prev => prev.map(s =>
          s.id === sessionWithAIResponse.id ? sessionWithAIResponse : s
        ));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (newConfig: Config) => {
    try {
      await SaveConfig(newConfig as any);
      setConfig(newConfig);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-[env(titlebar-area-height,26px)]">
        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {currentPage === 'chat' ? (
            <ChatPage
              sessions={sessions}
              currentSessionId={currentSessionId}
              onCreateSession={handleCreateSession}
              onSessionSelect={handleSessionSelect}
              onSendMessage={handleSendMessage}
              onDeleteSession={handleDeleteSession}
              onRenameSession={() => { }}
              loading={loading}
            />
          ) : currentPage === 'skills' ? (
            <SkillsPage
              onLoadSkills={async () => {
                const result = await GetSkills() as any;
                return result || [];
              }}
            />
          ) : (
            <SettingsPage
              config={config}
              onSaveConfig={handleSaveConfig}
              picoclawStatus={picoclawStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}
