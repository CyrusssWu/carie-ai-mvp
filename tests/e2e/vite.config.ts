import { defineConfig, mergeConfig } from 'vite'
import base from '../../vite.config'

// Opt-in test server only. The production build never imports this monitor.
export default mergeConfig(base, defineConfig({
  // Acceptance checks must not count Vite's edit-time HMR messages as app traffic.
  server: { port: 5177, strictPort: true, hmr: false },
  plugins: [{ name: 'sprint4-test-monitor', transform(code, id) {
    if (id.replaceAll('\\', '/').endsWith('/src/views/Passport.tsx')) return code.replace('export default function Passport() {', "export default function Passport() { if (sessionStorage.getItem('s5-render-failure') === 'yes') throw new Error('Synthetic Sprint 5 render failure');")
  }, transformIndexHtml() {
    return [{ tag: 'script', attrs: { src: '/tests/e2e/monitor.js' }, injectTo: 'head-prepend' }]
  } }],
}))
