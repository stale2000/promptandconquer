/**
 * Vibe Coding Starter Pack: 3D Multiplayer - main.tsx
 * 
 * Primary React application entry point that:
 * 1. Renders the root App component to the DOM
 * 2. Initializes the React application lifecycle
 * 3. Connects the React component tree to the browser
 * 
 * This file:
 * - Imports the global CSS styles (index.css)
 * - Finds the DOM root element (with id="root")
 * - Creates a React root using ReactDOM
 * - Renders the main App component
 * 
 * Note: This file intentionally does not use React StrictMode to avoid
 * double rendering/connection issues with SpacetimeDB in development.
 * 
 * Related files:
 * - App.tsx: The main application component with game logic
 * - index.css: Global styles applied to the entire application
 * - index.html: Contains the #root element where the app mounts
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <App />
  );
} else {
  console.error("Failed to find the root element with ID 'root'");
}