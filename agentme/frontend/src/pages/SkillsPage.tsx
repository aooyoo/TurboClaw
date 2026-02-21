import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

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
            setError('无法加载 Skills 列表');
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
                    <h1 className="font-mono text-h2 text-[var(--color-fg)] mb-1">Skills</h1>
                    <p className="text-body text-[var(--color-dim)]">
                        已安装的 Agent 技能模块，为 AI 提供额外的能力
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12 text-[var(--color-dim)]">
                        <div className="animate-pulse font-mono">加载中...</div>
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
                                <p className="font-mono text-lg mb-2">暂无 Skills</p>
                                <p className="text-sm">运行 <code className="bg-[var(--color-border)] px-1.5 py-0.5 rounded">picoclaw onboard</code> 初始化</p>
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
                                    {/* Emoji Icon */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-border)] flex items-center justify-center text-xl">
                                        {skill.emoji}
                                    </div>

                                    {/* Content */}
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
                                            {skill.description || '无描述'}
                                        </p>
                                    </div>

                                    {/* Status */}
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
                                            {skill.enabled ? '已启用' : '已禁用'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Footer info */}
                {!loading && skills.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                        <p className="text-small text-[var(--color-muted)]">
                            共 {skills.length} 个 Skills · 存储于 ~/.picoclaw/workspace/skills/
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
