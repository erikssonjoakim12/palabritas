import { defineConfig, type Plugin } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import qrcode from 'qrcode-terminal';

/** Print a QR code of the network address so the phone can just scan it. */
function phoneQr(): Plugin {
  return {
    name: 'phone-qr',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          const url = server.resolvedUrls?.network[0];
          if (!url) return;
          console.log('\n  Scan this with your phone camera (same Wi-Fi):\n');
          qrcode.generate(url, { small: true });
          console.log(`  ${url}\n  On the warning page, tap "Advanced" then "Proceed".\n`);
        }, 200);
      });
    },
  };
}

// `npm run phone` serves over HTTPS on your local network, because Android
// Chrome only allows the microphone on secure pages.
export default defineConfig(({ mode }) => ({
  base: './',
  // The game, plus the art review page (art.html) and the dictionary (palabras.html), to check on any device.
  // The code both pages share is one chunk, named for what it is (the bundler would name it after any one file).
  build: {
    rollupOptions: {
      input: { main: 'index.html', art: 'art.html', palabras: 'palabras.html' },
      output: { chunkFileNames: (c) => (c.isDynamicEntry ? 'assets/[name]-[hash].js' : 'assets/shared-[hash].js') },
    },
  },
  plugins: mode === 'phone' ? [basicSsl(), phoneQr()] : [],
}));
