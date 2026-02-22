// Chinese translations
const zh = {
    // Sidebar
    'sidebar.chat': '对话',
    'sidebar.skills': '技能',
    'sidebar.settings': '设置',
    'sidebar.history': '会话历史',
    'sidebar.newSession': '新建会话',
    'sidebar.confirmDelete': '确认?',
    'sidebar.deleteTitle': '删除会话',
    'sidebar.confirmDeleteTitle': '再次点击确认删除',

    // Chat Page
    'chat.title': 'TurboClaw',
    'chat.subtitle': '只属于你的Agent',
    'chat.card.chat.title': '💬 开始对话',
    'chat.card.chat.desc': '给你的 Agent 分配任务',
    'chat.card.code.title': '🔧 代码助手',
    'chat.card.code.desc': '编写、调试和优化代码',
    'chat.card.write.title': '✍️ 写作助手',
    'chat.card.write.desc': '文章撰写、翻译和润色',
    'chat.card.analyze.title': '📊 数据分析',
    'chat.card.analyze.desc': '分析数据并生成报告',

    // Chat Message
    'chat.you': '你',
    'chat.bot': 'TurboClaw',
    'chat.copied': '已复制',
    'chat.copy': '复制',
    'chat.justNow': '刚刚',

    // Chat Input
    'chat.inputPlaceholder': '输入消息... (Enter 发送, Shift+Enter 换行)',
    'chat.more': '更多',

    // Skills Page
    'skills.title': '技能',
    'skills.subtitle': '已安装的 Agent 技能模块，为 AI 提供额外的能力',
    'skills.loading': '加载中...',
    'skills.loadError': '无法加载技能列表',
    'skills.empty': '暂无技能',
    'skills.emptyHint': '运行 picoclaw onboard 初始化',
    'skills.enabled': '已启用',
    'skills.disabled': '已禁用',
    'skills.noDesc': '无描述',
    'skills.total': '共 {count} 个技能',
    'skills.storagePath': '存储于 ~/.picoclaw/workspace/skills/',

    // Settings Page
    'settings.title': '设置',
    'settings.model.title': '模型设置',
    'settings.model.provider': '模型提供商',
    'settings.model.name': '模型名称',
    'settings.model.apiKey': 'API Key',
    'settings.model.baseUrl': 'API Base URL (可选)',
    'settings.advanced.title': '高级设置',
    'settings.advanced.telegram': 'Telegram Bot Token',
    'settings.advanced.telegramDesc': '配置 Telegram Bot 以启用远程访问功能。请先在',
    'settings.advanced.telegramDesc2': '创建机器人并获取 Token。',
    'settings.save': '保存设置',
    'settings.saved': '已保存!',
    'settings.about.title': '关于',
    'settings.about.desc': 'TurboClaw 是本地 Agent 客户端，让您能够方便地管理和使用本地 AI 助手。',
    'settings.about.features': '主要功能包括：',
    'settings.about.feature1': '独特个性和长期记忆、主动性心跳机制、定时任务',
    'settings.about.feature2': '本地文件访问、编辑、整理、系统级命令行权限',
    'settings.about.feature3': '多会话管理、多模型支持、多语言支持',
    'settings.about.feature4': 'Telegram 随身控制、技能市场、插件系统',
    'settings.language': '语言',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.es': 'Español',

    // Errors
    'error.picoNotInstalled': 'PicoClaw 未安装。',
    'error.noResponse': '未收到响应，请检查配置。',
    'error.picoFailed': 'PicoClaw 执行失败',

    // Authorization
    'auth.title': '路径授权',
    'auth.message': '以下文件路径在工作区外，Agent 将获得这些路径的访问权限：',
    'auth.allow': '授权访问',
    'auth.deny': '取消',

    // Permissions
    'permissions.title': '权限管理',
    'permissions.desc': '管理 TurboClaw 的系统权限，Agent 需要这些权限来访问您的文件。',
    'permissions.granted': '已授权',
    'permissions.denied': '未授权',
    'permissions.unknown': '未知',
    'permissions.openSettings': '打开设置',
    'permissions.refresh': '刷新状态',

    // Channels
    'channels.title': '通道配置',
    'channels.desc': '配置消息通道，让 Agent 可以通过不同平台与您交互。',
    'channels.enabled': '启用',
    'channels.disabled': '未启用',
    'channels.token': 'Token',
    'channels.proxy': '代理',
    'channels.appId': 'App ID',
    'channels.appSecret': 'App Secret',
    'channels.clientId': 'Client ID',
    'channels.clientSecret': 'Client Secret',
    'channels.save': '保存通道配置',
    'channels.saved': '已保存!',
};

export default zh;
export type TranslationKeys = keyof typeof zh;
