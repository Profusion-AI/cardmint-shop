/// <reference types="vite/client" />

// Klaviyo global tracking object
declare global {
  interface Window {
    _learnq: any[];
  }
}
