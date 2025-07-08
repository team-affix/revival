import debug from 'debug';
import fs from 'fs';
import crypto from 'crypto';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import FailedToDeserializeDepsError from '../errors/failed-to-deserialize-deps';
import PackageLoadError from '../errors/package-load';
import PackageCreateError from '../errors/package-create';

// Serialize the dependencies to be written to the binary
function serializeDirectDeps(deps: Map<string, string>): string {
    // Get the debuggers
    const dbg = debug('apm:common:models:PackageBase:serializeDirectDeps');

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
function deserializeDirectDeps(deps: string): Map<string, string> {
    // Get the debuggers
    const dbg = debug('apm:common:models:PackageBase:deserializeDirectDeps');

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

// Compute the version of the package
async function computeVersion(stream: Readable): Promise<string> {
    // Get the debugger
    const dbg = debug('apm:common:models:Package:computeVersion');

    // Indicate that we are computing the version
    dbg(`Computing version of stream`);

    // Create the hash
    const hash = crypto.createHash('sha256');

    // Read the stream
    for await (const chunk of stream) {
        hash.update(chunk);
    }

    // Compute the version
    const result = hash.digest('hex');

    // Indicate that we have computed the version
    dbg(`Computed version: ${result}`);

    // Return the version
    return result;
}

// A package model
export class Package {
    // Constructs a package model
    private constructor(
        public readonly filePath: string,
        public readonly name: string,
        public readonly directDeps: Map<string, string>,
        public readonly archiveOffset: number,
        public readonly version: string,
    ) {}

    // Load from package file
    static async load(filePath: string): Promise<Package> {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:load');

        // Indicate that we are loading a package
        dbg(`Loading package from ${filePath}`);

        // Check if the package exists
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
            throw new PackageLoadError(filePath, 'File does not exist or is not a file');

        // Indicate that we are reading the package
        dbg(`Reading package`);

        // Open the package file using promise version
        const file = await fs.promises.open(filePath, 'r');
        // Get the stat of the file
        const stat = await file.stat();

        // Initialize the reading offset
        let offset = 0;

        // Read the name length
        if (stat.size < offset + 4)
            throw new PackageLoadError(filePath, 'Package is too short to contain a name length');
        const nameLengthBuf = Buffer.alloc(4);
        await file.read(nameLengthBuf, 0, 4, offset);
        offset += 4;
        const nameLength = nameLengthBuf.readUInt32LE(0);

        dbg(`Name length: ${nameLength}`);

        // Read the name
        if (stat.size < offset + nameLength)
            throw new PackageLoadError(filePath, 'Package is too short to contain a name');
        const nameBuf = Buffer.alloc(nameLength);
        await file.read(nameBuf, 0, nameLength, offset);
        offset += nameLength;
        const name = nameBuf.toString('utf8');

        dbg(`Name: ${name}`);

        // Read the dependencies length
        if (stat.size < offset + 4)
            throw new PackageLoadError(filePath, 'Package is too short to contain a dependencies length');
        const depsLengthBuf = Buffer.alloc(4);
        await file.read(depsLengthBuf, 0, 4, offset);
        offset += 4;
        const depsLength = depsLengthBuf.readUInt32LE(0);

        dbg(`Deps length: ${depsLength}`);

        // Read the dependencies
        if (stat.size < offset + depsLength)
            throw new PackageLoadError(filePath, 'Package is too short to contain dependencies');
        const depsBuf = Buffer.alloc(depsLength);
        await file.read(depsBuf, 0, depsLength, offset);
        offset += depsLength;
        const depsRaw = depsBuf.toString('utf8');

        dbg(`Deps: ${depsRaw}`);

        // Close the file
        await file.close();

        // Indicate that we have read the package
        dbg(`Archive offset: ${offset}`);

        // Open a file stream
        const fileStream = fs.createReadStream(filePath);

        // // Get the version of the package
        const version = await computeVersion(fileStream);

        // Parse the dependencies
        const directDeps = deserializeDirectDeps(depsRaw);

        // Return the package
        return new Package(filePath, name, directDeps, offset, version);
    }

    // Create a package from a name, direct dependencies, and a payload
    static async create(
        filePath: string,
        name: string,
        deps: Map<string, string>,
        archive: Readable,
    ): Promise<Package> {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:create');

        // Indicate that we are creating a package
        dbg(`Creating package at ${filePath}`);

        // If the file already exists, throw an error
        if (fs.existsSync(filePath)) throw new PackageCreateError(filePath, 'File already exists');

        // Open the file
        const file = await fs.promises.open(filePath, 'w');
        let offset = 0;

        // Write the name length
        const nameLengthBuf = Buffer.alloc(4);
        nameLengthBuf.writeUInt32LE(name.length, 0);
        await file.write(nameLengthBuf, 0, 4);
        offset += 4;

        // Write the name
        await file.write(Buffer.from(name), 0, name.length);
        offset += name.length;

        // Serialize the dependencies
        const depsSerialized = serializeDirectDeps(deps);

        // Write the dependencies length
        const depsLengthBuf = Buffer.alloc(4);
        depsLengthBuf.writeUInt32LE(depsSerialized.length, 0);
        await file.write(depsLengthBuf, 0, 4);
        offset += 4;

        // Write the dependencies
        await file.write(Buffer.from(depsSerialized), 0, depsSerialized.length);
        offset += depsSerialized.length;

        // Open a writable stream after the previous fields
        const writable = file.createWriteStream({ start: offset });

        // Write the archive
        await pipeline(archive, writable);

        // Return the package
        return Package.load(filePath);
    }

    // Get the archive offset of the package
    getArchive(): Readable {
        return fs.createReadStream(this.filePath, { start: this.archiveOffset });
    }
}

export const __test__ = {
    serializeDirectDeps,
    deserializeDirectDeps,
    computeVersion,
};
