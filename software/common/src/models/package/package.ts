import debug from 'debug';
import fs from 'fs';
import crypto from 'crypto';
import tarFs from 'tar-fs';
import { PackageBase } from './package-base';
import PackageLoadError from '../../errors/package-load';
import FailedToDeserializeDepsError from '../../errors/failed-to-deserialize-deps';

export class Package extends PackageBase {
    // Constructs a package model
    private constructor(
        name: string,
        directDeps: Map<string, string>,
        private binary: Buffer,
        private payload: Buffer,
        private version: string,
    ) {
        super(name, directDeps);
    }

    // Load from package file
    static load(filePath: string): Package {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:load');

        // Indicate that we are loading a package
        dbg(`Loading package from ${filePath}`);

        // Check if the package exists
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
            throw new PackageLoadError(filePath, 'File does not exist or is not a file');

        // Indicate that we are reading the package
        dbg(`Reading package`);

        // Read the package
        const binary = fs.readFileSync(filePath);

        // Indicate that we have read the package
        dbg(`Read package, length: ${binary.length}`);

        // Get the version of the package
        const version = Package.computeVersion(binary);

        // Set the offset
        let offset = 0;

        // Get the name length from the header
        if (binary.length < 4) throw new PackageLoadError(filePath, 'Package is too short to contain a name length');
        const nameLength = binary.readUInt32LE(offset);
        offset += 4;

        // Get the name from the header
        if (binary.length < offset + nameLength)
            throw new PackageLoadError(filePath, 'Package is too short to contain a name');
        const name = binary.subarray(offset, offset + nameLength).toString('utf8');
        offset += nameLength;

        // Get the dependencies length from the header
        if (binary.length < offset + 4)
            throw new PackageLoadError(filePath, 'Package is too short to contain a dependencies length');
        const depsLength = binary.readUInt32LE(offset);
        offset += 4;

        // Get the dependencies from the header
        if (binary.length < offset + depsLength)
            throw new PackageLoadError(filePath, 'Package is too short to contain dependencies');
        const depsRaw = binary.subarray(offset, offset + depsLength).toString('utf8');
        offset += depsLength;

        // Get the payload buffer
        const payload = binary.subarray(offset, binary.length);
        offset += payload.length;

        // Parse the dependencies
        const directDeps = Package.deserializeDirectDeps(depsRaw);

        // Return the package
        return new Package(name, directDeps, binary, payload, version);
    }

    // Create a package from a name, direct dependencies, and a payload
    static async create(
        name: string,
        deps: Map<string, string>,
        srcDir: string,
        agdaFiles: string[],
        mdFiles: string[],
    ): Promise<Package> {
        const payload = await Package.packTar(srcDir, agdaFiles.concat(mdFiles));
        const binary = Package.computeBinary(name, deps, payload);
        const version = Package.computeVersion(binary);
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

    // Serialize the dependencies to be written to the binary
    private static serializeDirectDeps(deps: Map<string, string>): string {
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
    private static deserializeDirectDeps(deps: string): Map<string, string> {
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

    // Compute the binary
    private static computeBinary(name: string, deps: Map<string, string>, payload: Buffer): Buffer {
        // Get the debugger
        const dbg = debug('apm:common:models:Package:computeBinary');

        // Indicate that we are computing the binary
        dbg(`Computing binary: ${name}, ${deps}, ${payload.length}`);

        // Serialize the dependencies
        const depsSerialized = Package.serializeDirectDeps(deps);

        // Create the output buffer
        const chunks: Buffer[] = [];

        // Write the name length
        const nameLengthBuf = Buffer.alloc(4);
        nameLengthBuf.writeUInt32LE(name.length, 0);
        chunks.push(nameLengthBuf);

        // Write the name
        chunks.push(Buffer.from(name));

        // Write the dependencies length
        const depsLengthBuf = Buffer.alloc(4);
        depsLengthBuf.writeUInt32LE(depsSerialized.length, 0);
        chunks.push(depsLengthBuf);

        // Write the dependencies
        chunks.push(Buffer.from(depsSerialized));

        // Write the payload
        chunks.push(payload);

        // Return the binary
        return Buffer.concat(chunks);
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

    // Pack the files into a tar
    private static async packTar(basePath: string, files: string[]): Promise<Buffer> {
        // Use tar-fs to create the pack stream
        const result = await tarFs.pack(basePath, { entries: files });

        // Pipe the stream contents to a buffer
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            result.on('data', (chunk) => chunks.push(chunk));
            result.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}
