/**
 * Realliance Static Site Builder
 */

import { renderFile } from "https://deno.land/x/pug/mod.ts";
import postcss from 'https://deno.land/x/postcss/mod.js';
import autoprefixer from 'https://dev.jspm.io/autoprefixer';
import { mkdir, rmdir,  } from "https://deno.land/std@0.109.0/node/fs/promises.ts";
import { existsSync } from "https://deno.land/std@0.109.0/fs/exists.ts";

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
    await Deno.writeFile(`${OUTPUT_FOLDER}/${file}`, data);
}

// Step 1: Prepare build folder
console.log("Preparing Build Folder");
await prepareBuildFolder();

// Step 2: Generate files to write
console.log("Generating Files");

// CSS
const cssFile = await Deno.readTextFile("index.css");
const css = await postcss([autoprefixer]).process(cssFile, { from: undefined });

// HTML
const html = await renderFile("index.pug");

// Step 3: Write Files
console.log ("Writing Files");

await Promise.all([
    writeOutputFile("index.html", html),
    writeOutputFile("index.css", css.css)
]);

Deno.exit(0);