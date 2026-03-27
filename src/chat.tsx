import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatPage } from './pages/ChatPage';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ChatPage />
  </React.StrictMode>
);
