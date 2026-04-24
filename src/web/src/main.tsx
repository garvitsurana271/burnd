import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { App } from './App.js';
import './index.css';

// NOTE: Lenis smooth scroll removed 2026-04-24 (perf). It was layering a RAF loop
// on top of native scroll and causing the landing to feel sluggish on mid-range
// hardware. Native scroll is already smooth and responds instantly to user input.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>,
);
