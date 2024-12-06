import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from './router'
import { ClerkProvider } from './providers/ClerkProvider'
import { ConvexProvider } from './providers/ConvexProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider>
      <ConvexProvider>
        <Router />
      </ConvexProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
