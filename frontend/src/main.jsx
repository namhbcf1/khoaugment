import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-simple.jsx'
import { HelmetProvider } from 'react-helmet-async'

// Import global styles
import 'antd/dist/reset.css'
import './styles/global.css'

// Initialize i18n
// import './i18n'
import './styles/animations.css'

// PWA registration (disabled)
// import { registerSW } from 'virtual:pwa-register'

// Performance monitoring (disabled)
// import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Error reporting
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // In production, you might want to send this to an error tracking service
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // In production, you might want to send this to an error tracking service
})

// PWA Service Worker Registration (disabled)
/*
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Show a prompt to user to refresh the app
      if (confirm('New content available, reload?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
      // Show notification that app is ready to work offline
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Enterprise POS', {
          body: 'App is now available offline!',
          icon: '/icons/icon-192x192.png'
        })
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    }
  })
}
*/

// Web Vitals Performance Monitoring
function sendToAnalytics(metric) {
  // In production, send these metrics to your analytics service
  console.log('Performance metric:', metric)
  
  // Example: Send to Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     event_category: 'Web Vitals',
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     event_label: metric.id,
  //     non_interaction: true,
  //   })
  // }
}

// Measure and report Web Vitals (disabled)
/*
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
*/

// Theme Detection and Management
function initializeTheme() {
  const savedTheme = localStorage.getItem('pos-theme')
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const theme = savedTheme || systemTheme
  
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.className = theme
  
  return theme
}

// Initialize theme
const initialTheme = initializeTheme()

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('pos-theme')) {
    const newTheme = e.matches ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', newTheme)
    document.documentElement.className = newTheme
  }
})

// Network Status Detection
function updateOnlineStatus() {
  const isOnline = navigator.onLine
  document.documentElement.setAttribute('data-online', isOnline.toString())
  
  if (!isOnline) {
    // Show offline notification
    console.log('App is now offline')
  } else {
    // Show online notification
    console.log('App is back online')
  }
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)
updateOnlineStatus()

// Viewport Height Fix for Mobile
function setViewportHeight() {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

window.addEventListener('resize', setViewportHeight)
setViewportHeight()

// Keyboard Navigation Support
document.addEventListener('keydown', (event) => {
  // ESC key to close modals/drawers
  if (event.key === 'Escape') {
    const escEvent = new CustomEvent('global-escape', { bubbles: true })
    event.target.dispatchEvent(escEvent)
  }
  
  // Ctrl/Cmd + K for global search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    const searchEvent = new CustomEvent('global-search', { bubbles: true })
    document.dispatchEvent(searchEvent)
  }
  
  // F1 for help
  if (event.key === 'F1') {
    event.preventDefault()
    const helpEvent = new CustomEvent('global-help', { bubbles: true })
    document.dispatchEvent(helpEvent)
  }
})

// Print Support
window.addEventListener('beforeprint', () => {
  document.documentElement.setAttribute('data-print', 'true')
})

window.addEventListener('afterprint', () => {
  document.documentElement.removeAttribute('data-print')
})

// Barcode Scanner Support (if available)
if ('BarcodeDetector' in window) {
  console.log('Barcode detection supported')
} else {
  console.log('Barcode detection not supported, will use camera fallback')
}

// Camera API Support Detection
navigator.mediaDevices?.getUserMedia({ video: true })
  .then((stream) => {
    stream.getTracks().forEach(track => track.stop())
    console.log('Camera access available')
  })
  .catch(() => {
    console.log('Camera access not available')
  })

// Notification Permission Request
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    console.log('Notification permission:', permission)
    return permission === 'granted'
  }
  return false
}

// Request notification permission after user interaction
document.addEventListener('click', () => {
  requestNotificationPermission()
}, { once: true })

// App Installation Prompt
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  
  // Show custom install prompt
  const installEvent = new CustomEvent('app-install-available', { 
    detail: { prompt: deferredPrompt } 
  })
  window.dispatchEvent(installEvent)
})

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed')
  deferredPrompt = null
})

// Development Environment Setup
if (import.meta.env.DEV) {
  console.log('🖥️ Trường Phát Computer - Development Mode')
  console.log('Environment:', import.meta.env)
  
  // Development tools
  window.__POS_DEBUG__ = {
    theme: initialTheme,
    online: navigator.onLine,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0'
  }
} else {
  console.log('🖥️ Trường Phát Computer - Production Mode')
}

// Log system information
console.log(`
🖥️ Trường Phát Computer
Version: 1.0.0
Environment: ${import.meta.env.MODE}
Build: ${import.meta.env.DEV ? 'development' : 'production'}

🚀 Powered by Cloudflare Edge
⚡ React 18 + Vite + Ant Design
📱 PWA Ready + Offline Support
🎮 Staff Gamification + AI Features
`);

// React 18 Root Creation and Error Boundaries
const container = document.getElementById('root')

// Global root variable for HMR
let root

// Add error handling for React root creation
try {
  root = ReactDOM.createRoot(container)

  console.log('🚀 Creating React root and rendering app...');

  // Hide loading screen when React app is ready
  const hideLoadingScreen = () => {
    console.log('🎯 React app rendered - hiding loading screen');
    document.body.classList.add('app-ready');

    // Also remove the loading div after a short delay
    setTimeout(() => {
      const loadingDiv = document.querySelector('.app-loading');
      if (loadingDiv) {
        loadingDiv.remove();
        console.log('🗑️ Loading div removed by React');
      }
    }, 500);
  };

  // Development vs Production rendering
  if (import.meta.env.DEV) {
    // Development mode with React DevTools
    root.render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    )
  } else {
    // Production mode
    root.render(
      <HelmetProvider>
        <App />
      </HelmetProvider>
    )
  }

  // Hide loading screen after React has had time to mount
  setTimeout(() => {
    hideLoadingScreen();
  }, 100);

} catch (error) {
  console.error('❌ Error creating React root:', error);

  // Fallback: show error message and hide loading
  document.body.classList.add('app-ready');
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #1890ff 0%, #0958d9 100%);
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <h1>⚠️ Lỗi khởi tạo ứng dụng</h1>
        <p>Có lỗi xảy ra khi khởi tạo React app</p>
        <p style="font-size: 14px; opacity: 0.8; margin-top: 20px;">
          Vui lòng thử refresh trang hoặc liên hệ hỗ trợ
        </p>
        <button onclick="window.location.reload()" style="
          padding: 12px 24px;
          background: white;
          color: #1890ff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 20px;
          font-size: 16px;
        ">
          🔄 Refresh Trang
        </button>
      </div>
    `;
  }
}

// Hot Module Replacement for Development
if (import.meta.hot) {
  import.meta.hot.accept('./App.jsx', (newApp) => {
    root.render(
      <React.StrictMode>
        <HelmetProvider>
          <newApp.default />
        </HelmetProvider>
      </React.StrictMode>
    )
  })
}

// Global CSS Variables for Dynamic Theming
document.documentElement.style.setProperty('--app-version', `"${import.meta.env.VITE_APP_VERSION || '1.0.0'}"`)

// Cleanup function for development
if (import.meta.env.DEV) {
  window.addEventListener('beforeunload', () => {
    // Cleanup any development resources
    console.log('Cleaning up development resources')
  })
}

// Export for testing purposes (root is created inside try-catch)
// export { root }

// Console welcome message
console.log(`
🏪 Enterprise POS System
Version: ${import.meta.env.VITE_APP_VERSION || '1.0.0'}
Environment: ${import.meta.env.MODE}
Build: ${import.meta.env.VITE_BUILD_TIME || 'development'}

🚀 Powered by Cloudflare Edge
⚡ React 18 + Vite + Ant Design
📱 PWA Ready + Offline Support
🎮 Staff Gamification + AI Features
`)

// Performance observer for monitoring
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log slow operations in development
        if (import.meta.env.DEV && entry.duration > 100) {
          console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`)
        }
      }
    })
    
    observer.observe({ entryTypes: ['measure', 'navigation'] })
  } catch (error) {
    console.warn('Performance Observer not fully supported:', error)
  }
}