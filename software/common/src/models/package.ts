import fs from 'fs';
import path from 'path';
import debug from 'debug';
import tarStream from 'tar-stream';
// import tar from 'tar';
import glob from 'glob';
import crypto from 'crypto';
import PackageAlreadyExistsError from '../errors/package-already-exists';
import InvalidPackageError from '../errors/invalid-package';
import PackageCreationError from '../errors/package-creation';
import PackageNotFoundError from '../errors/package-not-found';
import FailedToParseDepsError from '../errors/failed-to-parse-deps';

abstract class PackageBase {
    // Constructs a package base
    protected constructor(
        private name: string,
        private deps: Map<string, string>,
    ) {}

    // Get the name of the package
    getName(): string {
        return this.name;
    }

    // Get the dependencies of the package
    getDeps(): Map<string, string> {
        return this.deps;
    }

    // Parse the dependencies given a raw dependencies file
    protected static parseDeps(raw: string): Map<string, string> {
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
            const [name, version] = line.split(' ');

            // If the line is empty, break
            if (!name) break;

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
}

class Draft extends PackageBase {
    // Constructs a draft
    private constructor(name: string, deps: Map<string, string>) {
        super(name, deps);
    }

    // Load a draft from a directory
    static load(dir: string): Draft {
        // Get the debugger
        const dbg = debug('apm:common:models:Draft:load');

        // Indicate that we are loading a draft
        dbg(`Loading draft from ${dir}`);

        // Get the name and version of the package
        const name = path.basename(dir);

        // Indicate the name of the draft
        dbg(`Name: ${name}`);

        // Get the path to the deps.txt file
        const depsPath = path.join(dir, 'deps.txt');

        // Indicate the path to the deps.txt file
        dbg(`DepsPath: ${depsPath}`);

        // Get the deps.txt file
        const depsRaw = fs.readFileSync(depsPath, 'utf8');

        // Indicate that we have read the deps.txt file
        dbg(`DepsRaw: ${depsRaw}`);

        // Parse the dependencies
        const deps = PackageBase.parseDeps(depsRaw);

        // Indicate the parsed dependencies
        dbg(`Deps: ${JSON.stringify(Object.fromEntries(deps))}`);

        // Return the draft
        return new Draft(name, deps);
    }
}

class Package extends PackageBase {
    // Constructs a package model
    private constructor(
        name: string,
        deps: Map<string, string>,
        private payload: Buffer,
        private version: string,
    ) {
        super(name, deps);
    }

    // Load from package file
    static load(filePath: string): Package {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:load');

        // Indicate that we are loading a package
        dbg(`Loading package from ${filePath}`);

        // Check if the package exists
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) throw new PackageNotFoundError(filePath);

        // Indicate that we are reading the package
        dbg(`Reading package`);

        // Read the package
        const binary = fs.readFileSync(filePath);

        // Indicate that we have read the package
        dbg(`Read package, length: ${binary.length}`);

        // Get the version of the package
        const version = crypto.createHash('sha256').update(binary).digest('hex');

        // Get the offsets from the footer
        const footerLength = 8;
        const depsOffset = binary.readUInt32LE(binary.length - 4);
        const payloadOffset = binary.readUInt32LE(binary.length - 8);

        // Get the name of the package
        const name = binary.subarray(0, depsOffset).toString('utf8');
        const depsRaw = binary.subarray(depsOffset, payloadOffset).toString('utf8');
        const payload = binary.subarray(payloadOffset, binary.length - footerLength);

        // Parse the dependencies
        const deps = PackageBase.parseDeps(depsRaw);

        // Return the package
        return new Package(name, deps, payload, version);
    }

    // // Create a package from a draft
    // static async fromDraft(draft: Draft): Promise<Package> {
    //     // Get the name and version of the package
    //     const name = path.basename(srcDir);

    //     // Append the deps.txt file to the list using glob
    //     const depsPath = path.join(srcDir, 'deps.txt');

    //     // Check that the deps.txt file is valid
    //     if (!fs.existsSync(depsPath) || !fs.statSync(depsPath).isFile())
    //         throw new PackageCreationError(srcDir, 'deps.txt invalid or missing');

    //     // Get a list of all agda files
    //     const files = glob.sync('**/*.agda', { cwd: srcDir, nodir: true });

    //     dbg('Agda files (should be relative paths): ', files);

    //     // Add the deps.txt file to the list
    //     files.push(depsPath);

    //     // Construct the tar binary
    //     const binary = await Package.createTar(srcDir, files);

    //     // Get the hash of the package
    //     const version = crypto.createHash('sha256').update(binary).digest('hex');

    //     // Create the package
    //     return new Package(name, version, binary);
    // }

    // Get the binary of the package
    getPayload(): Buffer {
        return this.payload;
    }

    // Get the version of the package
    getVersion(): string {
        return this.version;
    }

    // Extract the package to a destination directory
    extract(dest: string): void {}

    // Save the package
    save(outPath: string): void {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:save');

        // Indicate that we are saving the package
        dbg(`Saving package`);
    }

    // Tar in-memory
    private static async createTar(basePath: string, files: string[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const pack = tarStream.pack();
            const chunks: Buffer[] = [];
            for (const file of files) {
                pack.entry({ name: file }, fs.readFileSync(path.join(basePath, file)));
            }
            pack.on('data', (chunk) => chunks.push(chunk));
            pack.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}

export default Package;
