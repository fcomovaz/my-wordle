import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './styles/theme.css';
import './styles/global.css';
import './styles/board.css';
import './styles/keyboard.css';
import './styles/ui.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
