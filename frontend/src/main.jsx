import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dynamic API Hostname Rewriting for Local Network Testing
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && (input.includes('localhost:8089') || input.includes('127.0.0.1:8089'))) {
      input = input.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    } else if (input instanceof URL && (input.href.includes('localhost:8089') || input.href.includes('127.0.0.1:8089'))) {
      input = new URL(input.href.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname));
    } else if (input && typeof input === 'object' && input.url && (input.url.includes('localhost:8089') || input.url.includes('127.0.0.1:8089'))) {
      const newUrl = input.url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
      input = new Request(newUrl, input);
    }
    return originalFetch(input, init);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && (url.includes('localhost:8089') || url.includes('127.0.0.1:8089'))) {
      url = url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    }
    return originalOpen.apply(this, [method, url, ...args]);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
