import { fileURLToPath } from 'node:url';
import { defineConfig }  from 'vite';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        lib: {
            entry   : fileURLToPath(new URL('./src/index.js', import.meta.url)),
            name    : 'HtmlBramfoxie',
            fileName: (format) => `html-bramfoxie.${format}.js`
        },
        rollupOptions: {
            external: [
                'node:path',
                'node:zlib',
                'node:fs/promises',
                'picocolors',
                'html-minifier-terser'
            ],
            output: {
                globals: {
                    'node:path'           : 'path',
                    'node:zlib'           : 'zlib',
                    'node:fs/promises'    : 'fsPromises',
                    'picocolors'          : 'pc',
                    'html-minifier-terser': 'htmlMinifierTerser'
                }
            }
        }
    }
});
