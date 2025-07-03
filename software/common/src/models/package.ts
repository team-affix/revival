import fs from 'fs';
import path from 'path';
import debug from 'debug';
import tarFs from 'tar-fs';
import glob from 'glob';
import crypto from 'crypto';
import { Readable, Writable, pipeline } from 'stream';
import { promisify } from 'util';
import PackageAlreadyExistsError from '../errors/package-already-exists';
import InvalidPackageError from '../errors/invalid-package';
import PackageCreationError from '../errors/package-creation';
import PackageNotFoundError from '../errors/package-not-found';
import FailedToParseDepsError from '../errors/failed-to-parse-deps';
import VersionMismatchError from '../errors/version-mismatch';
import FailedToDeserializeDepsError from '../errors/failed-to-deserialize-deps';

// Utility function for async pipeline
const pipelineAsync = promisify(pipeline);

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
}

class Draft extends PackageBase {
    // Constructs a draft
    private constructor(
        name: string,
        deps: Map<string, string>,
        private srcDir: string,
        private agdaFiles: string[],
        private mdFiles: string[],
    ) {
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

        if (!fs.existsSync(depsPath) || !fs.statSync(depsPath).isFile())
            throw new FailedToParseDepsError(`deps.txt invalid or missing in ${dir}`);

        // Get the deps.txt file
        const depsRaw = fs.readFileSync(depsPath, 'utf8');

        // Indicate that we have read the deps.txt file
        dbg(`DepsRaw: ${depsRaw}`);

        // Parse the dependencies
        const deps = Draft.parseDeps(depsRaw);

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
        return new Draft(name, deps, dir, agdaFiles, mdFiles);
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

    // Parse the dependencies given a raw dependencies file
    private static parseDeps(raw: string): Map<string, string> {
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
}

class Package extends PackageBase {
    // Constructs a package model
    private constructor(
        name: string,
        deps: Map<string, string>,
        private binary: Buffer,
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
        const version = Package.computeVersion(binary);

        // Get the offsets from the footer
        const footerLength = 8;
        const depsOffset = binary.readUInt32LE(binary.length - 4);
        const payloadOffset = binary.readUInt32LE(binary.length - 8);

        // Get the name of the package
        const name = binary.subarray(0, depsOffset).toString('utf8');
        const depsRaw = binary.subarray(depsOffset, payloadOffset).toString('utf8');
        const payload = binary.subarray(payloadOffset, binary.length - footerLength);

        // Parse the dependencies
        const deps = Package.deserializeDeps(depsRaw);

        // Return the package
        return new Package(name, deps, binary, payload, version);
    }

    // Create a package from a draft
    static async fromDraft(draft: Draft): Promise<Package> {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:fromDraft');

        // Get the name and version of the package
        const name = draft.getName();

        // Get the dependencies of the package
        const deps = draft.getDeps();

        // Get the source directory
        const srcDir = draft.getSrcDir();

        // Get the agda files
        const agdaFiles = draft.getAgdaFiles();

        // Get the md files
        const mdFiles = draft.getMdFiles();

        // Indicate the agda and md files
        dbg(`AgdaFiles: ${JSON.stringify(agdaFiles)}`);
        dbg(`MdFiles: ${JSON.stringify(mdFiles)}`);

        // Concatenate the agda and md files
        const files = agdaFiles.concat(mdFiles);

        // Indicate the files
        dbg(`Files: ${JSON.stringify(files)}`);

        // Construct the tar binary
        const payload = await Package.packTar(srcDir, files);

        // Indicate the payload
        dbg(`Payload length: ${payload.length}`);

        // Compute the binary
        const binary = Package.computeBinary(name, deps, payload);

        // Indicate the binary
        dbg(`Binary length: ${binary.length}`);

        // Get the hash of the package
        const version = Package.computeVersion(binary);

        // Indicate the version
        dbg(`Version: ${version}`);

        // Create the package
        return new Package(name, deps, binary, payload, version);
    }

    // Get the binary of the package
    getBinary(): Buffer {
        return this.binary;
    }

    // Get the payload of the package
    getPayload(): Buffer {
        return this.payload;
    }

    // Get the version of the package
    getVersion(): string {
        return this.version;
    }

    // Extract the package to a destination directory
    extract(dest: string): void {}

    // Serialize the dependencies to be written to the binary
    private static serializeDeps(deps: Map<string, string>): string {
        // Get the debuggers
        const dbg = debug('apm:common:models:PackageBase:serializeDeps');

        // Indicate that we are serializing the deps
        dbg(`Serializing deps: ${JSON.stringify(Object.fromEntries(deps))}`);

        // Create an array from the entries
        const result = JSON.stringify(Object.fromEntries(deps));

        // Indicate that we have serialized the deps
        dbg(`Serialized deps: ${result}`);

        // Return the string
        return result;
    }

    // Deserialize the dependencies region from the binary
    private static deserializeDeps(deps: string): Map<string, string> {
        // Get the debuggers
        const dbg = debug('apm:common:models:PackageBase:deserializeDeps');

        // Indicate that we are deserializing the deps
        dbg(`Deserializing deps: ${deps}`);

        // Parse the dependencies
        let result: Map<string, string>;

        // Attempt to deserialize the deps
        try {
            result = new Map<string, string>(Object.entries(JSON.parse(deps)));
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            throw new FailedToDeserializeDepsError(deps, msg);
        }

        // Indicate that we have deserialized the deps
        dbg(`Deserialized deps: ${JSON.stringify(Object.fromEntries(result))}`);

        // Return the map
        return result;
    }

    // Compute the binary
    private static computeBinary(name: string, deps: Map<string, string>, payload: Buffer): Buffer {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:computeBinary');

        // Indicate that we are computing the binary
        dbg(`Computing binary: ${name}, ${deps}, ${payload.length}`);

        // Serialize the dependencies
        const depsSerialized = Package.serializeDeps(deps);

        // Define the offsets
        const depsOffset = name.length;
        const payloadOffset = depsOffset + depsSerialized.length;

        // Define the header/footer lengths
        const headerLength = name.length + depsSerialized.length;
        const footerLength = 8;

        // Construct the binary
        const binary = Buffer.alloc(headerLength + payload.length + footerLength);

        // Write the header
        binary.write(name, 0);
        binary.write(depsSerialized, depsOffset);

        // Write the payload
        payload.copy(binary, payloadOffset);

        // Write the footer
        binary.writeUInt32LE(depsOffset, binary.length - 4);
        binary.writeUInt32LE(payloadOffset, binary.length - 8);

        // Return the binary
        return binary;
    }

    // Compute the version of the package
    private static computeVersion(binary: Buffer): string {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:computeVersion');

        // Indicate that we are computing the version
        dbg(`Computing version of binary: ${binary.length}`);

        // Compute the version
        const result = crypto.createHash('sha256').update(binary).digest('hex');

        // Indicate that we have computed the version
        dbg(`Computed version: ${result}`);

        // Return the version
        return result;
    }

    // Tar in-memory
    private static async packTar(basePath: string, files: string[]): Promise<Buffer> {
        // return new Promise((resolve, reject) => {
        //     const pack = tarStream.pack();
        //     const chunks: Buffer[] = [];
        //     for (const file of files) {
        //         pack.entry({ name: file }, fs.readFileSync(path.join(basePath, file)));
        //     }
        //     pack.finalize();
        //     pack.on('data', (chunk) => chunks.push(chunk));
        //     pack.on('end', () => resolve(Buffer.concat(chunks)));
        // });
        // Change current directory to the base path

        // Use tar-fs to create the pack stream
        const result = await tarFs.pack(basePath, { entries: files });

        // Pipe the stream contents to a buffer
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            result.on('data', (chunk) => chunks.push(chunk));
            result.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }

    // Extract a tar
    private static async extractTar(tar: Buffer, cwd: string): Promise<void> {
        return await pipelineAsync(Readable.from(tar), tarFs.extract(cwd));
    }
}

export { PackageBase, Draft, Package };
