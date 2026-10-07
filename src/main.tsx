import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.tsx'
import MusicProviderProvider from './providers/MusicProviderProvider'
import PlayerProvider from './player/PlayerProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MusicProviderProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </MusicProviderProvider>
    </BrowserRouter>
  </StrictMode>,
)