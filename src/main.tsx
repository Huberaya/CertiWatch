import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkAppProvider } from './lib/clerk.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkAppProvider>
      <App />
    </ClerkAppProvider>
  </StrictMode>,
);
