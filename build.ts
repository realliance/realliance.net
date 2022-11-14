/**
 * Realliance Static Site Builder
 */

import { renderFile } from "https://deno.land/x/pug/mod.ts";
import postcss from 'https://deno.land/x/postcss/mod.js';
import autoprefixer from 'https://dev.jspm.io/autoprefixer';
import { mkdir, rmdir,  } from "https://deno.land/std@0.109.0/node/fs/promises.ts";
import { existsSync } from "https://deno.land/std@0.109.0/fs/exists.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import path from "https://deno.land/std@0.109.0/node/path.ts";
import * as twd from "https://deno.land/x/twd/mod.ts";

const logger = log.getLogger();
const OUTPUT_FOLDER = "build";

/**
 * Removes and recreates the build output folder
 */
const prepareBuildFolder = async () => {
    if (existsSync(OUTPUT_FOLDER)) {
        await rmdir(OUTPUT_FOLDER, { recursive: true });
    }
    await mkdir(OUTPUT_FOLDER);
}

/**
 * Writes file and contents into build folder.
 * @param file Filename
 * @param contents Contents of file
 */
const writeOutputFile = async (file: string, contents: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(contents);
    log.info(file);
    await Deno.writeFile(path.join(OUTPUT_FOLDER, file), data);
}

const copyInFiles = async (fromDir: string, toDir: string) => {
    for await (const dirEntry of Deno.readDir(fromDir)) {
        log.info(dirEntry.name);
        Deno.copyFile(path.join(fromDir, dirEntry.name), path.join(toDir, dirEntry.name));
    }
}

// Step 1: Prepare build folder
logger.info("== Preparing Build Folder");
await prepareBuildFolder();

// Step 2: Generate files to write
logger.info("== Generating Files");

// CSS
logger.info("Generating CSS");
const cssFile = await Deno.readTextFile("src/misc.css");
const css = await postcss([autoprefixer]).process(cssFile, { from: undefined });

// HTML
logger.info("Generating HTML");
const html = renderFile("src/index.pug");

// Tailwind
const tailwindCss = twd.generate([html], twd.init({ 
    mode: "silent",
}));

// Step 3: Write Files
logger.info("== Writing Files");

await Promise.all([
    writeOutputFile("index.html", html),
    writeOutputFile("misc.css", css.css),
    writeOutputFile("tailwind.css", tailwindCss),
    copyInFiles("static", "build"),
]);

Deno.exit(0);