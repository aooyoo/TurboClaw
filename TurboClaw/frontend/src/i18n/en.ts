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
    'settings.about.feature1': 'Unique personality and long-term memory, active heartbeat mechanism, scheduled tasks',
    'settings.about.feature2': 'Local file access, editing, organization, system-level command line permissions',
    'settings.about.feature3': 'Multi-session management, multi-model support, multi-language support',
    'settings.about.feature4': 'Use your favorite chat app for remote control, skills marketplace, plugin system',
    'settings.language': 'Language',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.es': 'Español',

    // Errors
    'error.picoNotInstalled': 'PicoClaw is not installed.',
    'error.noResponse': 'No response received. Please check your configuration.',
    'error.picoFailed': 'PicoClaw execution failed',

    // Authorization
    'auth.title': 'Path Authorization',
    'auth.message': 'The following file paths are outside the workspace. The Agent will gain access to these paths:',
    'auth.allow': 'Authorize',
    'auth.deny': 'Cancel',

    // Permissions
    'permissions.title': 'Permissions',
    'permissions.desc': 'Manage TurboClaw system permissions. The Agent needs these to access your files.',
    'permissions.granted': 'Granted',
    'permissions.denied': 'Denied',
    'permissions.unknown': 'Unknown',
    'permissions.openSettings': 'Open Settings',
    'permissions.refresh': 'Refresh',

    // Channels
    'channels.title': 'Channels',
    'channels.desc': 'Configure messaging channels for Agent to interact with you across platforms.',
    'channels.enabled': 'Enabled',
    'channels.disabled': 'Disabled',
    'channels.token': 'Token',
    'channels.proxy': 'Proxy',
    'channels.appId': 'App ID',
    'channels.appSecret': 'App Secret',
    'channels.clientId': 'Client ID',
    'channels.clientSecret': 'Client Secret',
    'channels.save': 'Save Channels',
    'channels.saved': 'Saved!',
};

export default en;
