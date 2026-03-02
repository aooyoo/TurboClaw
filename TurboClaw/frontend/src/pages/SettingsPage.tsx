import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { Card } from '../components/Card';
import { Config } from '../types';
import { useI18n, Lang } from '../i18n/index';
import { CheckPermissions, OpenPermissionSettings, GetChannelConfig, SaveChannelConfig, OpenLocalPath } from '../../wailsjs/go/main/App';

interface PermissionStatus {
  id: string;
  name: string;
  status: 'granted' | 'denied' | 'unknown';
}

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
  const { t, lang, setLang } = useI18n();
  const [config, setConfig] = useState<Config>(initialConfig);
  const [activeTab, setActiveTab] = useState('model');
  const [saved, setSaved] = useState(false);
  const [permissions, setPermissions] = useState<PermissionStatus[]>([]);
  const [channels, setChannels] = useState<Record<string, any>>({});
  const [channelSaved, setChannelSaved] = useState(false);

  const loadPermissions = async () => {
    try {
      const result = await CheckPermissions() as unknown as PermissionStatus[];
      if (result) setPermissions(result);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  };

  const loadChannels = async () => {
    try {
      const result = await GetChannelConfig() as any;
      if (result) setChannels(result);
    } catch (err) {
      console.error('Failed to load channels:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'permissions') loadPermissions();
    if (activeTab === 'channels') loadChannels();
  }, [activeTab]);

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

  const updateChannel = (name: string, key: string, value: any) => {
    setChannels(prev => ({
      ...prev,
      [name]: { ...prev[name], [key]: value }
    }));
  };

  const handleSaveChannels = async () => {
    try {
      await SaveChannelConfig(channels);
      setChannelSaved(true);
      setTimeout(() => setChannelSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save channels:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="font-mono text-h1 uppercase tracking-widest text-[var(--color-fg)]">
          {t('settings.title')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="model">{t('settings.model.title')}</TabsTrigger>
            <TabsTrigger value="channels">{t('channels.title')}</TabsTrigger>
            <TabsTrigger value="permissions">{t('permissions.title')}</TabsTrigger>
            <TabsTrigger value="about">{t('settings.about.title')}</TabsTrigger>
          </TabsList>

          <TabsContent value="model">
            <Card className="max-w-2xl">
              <div className="space-y-4">
                <div>
                  <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-3">
                    {t('settings.model.title')}
                  </h3>
                </div>

                <div>
                  <label className="text-small-strong text-[var(--color-dim)] uppercase tracking-wide mb-1 block">
                    {t('settings.model.provider')}
                  </label>
                  <select
                    value={config.model_provider}
                    onChange={(e) => handleChange('model_provider', e.target.value)}
                    className="font-mono text-sm w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] px-2 py-1.5"
                  >
                    <option value="zhipu">Zhipu (智谱)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <Input
                  label={t('settings.model.name')}
                  value={config.model_name}
                  onChange={(e) => handleChange('model_name', e.target.value)}
                  placeholder="glm-4"
                  className="font-mono"
                />

                <Input
                  label={t('settings.model.apiKey')}
                  type="password"
                  value={config.model_api_key || ''}
                  onChange={(e) => handleChange('model_api_key', e.target.value)}
                  placeholder="API Key"
                  className="font-mono"
                />

                <Input
                  label={t('settings.model.baseUrl')}
                  value={config.base_url || ''}
                  onChange={(e) => handleChange('base_url', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="font-mono"
                />

                <div className="pt-2 flex gap-2">
                  <Button onClick={handleSave}>{t('settings.save')}</Button>
                  {saved && (
                    <span className="text-small text-[var(--color-success)] flex items-center gap-1">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('settings.saved')}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Language Setting */}
            <Card className="max-w-2xl mt-4">
              <div>
                <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-3">
                  {t('settings.language')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLang('en')}
                    className={`px-4 py-2 rounded font-mono text-sm transition-colors ${lang === 'en'
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-border)] text-[var(--color-dim)] hover:text-[var(--color-fg)]'
                      }`}
                  >
                    {t('settings.language.en')}
                  </button>
                  <button
                    onClick={() => setLang('es')}
                    className={`px-4 py-2 rounded font-mono text-sm transition-colors ${lang === 'es'
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-border)] text-[var(--color-dim)] hover:text-[var(--color-fg)]'
                      }`}
                  >
                    {t('settings.language.es')}
                  </button>
                  <button
                    onClick={() => setLang('zh')}
                    className={`px-4 py-2 rounded font-mono text-sm transition-colors ${lang === 'zh'
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-border)] text-[var(--color-dim)] hover:text-[var(--color-fg)]'
                      }`}
                  >
                    {t('settings.language.zh')}
                  </button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card className="max-w-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-1">
                      {t('permissions.title')}
                    </h3>
                    <p className="text-sm text-[var(--color-dim)]">
                      {t('permissions.desc')}
                    </p>
                  </div>
                  <button
                    onClick={loadPermissions}
                    className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--color-border)] text-[var(--color-dim)] hover:text-[var(--color-fg)] transition-colors"
                  >
                    {t('permissions.refresh')}
                  </button>
                </div>

                <div className="space-y-2">
                  {permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${perm.status === 'granted' ? 'bg-green-500' :
                          perm.status === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                        <span className="font-mono text-sm text-[var(--color-fg)]">
                          {perm.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono ${perm.status === 'granted' ? 'text-green-500' :
                          perm.status === 'denied' ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                          {perm.status === 'granted' ? t('permissions.granted') :
                            perm.status === 'denied' ? t('permissions.denied') :
                              t('permissions.unknown')}
                        </span>
                        {perm.status !== 'granted' && (
                          <button
                            onClick={() => OpenPermissionSettings(perm.id)}
                            className="px-3 py-1 rounded font-mono text-xs bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors"
                          >
                            {t('permissions.openSettings')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-1">
                    {t('channels.title')}
                  </h3>
                  <p className="text-sm text-[var(--color-dim)]">
                    {t('channels.desc')}
                  </p>
                </div>

                {/* Telegram */}
                {channels.telegram && (
                  <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[var(--color-fg)]">📨 Telegram</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={channels.telegram?.enabled || false}
                          onChange={e => updateChannel('telegram', 'enabled', e.target.checked)}
                          className="accent-[var(--color-accent)]" />
                        <span className="text-xs font-mono text-[var(--color-dim)]">
                          {channels.telegram?.enabled ? t('channels.enabled') : t('channels.disabled')}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-[var(--color-dim)]">
                      {t('settings.advanced.telegramDesc')}{' '}
                      <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer"
                        className="text-[var(--color-accent)] hover:underline">@BotFather</a>
                      {' '}{t('settings.advanced.telegramDesc2')}
                    </p>
                    <Input placeholder={t('channels.token')}
                      value={channels.telegram?.token || ''}
                      onChange={e => updateChannel('telegram', 'token', e.target.value)} />
                    <Input placeholder={t('channels.proxy')}
                      value={channels.telegram?.proxy || ''}
                      onChange={e => updateChannel('telegram', 'proxy', e.target.value)} />
                  </div>
                )}

                {/* Discord */}
                {channels.discord && (
                  <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[var(--color-fg)]">🎮 Discord</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={channels.discord?.enabled || false}
                          onChange={e => updateChannel('discord', 'enabled', e.target.checked)}
                          className="accent-[var(--color-accent)]" />
                        <span className="text-xs font-mono text-[var(--color-dim)]">
                          {channels.discord?.enabled ? t('channels.enabled') : t('channels.disabled')}
                        </span>
                      </label>
                    </div>
                    <Input placeholder={t('channels.token')}
                      value={channels.discord?.token || ''}
                      onChange={e => updateChannel('discord', 'token', e.target.value)} />
                  </div>
                )}

                {/* Feishu */}
                {channels.feishu && (
                  <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[var(--color-fg)]">🐦 飞书 / Feishu</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={channels.feishu?.enabled || false}
                          onChange={e => updateChannel('feishu', 'enabled', e.target.checked)}
                          className="accent-[var(--color-accent)]" />
                        <span className="text-xs font-mono text-[var(--color-dim)]">
                          {channels.feishu?.enabled ? t('channels.enabled') : t('channels.disabled')}
                        </span>
                      </label>
                    </div>
                    <Input placeholder={t('channels.appId')}
                      value={channels.feishu?.app_id || ''}
                      onChange={e => updateChannel('feishu', 'app_id', e.target.value)} />
                    <Input placeholder={t('channels.appSecret')}
                      value={channels.feishu?.app_secret || ''}
                      onChange={e => updateChannel('feishu', 'app_secret', e.target.value)} />
                  </div>
                )}

                {/* DingTalk */}
                {channels.dingtalk && (
                  <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[var(--color-fg)]">💬 钉钉 / DingTalk</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={channels.dingtalk?.enabled || false}
                          onChange={e => updateChannel('dingtalk', 'enabled', e.target.checked)}
                          className="accent-[var(--color-accent)]" />
                        <span className="text-xs font-mono text-[var(--color-dim)]">
                          {channels.dingtalk?.enabled ? t('channels.enabled') : t('channels.disabled')}
                        </span>
                      </label>
                    </div>
                    <Input placeholder={t('channels.clientId')}
                      value={channels.dingtalk?.client_id || ''}
                      onChange={e => updateChannel('dingtalk', 'client_id', e.target.value)} />
                    <Input placeholder={t('channels.clientSecret')}
                      value={channels.dingtalk?.client_secret || ''}
                      onChange={e => updateChannel('dingtalk', 'client_secret', e.target.value)} />
                  </div>
                )}

                {/* QQ */}
                {channels.qq && (
                  <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[var(--color-fg)]">🐧 QQ</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={channels.qq?.enabled || false}
                          onChange={e => updateChannel('qq', 'enabled', e.target.checked)}
                          className="accent-[var(--color-accent)]" />
                        <span className="text-xs font-mono text-[var(--color-dim)]">
                          {channels.qq?.enabled ? t('channels.enabled') : t('channels.disabled')}
                        </span>
                      </label>
                    </div>
                    <Input placeholder={t('channels.appId')}
                      value={channels.qq?.app_id || ''}
                      onChange={e => updateChannel('qq', 'app_id', e.target.value)} />
                    <Input placeholder={t('channels.appSecret')}
                      value={channels.qq?.app_secret || ''}
                      onChange={e => updateChannel('qq', 'app_secret', e.target.value)} />
                  </div>
                )}

                <Button onClick={handleSaveChannels} className="w-full">
                  {channelSaved ? t('channels.saved') : t('channels.save')}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card className="max-w-2xl">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-bg)] rounded-lg flex items-center justify-center text-3xl">
                    🦞
                  </div>
                  <h2 className="font-mono text-lg text-[var(--color-fg)] mb-1">TurboClaw</h2>
                  <p className="text-small text-[var(--color-dim)]">v1.0.0</p>
                </div>

                <div className="text-body text-[var(--color-dim)] space-y-2">
                  <p>{t('settings.about.desc')}</p>
                  <p>{t('settings.about.features')}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{t('settings.about.feature1')}</li>
                    <li>{t('settings.about.feature2')}</li>
                    <li>{t('settings.about.feature3')}</li>
                    <li>{t('settings.about.feature4')}</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-3">
                    PicoClaw
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-body">
                      <span className="text-[var(--color-dim)]">Status</span>
                      <span className={picoclawStatus?.installed ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
                        {picoclawStatus?.installed ? '✓ Installed' : '✗ Not found'}
                      </span>
                    </div>
                    <div className="flex justify-between text-body">
                      <span className="text-[var(--color-dim)]">Gateway</span>
                      <span className={picoclawStatus?.running ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
                        {picoclawStatus?.running ? '✓ Running' : '✗ Stopped'}
                      </span>
                    </div>
                    <div className="flex justify-between text-body">
                      <span className="text-[var(--color-dim)]">Config</span>
                      <span
                        className="font-mono text-small cursor-pointer hover:underline text-[var(--color-accent)] truncate max-w-[60%] text-right"
                        onClick={() => picoclawStatus?.configDir && OpenLocalPath(picoclawStatus.configDir)}
                        title="Click to open directory"
                      >
                        {picoclawStatus?.configDir || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-body">
                      <span className="text-[var(--color-dim)]">Workspace</span>
                      <span
                        className="font-mono text-small cursor-pointer hover:underline text-[var(--color-accent)] truncate max-w-[60%] text-right"
                        onClick={() => picoclawStatus?.workspace && OpenLocalPath(picoclawStatus.workspace)}
                        title="Click to open directory"
                      >
                        {picoclawStatus?.workspace || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-small text-[var(--color-muted)]">
                    Built with Wails + React
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
