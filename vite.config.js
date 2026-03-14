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
                mitigation: resolve(__dirname, 'mitigation/index.html'),
                admin: resolve(__dirname, 'admin/index.html'),
                faq: resolve(__dirname, 'faq/index.html'),
                plans: resolve(__dirname, 'plans/index.html'),
                fds: resolve(__dirname, 'fds/index.html'),
                nodeshield: resolve(__dirname, 'nodeshield/index.html'),
                'discord-bot': resolve(__dirname, 'discord-bot/index.html')
            }
        }
    },
    plugins: [
        {
            name: 'html-rewrite',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    const pages = ['gcs', 'gds', 'mitigation', 'admin', 'faq', 'plans', 'fds', 'nodeshield', 'discord-bot'];
                    const url = req.url.split('?')[0];
                    if (pages.includes(url.replace(/\//g, ''))) {
                        req.url = `/${url.replace(/\//g, '')}/index.html`;
                    }
                    next();
                });
            }
        }
    ]
})
