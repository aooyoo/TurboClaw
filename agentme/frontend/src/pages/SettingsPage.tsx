import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { Card } from '../components/Card';
import { Config } from '../types';

export interface SettingsPageProps {
  config: Config;
  onSaveConfig: (config: Config) => void;
  picoclawStatus?: {
    installed: boolean;
    running: boolean;
    configDir: string;
    workspace: string;
  };
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  config: initialConfig,
  onSaveConfig,
  picoclawStatus,
}) => {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [activeTab, setActiveTab] = useState('telegram');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleChange = (key: keyof Config, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSaveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="font-mono text-h1 uppercase tracking-widest text-[var(--color-fg)]">
          设置
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="model">模型配置</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          <TabsContent value="telegram">
            <Card className="max-w-2xl">
              <div className="space-y-4">
                <div>
                  <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-3">
                    Telegram Bot 配置
                  </h3>
                  <p className="text-body text-[var(--color-dim)] mb-4">
                    配置 Telegram Bot 以启用远程访问功能。请先在
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent)] hover:underline mx-1"
                    >
                      @BotFather
                    </a>
                    创建机器人并获取 Token。
                  </p>
                </div>

                <Input
                  label="Bot Token"
                  type="password"
                  value={config.telegram_bot_token || ''}
                  onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
                  placeholder="请输入 Telegram Bot Token"
                  className="font-mono"
                />

                <div className="pt-2 flex gap-2">
                  <Button onClick={handleSave}>保存配置</Button>
                  {saved && (
                    <span className="text-small text-[var(--color-success)] flex items-center gap-1">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      已保存
                    </span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="max-w-2xl mt-4">
              <div>
                <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-3">
                  PicoClaw 状态
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-body">
                    <span className="text-[var(--color-dim)]">安装状态</span>
                    <span className={picoclawStatus?.installed ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
                      {picoclawStatus?.installed ? '已安装' : '未找到'}
                    </span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span className="text-[var(--color-dim)]">运行状态</span>
                    <span className={picoclawStatus?.running ? 'text-[var(--color-success)]' : 'text-[var(--color-dim)]'}>
                      {picoclawStatus?.running ? '运行中' : '已停止'}
                    </span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span className="text-[var(--color-dim)]">配置目录</span>
                    <span className="font-mono text-small">{picoclawStatus?.configDir || '未知'}</span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span className="text-[var(--color-dim)]">工作空间</span>
                    <span className="font-mono text-small">{picoclawStatus?.workspace || '未知'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="model">
            <Card className="max-w-2xl">
              <div className="space-y-4">
                <div>
                  <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-3">
                    AI 模型配置
                  </h3>
                  <p className="text-body text-[var(--color-dim)] mb-4">
                    配置您希望使用的 AI 模型。您可以配置自定义 API 或使用 OpenClaw 提供的默认模型。
                  </p>
                </div>

                <div>
                  <label className="text-small-strong text-[var(--color-dim)] uppercase tracking-wide mb-1 block">
                    模型提供商
                  </label>
                  <select
                    value={config.model_provider}
                    onChange={(e) => handleChange('model_provider', e.target.value)}
                    className="font-mono text-sm w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] px-2 py-1.5"
                  >
                    <option value="openclaw">OpenClaw (默认)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>

                <Input
                  label="模型名称"
                  value={config.model_name}
                  onChange={(e) => handleChange('model_name', e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="font-mono"
                />

                {config.model_provider !== 'openclaw' && (
                  <>
                    <Input
                      label="API Key"
                      type="password"
                      value={config.model_api_key || ''}
                      onChange={(e) => handleChange('model_api_key', e.target.value)}
                      placeholder="请输入 API Key"
                      className="font-mono"
                    />

                    <Input
                      label="Base URL (可选)"
                      value={config.base_url || ''}
                      onChange={(e) => handleChange('base_url', e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="font-mono"
                    />
                  </>
                )}

                <div className="pt-2 flex gap-2">
                  <Button onClick={handleSave}>保存配置</Button>
                  {saved && (
                    <span className="text-small text-[var(--color-success)] flex items-center gap-1">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      已保存
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card className="max-w-2xl">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-bg)] rounded-lg flex items-center justify-center">
                    <svg width={32} height={32} viewBox="0 0 24 24" fill="var(--color-accent)">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--color-accent)" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <h2 className="font-mono text-lg text-[var(--color-fg)] mb-1">TurboClaw</h2>
                  <p className="text-small text-[var(--color-dim)]">版本 1.0.0</p>
                </div>

                <div className="text-body text-[var(--color-dim)] space-y-2">
                  <p>
                    TurboClaw 是 OpenClaw 的本地客户端，让您能够方便地管理和使用本地 AI 助手。
                  </p>
                  <p>
                    主要功能包括：
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>本地 AI 对话</li>
                    <li>多模型支持</li>
                    <li>Telegram Bot 集成</li>
                    <li>会话管理</li>
                    <li>文件上传</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-small text-[var(--color-muted)]">
                    基于 Wails 和 React 构建
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
