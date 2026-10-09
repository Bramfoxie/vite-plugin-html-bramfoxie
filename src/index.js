import path                           from 'node:path';
import { gzipSync }                   from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import pc                             from 'picocolors';
import { minify }                     from 'html-minifier-terser';
import { version }                    from '../package.json';

const { cyan, green, dim, bold } = pc;

const NAME    = 'vite-plugin-html-bramfoxie';
const VERSION = cyan('HtmlBramfoxie v' + version);

// Vite turns "import html from './file.html?raw'" into: export default "<JSON string>"
const RAW_EXPORT = /^export default ("(?:[^"\\]|\\.)*");?\s*$/s;

export default function HtmlBramfoxie (userOptions) {
    let options = normalizeOptions(userOptions);
    let root;
    let isBuild = false;

    return {
        name: NAME,
        enforce: 'pre',
        configResolved (config) {
            root = config.root;
            isBuild = config.command === 'build';
        },
        async transform (code, id) {
            if (!options.minifyImport || !id.endsWith('.html?raw')) return;

            let match = RAW_EXPORT.exec(code);

            if (match === null) return;

            let html = await minify(JSON.parse(match[1]), options.minifyOptions);

            return { code: 'export default ' + JSON.stringify(html), map: null };
        },
        closeBundle: {
            order: 'pre',
            sequential: true,
            async handler () {
                // The hook is also called when the dev server closes.
                if (!isBuild) return;

                let keys = Object.keys(options.targets);

                if (keys.length === 0) return;

                let log = createLogger(options.verbose);
                let finished = 0;

                log.info('\n' + VERSION + green(' building...'));

                let buildTime = performance.now();

                if (!log.isTTY) log.info('transforming...');

                // Work.
                //------------------------------------------------------------------------------------------------------
                let outcomeList = await Promise.all(keys.map(async key => {
                    try {
                        return await processTarget(key, options.targets[key], options, root);
                    } catch (error) {
                        return { file: key, error: error };
                    } finally {
                        finished += 1;
                        log.step(`transforming (${finished}/${keys.length}) ` + dim(key));
                    }
                }));
                //------------------------------------------------------------------------------------------------------

                let resultList = outcomeList.filter(outcome => !outcome.error);
                let errorList  = outcomeList.filter(outcome => outcome.error);

                // End.
                //------------------------------------------------------------------------------------------------------
                log.done(green('✓ ') + resultList.length + ` ${resultList.length === 1 ? 'file' : 'files'} transformed.`);

                printLog(log, resultList, options.outDir);

                log.info(green('✓ built in ' + Math.ceil(performance.now() - buildTime) + 'ms'));
                //------------------------------------------------------------------------------------------------------

                // Errors always fail the build, regardless of "verbose".
                if (errorList.length > 0) {
                    this.error(errorList.map(outcome => `File: ${outcome.file}\n${outcome.error.message || outcome.error}`).join('\n\n'));
                }
            }
        }
    };
}

function normalizeOptions (userOptions = {}) {
    let fail = message => {
        throw new Error(`[${NAME}] ${message}`);
    };

    if (userOptions === null || typeof userOptions !== 'object') fail('options is not an object!');

    let { verbose = true, outDir = '', minify = true, minifyImport = true, minifyOptions = {}, targets = {} } = userOptions;

    if (typeof verbose !== 'boolean') fail('verbose is not a boolean!');
    if (typeof outDir !== 'string') fail('outDir is not valid!');
    if (typeof minify !== 'boolean') fail('minify is not a boolean!');
    if (typeof minifyImport !== 'boolean') fail('minifyImport is not a boolean!');
    if (minifyOptions === null || typeof minifyOptions !== 'object' || Array.isArray(minifyOptions)) fail('minifyOptions is not an object!');
    if (targets === null || typeof targets !== 'object' || Array.isArray(targets)) fail('targets is not an object!');

    for (let key in targets) {
        if (typeof targets[key] !== 'string') fail(`targets key "${key}" is not a string!`);
    }

    // Leading slashes are dropped: outDir is always relative to the Vite root.
    return {
        verbose      : verbose,
        outDir       : outDir.replace(/^\/+/, ''),
        minify       : minify,
        minifyImport : minifyImport,
        minifyOptions: minifyOptions,
        targets      : targets
    };
}

function createLogger (verbose) {
    let isTTY = Boolean(process.stdout.isTTY);

    return {
        isTTY,

        info (message) {
            if (verbose) console.log(message);
        },

        // Progress line, rewritten in place (TTY only).
        step (message) {
            if (!verbose || !isTTY) return;

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(message);
        },

        // Replaces the progress line with the final message.
        done (message) {
            if (!verbose) return;

            if (isTTY) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(message + '\n');
            } else {
                console.log(message);
            }
        }
    };
}

async function processTarget (key, source, options, root) {
    // Source is resolved from the current working directory, destination from the Vite root.
    let srcFile  = path.resolve(source);
    let destFile = path.resolve(root, options.outDir, key);

    let content = await readFile(srcFile, 'utf8');

    if (options.minify) content = await minify(content, options.minifyOptions);

    await mkdir(path.dirname(destFile), { recursive: true });
    await writeFile(destFile, content);

    return {
        file    : key,
        size    : Buffer.byteLength(content),
        gzipSize: gzipSync(content).length
    };
}

function printLog (log, resultList, outDir) {
    let rowList = resultList.map(result => ({
        file    : result.file,
        size    : (result.size / 1000).toFixed(2),
        gzipSize: (result.gzipSize / 1000).toFixed(2)
    }));

    let maxLengthFile     = Math.max(0, ...rowList.map(row => row.file.length));
    let maxLengthSize     = Math.max(0, ...rowList.map(row => row.size.length));
    let maxLengthGzipSize = Math.max(0, ...rowList.map(row => row.gzipSize.length));

    let prefix = outDir === '' ? '' : path.join(outDir, '/');

    rowList.forEach(row => {
        let size     = row.size.padStart(maxLengthSize);
        let gzipSize = row.gzipSize.padStart(maxLengthGzipSize);

        log.info(dim(prefix) + cyan(row.file.padEnd(maxLengthFile)) + '  ' + dim(bold(size + ' kB') + ' │ gzip: ' + gzipSize + ' kB'));
    });
}
