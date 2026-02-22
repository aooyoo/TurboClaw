import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { useI18n } from '../i18n/index';

interface Skill {
    name: string;
    description: string;
    source: string;
    emoji: string;
    enabled: boolean;
}

interface SkillsPageProps {
    onLoadSkills: () => Promise<Skill[]>;
}

export const SkillsPage: React.FC<SkillsPageProps> = ({ onLoadSkills }) => {
    const { t } = useI18n();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await onLoadSkills();
            setSkills(result || []);
        } catch (err) {
            setError(t('skills.loadError'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="font-mono text-h2 text-[var(--color-fg)] mb-1">{t('skills.title')}</h1>
                    <p className="text-body text-[var(--color-dim)]">
                        {t('skills.subtitle')}
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12 text-[var(--color-dim)]">
                        <div className="animate-pulse font-mono">{t('skills.loading')}</div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                        <p className="text-red-400 text-sm font-mono">{error}</p>
                    </div>
                )}

                {/* Skills Grid */}
                {!loading && !error && (
                    <div className="grid gap-3">
                        {skills.length === 0 ? (
                            <div className="text-center py-12 text-[var(--color-dim)]">
                                <p className="font-mono text-lg mb-2">{t('skills.empty')}</p>
                                <p className="text-sm"><code className="bg-[var(--color-border)] px-1.5 py-0.5 rounded">{t('skills.emptyHint')}</code></p>
                            </div>
                        ) : (
                            skills.map((skill) => (
                                <div
                                    key={skill.name}
                                    className={cn(
                                        'flex items-start gap-4 p-4 rounded-lg border transition-all',
                                        'bg-[var(--color-surface)] border-[var(--color-border)]',
                                        'hover:border-[var(--color-accent)]/40 hover:shadow-sm'
                                    )}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-border)] flex items-center justify-center text-xl">
                                        {skill.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-mono text-sm font-bold text-[var(--color-fg)]">
                                                {skill.name}
                                            </h3>
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-muted)] font-mono">
                                                {skill.source}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-dim)] leading-relaxed">
                                            {skill.description || t('skills.noDesc')}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full',
                                            skill.enabled
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-[var(--color-border)] text-[var(--color-muted)]'
                                        )}>
                                            <span className={cn(
                                                'w-1.5 h-1.5 rounded-full',
                                                skill.enabled ? 'bg-green-500' : 'bg-[var(--color-muted)]'
                                            )} />
                                            {skill.enabled ? t('skills.enabled') : t('skills.disabled')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {!loading && skills.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                        <p className="text-small text-[var(--color-muted)]">
                            {t('skills.total', { count: skills.length })} · {t('skills.storagePath')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
