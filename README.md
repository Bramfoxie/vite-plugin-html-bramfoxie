# Description

Vite plugin for minimizing html, with the ability to copy html files. Terser is used for minification.

- Minifies HTML when imported in JS files.
- Minifies third-party HTML files.
- Copies third-party HTML files.

# Install

```
yarn add -D vite-plugin-html-bramfoxie
```

# Requirements

Vite 8+ and Node.js `^20.19.0 || >=22.12.0`.

# Sample vite.config.js

```javascript
import { defineConfig } from 'vite';
import HtmlBramfoxie from 'vite-plugin-html-bramfoxie';

export default defineConfig ({
    /**
     * Root directory.
     * Required.
     */
    root: './src',
    
    plugins: [
        HtmlBramfoxie(/* options */)
    ]
});
```

# Options

```javascript
{
    /**
     * Write output to console.
     * Default: true.
     */
    verbose: true,

    /**
     * Path to output directory, relative to the Vite root (a leading "/" is ignored).
     * Default: '' (the Vite root).
     */
    outDir: '../dist',

    /**
     * Minify HTML files from targets. If false, they are only copied.
     * Default: true.
     */
    minify: true,

    /**
     * Minify HTML file from import in JS files.
     * Example: import html from './index.html?raw'
     * Default: true.
     */
    minifyImport: true,

    /**
     * Terser minify options, https://github.com/terser/html-minifier-terser
     * Passed to the minifier as is.
     */
    minifyOptions: {},

    /**
     * Files to process: { "output file (relative to outDir)": "source file" }.
     * Source paths are resolved from the current working directory.
     * Default: {}.
     */
    targets: {
        'target.html'        : 'source.html',
        'example/target.html': 'example/source.html'
    }
}
```

# Notes

- Target files are processed only in `vite build`; minification of `?raw` imports also works in the dev server.
- Invalid options and minification errors fail the build, even with `verbose: false`.
- Printed sizes are the output size and its gzip size.
