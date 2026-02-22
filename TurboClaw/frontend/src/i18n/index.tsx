import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import zh, { TranslationKeys } from './zh';
import en from './en';
import es from './es';

export type Lang = 'en' | 'es' | 'zh';

const translations: Record<Lang, Record<TranslationKeys, string>> = { en, es, zh };

interface I18nContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
    lang: 'zh',
    setLang: () => { },
    t: (key) => key,
});

function detectSystemLang(): Lang {
    const nav = navigator.language || (navigator as any).userLanguage || 'en';
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('es')) return 'es';
    return 'en';
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Lang>(() => {
        const saved = localStorage.getItem('turboclaw-lang') as Lang;
        return saved || detectSystemLang();
    });

    const setLang = useCallback((newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem('turboclaw-lang', newLang);
    }, []);

    const t = useCallback((key: TranslationKeys, params?: Record<string, string | number>): string => {
        let text = translations[lang]?.[key] || translations['zh'][key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }
        return text;
    }, [lang]);

    return (
        <I18nContext.Provider value={{ lang, setLang, t }
        }>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);
export type { TranslationKeys };
