import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    appType: 'mpa',
    build: {
        rollupOptions: {
            input: {
                index: 'index.html',
                mitigation: 'mitigation.html'
            }
        }
    },
    plugins: [
        {
            name: 'html-rewrite',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/mitigation' || req.url === '/mitigation/') {
                        req.url = '/mitigation.html';
                    }
                    next();
                });
            }
        }
    ]
})
