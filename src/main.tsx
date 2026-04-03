import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Check if we are on GitHub Pages (which needs the /SteveAI-v4 path) 
// or Vercel (which usually uses the root /)
const basename = window.location.hostname.includes('github.io') 
  ? "/SteveAI-v4" 
  : "/";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
