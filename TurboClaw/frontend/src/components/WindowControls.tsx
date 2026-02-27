import React, { useEffect, useState } from 'react';
import { WindowMinimise, WindowToggleMaximise, Quit, Environment } from '../../wailsjs/runtime/runtime';

export const WindowControls: React.FC = () => {
    const [isWindows, setIsWindows] = useState(false);

    useEffect(() => {
        Environment().then(env => {
            if (env.platform === 'windows') {
                setIsWindows(true);
            }
        }).catch(err => console.error("Failed to get environment:", err));
    }, []);

    if (!isWindows) {
        return null;
    }

    return (
        <div className="absolute top-0 right-0 h-[env(titlebar-area-height,26px)] flex items-center z-[60] titlebar-no-drag">
            <button
                onClick={() => WindowMinimise()}
                className="h-full px-4 hover:bg-[var(--color-hover)] text-[var(--color-dim)] hover:text-[var(--color-fg)] transition-colors flex items-center justify-center"
                title="Minimize"
            >
                <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1" /></svg>
            </button>

            <button
                onClick={() => WindowToggleMaximise()}
                className="h-full px-4 hover:bg-[var(--color-hover)] text-[var(--color-dim)] hover:text-[var(--color-fg)] transition-colors flex items-center justify-center"
                title="Maximize"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="9" height="9" /></svg>
            </button>

            <button
                onClick={() => Quit()}
                className="h-full px-4 hover:bg-red-500 text-[var(--color-dim)] hover:text-white transition-colors flex items-center justify-center"
                title="Close"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="9" y2="9" />
                    <line x1="9" y1="1" x2="1" y2="9" />
                </svg>
            </button>
        </div>
    );
};
