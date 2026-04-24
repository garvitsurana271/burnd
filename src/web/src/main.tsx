import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { App } from './App.js';
import { useDeviceCapabilities } from './lib/useDeviceCapabilities.js';
import { useSmoothScroll } from './lib/useSmoothScroll.js';
import './index.css';

function Root(): JSX.Element {
  const caps = useDeviceCapabilities();
  useSmoothScroll(caps.shouldRender3D);
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>,
);
