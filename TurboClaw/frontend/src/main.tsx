import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { I18nProvider } from './i18n'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { GetPlatformInfo } from '../wailsjs/go/main/App'

posthog.init('phc_MblKGOIAowjXQWwxTMII8Ng2eu0iHm6uzloGI4Ai0sp', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'always', // Always capture profiles
    capture_pageview: true,
    enable_recording_console_log: true,
})

// Fetch platform info and register as super properties
GetPlatformInfo().then((info) => {
    posthog.register({
        os: info.os,
        arch: info.arch,
        client_type: 'desktop_app',
    })
}).catch(console.error)

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <PostHogProvider client={posthog}>
            <I18nProvider>
                <App />
            </I18nProvider>
        </PostHogProvider>
    </React.StrictMode>
)
