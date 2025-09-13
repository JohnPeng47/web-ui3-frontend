import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loadRuntimeConfig } from './config';
import { initApi } from './lib/api';

async function bootstrap() {
  try {
    await loadRuntimeConfig();
    await initApi();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initialize app';
    toast.error(message);
  } finally {
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
}

bootstrap();
