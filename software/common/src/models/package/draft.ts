import { pipeline } from 'stream';
import { promisify } from 'util';
import { PackageBase } from './package-base';
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import tarFs from 'tar-fs';
import { Readable } from 'stream';
import DraftLoadError from '../../errors/draft-load';
import DraftCreateError from '../../errors/draft-create';
import ReadDepsFileError from '../../errors/read-deps-file';
import WriteDepsFileError from '../../errors/write-deps-file';
import FailedToParseDepsError from '../../errors/failed-to-parse-deps';

// Utility function for async pipeline
const pipelineAsync = promisify(pipeline);

export class Draft extends PackageBase {
    // The name of the deps file
    private static readonly DEPS_FILE_NAME = 'deps.txt';

    // Constructs a draft
    private constructor(
        name: string,
        directDeps: Map<string, string>,
        private srcDir: string,
        private agdaFiles: string[],
        private mdFiles: string[],
    ) {
        super(name, directDeps);
    }

    // Load a draft from a directory
    static load(dir: string): Draft {
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

        // Get the direct dependencies
        const directDeps = Draft.readDirectDepsFile(dir);

        // Indicate the direct dependencies
        dbg(`DirectDeps: ${JSON.stringify(Object.fromEntries(directDeps))}`);

        // Get a list of all agda files
        const agdaFiles = glob.sync('**/*.agda', { cwd: dir, nodir: true });

        // Indicate the agda files
        dbg(`AgdaFiles: ${JSON.stringify(agdaFiles)}`);

        // Get a list of all md files
        const mdFiles = glob.sync('**/*.md', { cwd: dir, nodir: true });

        // Indicate the md files
        dbg(`MdFiles: ${JSON.stringify(mdFiles)}`);

        // Return the draft
        return new Draft(name, directDeps, dir, agdaFiles, mdFiles);
    }

    // Create draft from package
    static async create(name: string, deps: Map<string, string>, payload: Buffer, dest: string): Promise<Draft> {
        // Get the debugger
        const dbg = debug('apm:common:models:Draft:createFromPackage');

        // Indicate that we are creating a draft from a package
        dbg(`Creating draft from package: ${name} at ${dest}`);

        // Ensure the desination directory has the same name as the package
        if (path.basename(dest) !== name)
            throw new DraftCreateError(dest, name, `Destination directory name must match package name: ${name}`);

        // Check if the destination directory exists
        if (fs.existsSync(dest))
            throw new DraftCreateError(dest, name, `Destination directory already exists: ${dest}`);

        // Create the destination directory
        fs.mkdirSync(dest, { recursive: true });

        // Get the required fields from the package
        const directDeps = deps;

        // Indicate that we are extracting the payload
        dbg(`Extracting payload: (${payload.length} bytes)`);

        // Extract the payload
        await Draft.extractTar(payload, dest);

        // Write the deps.txt file
        await Draft.writeDirectDepsFile(dest, directDeps);

        // Return the draft
        return Draft.load(dest);
    }

    // Get the source directory
    getSrcDir(): string {
        return this.srcDir;
    }

    // Get the agda files
    getAgdaFiles(): string[] {
        return this.agdaFiles;
    }

    // Get the md files
    getMdFiles(): string[] {
        return this.mdFiles;
    }

    // Read the direct dependencies from the deps file
    private static readDirectDepsFile(dir: string): Map<string, string> {
        // Get the debugger
        const dbg = debug('apm:common:models:Draft:readDirectDepsFile');

        // Indicate that we are reading the deps.txt file
        dbg(`Reading deps.txt file in ${dir}`);

        // Get the path to the deps.txt file
        const depsPath = path.join(dir, Draft.DEPS_FILE_NAME);

        // Indicate the path to the deps.txt file
        dbg(`DepsPath: ${depsPath}`);

        if (!fs.existsSync(depsPath) || !fs.statSync(depsPath).isFile())
            throw new ReadDepsFileError(dir, `deps.txt invalid or missing in ${dir}`);

        // Get the deps.txt file
        const depsRaw = fs.readFileSync(depsPath, 'utf8');

        // Indicate that we have read the deps.txt file
        dbg(`DepsRaw: ${depsRaw}`);

        // Parse the dependencies
        const directDeps = Draft.parseDirectDeps(depsRaw);

        // Indicate the parsed dependencies
        dbg(`DirectDeps: ${JSON.stringify(Object.fromEntries(directDeps))}`);

        // Return the parsed dependencies
        return directDeps;
    }

    // Write the direct dependencies to the deps file
    private static async writeDirectDepsFile(dir: string, deps: Map<string, string>): Promise<void> {
        return new Promise((resolve, reject) => {
            // Get the debugger
            const dbg = debug('apm:common:models:Draft:writeDirectDepsFile');

            // Get the deps.txt file
            const depsPath = path.join(dir, Draft.DEPS_FILE_NAME);

            // Indicate that we are writing the deps.txt file
            dbg(`Writing deps.txt file to ${depsPath}`);

            // If the directory does not exist, throw an error
            if (!fs.existsSync(dir)) throw new WriteDepsFileError(dir, 'Directory does not exist');

            // Check if the file/folder exists, and remove it if it does
            if (fs.existsSync(depsPath)) throw new WriteDepsFileError(dir, 'File already exists');

            // Create the write stream
            const writeStream = fs.createWriteStream(depsPath);

            // Handle errors
            writeStream.on('error', (err) => {
                reject(new WriteDepsFileError(dir, err.message));
            });

            // Handle the finish event
            writeStream.on('finish', () => {
                // Indicate that we have written the deps.txt file
                dbg(`Deps.txt successfully written to: ${depsPath}`);

                // Resolve the promise
                resolve();
            });

            // For each dependency, write the dependency to the file
            for (const [name, version] of deps.entries()) {
                writeStream.write(`${name} ${version}\n`);
            }

            // Close the write stream
            writeStream.end();
        });
    }

    // Parse the dependencies given a raw dependencies file
    private static parseDirectDeps(raw: string): Map<string, string> {
        // Get the debuggers
        const dbg = debug('apm:common:models:PackageBase:parseDeps');

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
                throw new FailedToParseDepsError(
                    `Error parsing line, expected 2 space-separated parts, got 3: ${line}`,
                );

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

    // Extract a tar
    private static async extractTar(tar: Buffer, cwd: string): Promise<void> {
        return await pipelineAsync(Readable.from(tar), tarFs.extract(cwd));
    }
}
