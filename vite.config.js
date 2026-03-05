import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                mitigation: 'mitigation.html'
            }
        }
    },
    plugins: [
        {
            name: 'html-rewrite',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/mitigation') {
                        req.url = '/mitigation.html';
                    }
                    next();
                });
            }
        }
    ]
})
