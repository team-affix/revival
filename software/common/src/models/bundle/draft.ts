import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { Bundle } from './bundle';
import FailedToParseDepsError from '../../errors/failed-to-parse-deps';
import DraftLoadError from '../../errors/draft-load';

export interface Draft extends Bundle {
    srcDir: string;
    agdaFiles: string[];
    mdFiles: string[];
}

// Parse the dependencies given a raw dependencies file
export function parseDeps(raw: string): Map<string, string> {
    // Get the debuggers
    const dbg = debug('apm:common:models:Draft:parseDeps');

    // Indicate that we are parsing the deps
    dbg(`Parsing deps: ${raw}`);

    const depsLines = raw.split('\n');

    dbg(`DepsLines: ${JSON.stringify(depsLines)}`);

    // Create a map of (name,version) tuples
    const result = new Map<string, string>();

    // For each line, parse the line and add the tuple to the map
    for (const line of depsLines) {
        // Parse the line
        const [name, version, extra] = line.split(' ');

        // If there are more than two parts, throw an error
        if (extra)
            throw new FailedToParseDepsError(`Error parsing line, expected 2 space-separated parts, got 3: ${line}`);

        // If the line is empty, continue
        if (!name) continue;

        // If the name can be parsed, but the version or domain cannot, throw an error
        if (!version) throw new FailedToParseDepsError(`Error parsing line: ${line}`);

        // If the package is already in the map, throw an error
        if (result.has(name))
            throw new FailedToParseDepsError(`Multiple versions of '${name}' listed in dependencies.`);

        // Add the tuple to the map
        result.set(name, version);
    }

    // Return the map
    return result;
}

// Load a draft from a directory
export function load(dir: string): Draft {
    // Get the debugger
    const dbg = debug('apm:common:models:Draft:load');

    // Indicate that we are loading a draft
    dbg(`Loading draft from ${dir}`);

    // Check if the directory exists
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory())
        throw new DraftLoadError(dir, `Path does not exist or is not a directory: ${dir}`);

    // Get the name and version of the package
    const name = path.basename(dir);

    // Indicate the name of the draft
    dbg(`Name: ${name}`);

    // Get the path to the deps.txt file
    const depsPath = path.join(dir, 'deps.txt');

    // Indicate the path to the deps.txt file
    dbg(`DepsPath: ${depsPath}`);

    if (!fs.existsSync(depsPath) || !fs.statSync(depsPath).isFile())
        throw new DraftLoadError(dir, `deps.txt invalid or missing in ${dir}`);

    // Get the deps.txt file
    const depsRaw = fs.readFileSync(depsPath, 'utf8');

    // Indicate that we have read the deps.txt file
    dbg(`DepsRaw: ${depsRaw}`);

    // Parse the dependencies
    const deps = parseDeps(depsRaw);

    // Indicate the parsed dependencies
    dbg(`Deps: ${JSON.stringify(Object.fromEntries(deps))}`);

    // Get a list of all agda files
    const agdaFiles = glob.sync('**/*.agda', { cwd: dir, nodir: true });

    // Indicate the agda files
    dbg(`AgdaFiles: ${JSON.stringify(agdaFiles)}`);

    // Get a list of all md files
    const mdFiles = glob.sync('**/*.md', { cwd: dir, nodir: true });

    // Indicate the md files
    dbg(`MdFiles: ${JSON.stringify(mdFiles)}`);

    // Return the draft
    return { name, deps, srcDir: dir, agdaFiles, mdFiles };
}
