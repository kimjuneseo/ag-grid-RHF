import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
        { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
        { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
        { find: '@locales', replacement: path.resolve(__dirname, 'src/locales') },
        { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
        { find: '@router', replacement: path.resolve(__dirname, 'src/router') },
        { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
        { find: '@store', replacement: path.resolve(__dirname, 'src/store') },
        { find: '@themes', replacement: path.resolve(__dirname, 'src/themes') },
        { find: '@type', replacement: path.resolve(__dirname, 'src/types') },
        { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
        { find: 'App', replacement: path.resolve(__dirname, 'src/App') },
        { find: 'Main', replacement: path.resolve(__dirname, 'src/Main') },
        { find: 'Root', replacement: path.resolve(__dirname, 'src/Root') },
    ],
},
})
