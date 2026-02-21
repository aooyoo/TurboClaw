import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { Card } from '../components/Card';
import { Config } from '../types';
import { useI18n, Lang } from '../i18n/index';

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
          {t('settings.title')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="model">{t('settings.model.title')}</TabsTrigger>
            <TabsTrigger value="advanced">{t('settings.advanced.title')}</TabsTrigger>
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

          <TabsContent value="advanced">
            <Card className="max-w-2xl">
              <div className="space-y-4">
                <div>
                  <h3 className="font-mono text-small-strong uppercase text-[var(--color-fg)] mb-3">
                    {t('settings.advanced.title')}
                  </h3>
                  <p className="text-body text-[var(--color-dim)] mb-4">
                    {t('settings.advanced.telegramDesc')}{' '}
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      @BotFather
                    </a>
                    {' '}{t('settings.advanced.telegramDesc2')}
                  </p>
                </div>

                <Input
                  label={t('settings.advanced.telegram')}
                  type="password"
                  value={config.telegram_bot_token || ''}
                  onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
                  placeholder="Telegram Bot Token"
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

            <Card className="max-w-2xl mt-4">
              <div>
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
                    <span className="text-[var(--color-dim)]">Config</span>
                    <span className="font-mono text-small">{picoclawStatus?.configDir || '—'}</span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span className="text-[var(--color-dim)]">Workspace</span>
                    <span className="font-mono text-small">{picoclawStatus?.workspace || '—'}</span>
                  </div>
                </div>
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
                  </ul>
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
