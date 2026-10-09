import type { Plugin } from 'vite';
import type { Options } from 'html-minifier-terser';

export interface HtmlBramfoxieOptions {
    /** Write output to console. Default: true. */
    verbose?: boolean;

    /** Path to output directory, relative to the Vite root. Default: ''. */
    outDir?: string;

    /** Minify HTML files from targets. If false, they are only copied. Default: true. */
    minify?: boolean;

    /** Minify HTML imported in JS files, e.g. import html from './index.html?raw'. Default: true. */
    minifyImport?: boolean;

    /** html-minifier-terser options, https://github.com/terser/html-minifier-terser */
    minifyOptions?: Options;

    /** Files to process: { "output file (relative to outDir)": "source file" }. Default: {}. */
    targets?: Record<string, string>;
}

export default function HtmlBramfoxie (options?: HtmlBramfoxieOptions): Plugin;
