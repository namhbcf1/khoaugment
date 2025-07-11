import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'

// Import global styles
import 'antd/dist/reset.css'
import './styles/global.css'

// Simple error reporting
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// Simple React app initialization
console.log('🖥️ Trường Phát Computer - Starting...')

// React 18 Root Creation
const container = document.getElementById('root')

try {
  const root = ReactDOM.createRoot(container)

  console.log('🚀 Rendering React app...')

  root.render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  )

  console.log('✅ React app rendered successfully')

} catch (error) {
  console.error('❌ Error creating React root:', error)

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
        <h1>⚠️ Lỗi khởi tạo ứng dụng</h1>
        <p>Có lỗi xảy ra khi khởi tạo React app</p>
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