// English translations
import { TranslationKeys } from './zh';

const en: Record<TranslationKeys, string> = {
    // Sidebar
    'sidebar.chat': 'Chat',
    'sidebar.skills': 'Skills',
    'sidebar.settings': 'Settings',
    'sidebar.history': 'History',
    'sidebar.newSession': 'New Chat',
    'sidebar.confirmDelete': 'Sure?',
    'sidebar.deleteTitle': 'Delete chat',
    'sidebar.confirmDeleteTitle': 'Click again to confirm',

    // Chat Page
    'chat.title': 'TurboClaw',
    'chat.subtitle': 'Your Personal Agent',
    'chat.card.chat.title': '💬 Start Chat',
    'chat.card.chat.desc': 'Assign tasks to your Agent',
    'chat.card.code.title': '🔧 Code Assistant',
    'chat.card.code.desc': 'Write, debug and optimize code',
    'chat.card.write.title': '✍️ Writing Assistant',
    'chat.card.write.desc': 'Write, translate and polish articles',
    'chat.card.analyze.title': '📊 Data Analysis',
    'chat.card.analyze.desc': 'Analyze data and generate reports',

    // Chat Message
    'chat.you': 'You',
    'chat.bot': 'TurboClaw',
    'chat.copied': 'Copied',
    'chat.copy': 'Copy',
    'chat.justNow': 'Just now',

    // Chat Input
    'chat.inputPlaceholder': 'Type a message... (Enter to send, Shift+Enter for newline)',
    'chat.more': 'More',

    // Skills Page
    'skills.title': 'Skills',
    'skills.subtitle': 'Installed agent skill modules that extend AI capabilities',
    'skills.loading': 'Loading...',
    'skills.loadError': 'Failed to load skills',
    'skills.empty': 'No Skills',
    'skills.emptyHint': 'Run picoclaw onboard to initialize',
    'skills.enabled': 'Enabled',
    'skills.disabled': 'Disabled',
    'skills.noDesc': 'No description',
    'skills.total': '{count} Skills total',
    'skills.storagePath': 'Stored at ~/.picoclaw/workspace/skills/',

    // Settings Page
    'settings.title': 'Settings',
    'settings.model.title': 'Model Settings',
    'settings.model.provider': 'Model Provider',
    'settings.model.name': 'Model Name',
    'settings.model.apiKey': 'API Key',
    'settings.model.baseUrl': 'API Base URL (optional)',
    'settings.advanced.title': 'Advanced Settings',
    'settings.advanced.telegram': 'Telegram Bot Token',
    'settings.advanced.telegramDesc': 'Configure Telegram Bot for remote access. First create a bot at',
    'settings.advanced.telegramDesc2': 'to get your Token.',
    'settings.save': 'Save Settings',
    'settings.saved': 'Saved!',
    'settings.about.title': 'About',
    'settings.about.desc': 'TurboClaw is a local Agent client that makes it easy to manage and use your personal AI assistant.',
    'settings.about.features': 'Key features:',
    'settings.about.feature1': 'Chat with AI assistant',
    'settings.about.feature2': 'File upload and analysis',
    'settings.about.feature3': 'Multi-session management',
    'settings.language': 'Language',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.es': 'Español',

    // Errors
    'error.picoNotInstalled': 'PicoClaw is not installed.',
    'error.noResponse': 'No response received. Please check your configuration.',
    'error.picoFailed': 'PicoClaw execution failed',
};

export default en;
