/**
 * Realliance Static Site Builder
 */

import { renderFile } from "https://deno.land/x/pug/mod.ts";
import postcss from 'https://deno.land/x/postcss/mod.js';
import autoprefixer from 'https://dev.jspm.io/autoprefixer';
import { mkdir, rmdir,  } from "node:fs/promises";
import { existsSync } from "https://deno.land/std/fs/exists.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import path from "node:path";
import * as twd from "https://deno.land/x/twd/mod.ts";
import { recursiveReaddir } from "https://deno.land/x/recursive_readdir/mod.ts";
import { extname } from "https://deno.land/std/path/win32.ts";
import * as toml from "https://deno.land/std/encoding/toml.ts";
import { Image } from 'https://deno.land/x/imagescript/mod.ts';

const logger = log.getLogger();
const OUTPUT_FOLDER = "build";
const INTERMEDIATE_FOLDER = "intermediate";

const prepareFolder = async (path: string) => {
    if (existsSync(path)) {
        await rmdir(path, { recursive: true });
    }
    await mkdir(path);
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

interface Website {
    name: string,
    link: string,
}

interface MemberProfile {
    name: string,
    icon: string,
    pronouns: string,
    interests: string,
    description: string,
    websites: Website[],
}

const prepareMembers = async (memberDir: string) => {
    await mkdir(`${OUTPUT_FOLDER}/members`);
    
    const aboutFiles = (await recursiveReaddir(memberDir)).filter((file: string) => extname(file) === ".toml");
    const processedMembers = aboutFiles.map(async (aboutFile: string) => 
    {
        logger.info(`Processing ${aboutFile}`);
        const decoder = new TextDecoder("utf-8");
        const fileContents = await Deno.readFile(aboutFile);
        const aboutObject = toml.parse(decoder.decode(fileContents)) as unknown as MemberProfile;
        const websites = aboutObject.websites.map((site) => `["${site.name}", "${site.link}"]`).join(', ');
        const iconPath = path.join(aboutFile, "..", aboutObject.icon);
        const buildLocation = path.join("members", crypto.randomUUID() + ".jpg");
        const newIconPath = path.join(OUTPUT_FOLDER, buildLocation);
        const image = await Image.decode(await Deno.readFile(iconPath));
        image.resize(300, Image.RESIZE_AUTO);
        await Deno.writeFile(newIconPath, await image.encode());
        return `+member("${aboutObject.name}", "${buildLocation}", "${aboutObject.pronouns}", "${aboutObject.interests}", "${aboutObject.description}", ${websites})`
    });
    const newFiles = await Promise.all(processedMembers);
    const file = newFiles.join('\n');
    const encoder = new TextEncoder();
    await Deno.writeFile(path.join(INTERMEDIATE_FOLDER, "_memberlist.pug"), encoder.encode(file));
}

// Step 1: Prepare build folders
logger.info("== Preparing Build Folders");
await Promise.all([
    prepareFolder(OUTPUT_FOLDER),
    prepareFolder(INTERMEDIATE_FOLDER)
]);

// Step 2: Generate files to write
logger.info("== Generating Files");

// Members
logger.info("Parsing Members");
await prepareMembers("members/");

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
