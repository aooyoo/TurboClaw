// Spanish translations
import { TranslationKeys } from './zh';

const es: Record<TranslationKeys, string> = {
    // Sidebar
    'sidebar.chat': 'Chat',
    'sidebar.skills': 'Skills',
    'sidebar.settings': 'Ajustes',
    'sidebar.history': 'Historial',
    'sidebar.newSession': 'Nuevo chat',
    'sidebar.confirmDelete': '¿Seguro?',
    'sidebar.deleteTitle': 'Eliminar chat',
    'sidebar.confirmDeleteTitle': 'Haz clic de nuevo para confirmar',

    // Chat Page
    'chat.title': 'TurboClaw',
    'chat.subtitle': 'Tu Agente Personal',
    'chat.card.chat.title': '💬 Iniciar Chat',
    'chat.card.chat.desc': 'Asigna tareas a tu Agente',
    'chat.card.code.title': '🔧 Asistente de Código',
    'chat.card.code.desc': 'Escribe, depura y optimiza código',
    'chat.card.write.title': '✍️ Asistente de Escritura',
    'chat.card.write.desc': 'Escribe, traduce y mejora artículos',
    'chat.card.analyze.title': '📊 Análisis de Datos',
    'chat.card.analyze.desc': 'Analiza datos y genera informes',

    // Chat Message
    'chat.you': 'Tú',
    'chat.bot': 'TurboClaw',
    'chat.copied': 'Copiado',
    'chat.copy': 'Copiar',
    'chat.justNow': 'Ahora',

    // Chat Input
    'chat.inputPlaceholder': 'Escribe un mensaje... (Enter para enviar, Shift+Enter nueva línea)',
    'chat.more': 'Más',

    // Skills Page
    'skills.title': 'Skills',
    'skills.subtitle': 'Módulos de habilidades del agente que amplían las capacidades de IA',
    'skills.loading': 'Cargando...',
    'skills.loadError': 'Error al cargar las skills',
    'skills.empty': 'Sin Skills',
    'skills.emptyHint': 'Ejecuta picoclaw onboard para inicializar',
    'skills.enabled': 'Activo',
    'skills.disabled': 'Inactivo',
    'skills.noDesc': 'Sin descripción',
    'skills.total': '{count} Skills en total',
    'skills.storagePath': 'Almacenado en ~/.picoclaw/workspace/skills/',

    // Settings Page
    'settings.title': 'Ajustes',
    'settings.model.title': 'Configuración del Modelo',
    'settings.model.provider': 'Proveedor del Modelo',
    'settings.model.name': 'Nombre del Modelo',
    'settings.model.apiKey': 'API Key',
    'settings.model.baseUrl': 'API Base URL (opcional)',
    'settings.advanced.title': 'Ajustes Avanzados',
    'settings.advanced.telegram': 'Telegram Bot Token',
    'settings.advanced.telegramDesc': 'Configura Telegram Bot para acceso remoto. Primero crea un bot en',
    'settings.advanced.telegramDesc2': 'para obtener tu Token.',
    'settings.save': 'Guardar',
    'settings.saved': '¡Guardado!',
    'settings.about.title': 'Acerca de',
    'settings.about.desc': 'TurboClaw es un cliente de Agente local que facilita la gestión y uso de tu asistente personal de IA.',
    'settings.about.features': 'Características principales:',
    'settings.about.feature1': 'Personalidad única y memoria a largo plazo, mecanismo de latido activo, tareas programadas',
    'settings.about.feature2': 'Acceso a archivos locales, edición, organización, permisos de línea de comandos a nivel de sistema',
    'settings.about.feature3': 'Gestión de múltiples sesiones, soporte para múltiples modelos, soporte para múltiples idiomas',
    'settings.about.feature4': 'Control remoto por Telegram, mercado de skills, sistema de plugins',
    'settings.language': 'Idioma',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.es': 'Español',

    // Errors
    'error.picoNotInstalled': 'PicoClaw no está instalado.',
    'error.noResponse': 'No se recibió respuesta. Revisa la configuración.',
    'error.picoFailed': 'Error en la ejecución de PicoClaw',

    // Authorization
    'auth.title': 'Autorización de Ruta',
    'auth.message': 'Las siguientes rutas están fuera del espacio de trabajo. El Agente obtendrá acceso a estas rutas:',
    'auth.allow': 'Autorizar',
    'auth.deny': 'Cancelar',

    // Permissions
    'permissions.title': 'Permisos',
    'permissions.desc': 'Gestiona los permisos del sistema. El Agente necesita acceso a tus archivos.',
    'permissions.granted': 'Concedido',
    'permissions.denied': 'Denegado',
    'permissions.unknown': 'Desconocido',
    'permissions.openSettings': 'Abrir Ajustes',
    'permissions.refresh': 'Actualizar',

    // Channels
    'channels.title': 'Canales',
    'channels.desc': 'Configura canales de mensajería para interactuar con el Agente desde diferentes plataformas.',
    'channels.enabled': 'Activo',
    'channels.disabled': 'Inactivo',
    'channels.token': 'Token',
    'channels.proxy': 'Proxy',
    'channels.appId': 'App ID',
    'channels.appSecret': 'App Secret',
    'channels.clientId': 'Client ID',
    'channels.clientSecret': 'Client Secret',
    'channels.save': 'Guardar Canales',
    'channels.saved': '¡Guardado!',
};

export default es;
