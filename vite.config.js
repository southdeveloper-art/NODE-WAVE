import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/',
    appType: 'mpa',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                gcs: resolve(__dirname, 'gcs/index.html'),
                gds: resolve(__dirname, 'gds/index.html'),
                mitigation: resolve(__dirname, 'mitigation/index.html')
            }
        }
    },
    plugins: [
        {
            name: 'html-rewrite',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/mitigation' || req.url === '/mitigation/') {
                        req.url = '/mitigation/index.html';
                    }
                    next();
                });
            }
        }
    ]
})
