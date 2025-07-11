import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Import global styles
import 'antd/dist/reset.css'
import './styles/global.css'





// Enhanced error reporting for production
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  console.error('Promise rejection details:', {
    reason: event.reason,
    promise: event.promise
  })
})

// KhoChuan POS App initialization
console.log('🚀 KhoChuan POS - Starting...')

// Test if React is available
console.log('React available:', typeof React)
console.log('ReactDOM available:', typeof ReactDOM)
console.log('App available:', typeof App)

// React 18 Root Creation
const container = document.getElementById('root')
console.log('Container found:', container)

if (!container) {
  console.error('Root container not found!')
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root container not found!</div>'
} else {
  try {
    console.log('Creating React root...')
    const root = ReactDOM.createRoot(container)
    console.log('React root created successfully')

    console.log('🚀 Starting KhoChuan POS App...')

    // Render the main App component
    root.render(React.createElement(App));
    console.log('✅ KhoChuan POS App rendered successfully')

  } catch (error) {
    console.error('❌ Error creating KhoChuan POS App:', error)

    // Fallback error display
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f0f2f5;
          color: #333;
          text-align: center;
          padding: 20px;
        ">
          <h1>⚠️ Lỗi khởi tạo KhoChuan POS</h1>
          <p>Có lỗi xảy ra khi khởi tạo ứng dụng</p>
          <button onclick="window.location.reload()" style="
            padding: 12px 24px;
            background: #1677ff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 20px;
          ">
            🔄 Refresh Trang
          </button>
        </div>
      `
    }
  }
}