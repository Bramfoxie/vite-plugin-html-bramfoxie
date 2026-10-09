import { defineConfig } from 'vite';
import HtmlBramfoxie from "./src/index.js";

export default defineConfig({
    root: './example',
    build: {
        outDir: '../dist-example',
        target: 'esnext',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                'index.js': './example/index.js'
            },
        }
    },
    plugins: [
        HtmlBramfoxie({
            outDir: '../dist-example',
            minify: true,
            minifyOptions: {
                collapseBooleanAttributes  : true,
                collapseInlineTagWhitespace: true,
                collapseWhitespace         : true,
                ignoreCustomComments       : [ /{{[A-z0-9-_]+}}/ ],
                removeAttributeQuotes      : true,
                removeComments             : true,
                removeEmptyAttributes      : true,
                removeRedundantAttributes  : true,
            },
            targets: {
                'template.html': './example/template.html',
            }
        })
    ]
});