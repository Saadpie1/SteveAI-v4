import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt fired! 🎉');
  // e.preventDefault(); // Uncomment this if you want to store the event and show it later!
});
