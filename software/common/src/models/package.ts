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
// Debugger
const dbg = debug('apm:common:models:package');

class Package {
    // Constructs a package model
    private constructor(
        private name: string,
        private version: string,
        private binary: Buffer,
    ) {}

    // Load a package from tar file
    static fromFile(name: string, version: string, packagePath: string): Package {
        // Check if the package exists
        if (!fs.existsSync(packagePath) || !fs.statSync(packagePath).isFile())
            throw new PackageNotFoundError(name, version, packagePath);

        // Read the package
        const binary = fs.readFileSync(packagePath);

        // Return the package
        return new Package(name, version, binary);
    }

    // Create a package from a directory
    // static async createFromDirectory(srcDir: string): Promise<Package> {
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

    // Get the name of the package
    getName(): string {
        return this.name;
    }

    // Get the version of the package
    getVersion(): string {
        return this.version;
    }

    // Get the binary of the package
    getBinary(): Buffer {
        return this.binary;
    }

    // Extract the package to a destination directory
    extract(dest: string): void {}

    // Tar in-memory
    // private static async createTar(basePath: string, files: string[]): Promise<Buffer> {
    //     return new Promise((resolve, reject) => {
    //         const pack = tarStream.pack();
    //         const chunks: Buffer[] = [];
    //         for (const file of files) {
    //             pack.entry({ name: file }, fs.readFileSync(path.join(basePath, file)));
    //         }
    //         pack.on('data', (chunk) => chunks.push(chunk));
    //         pack.on('end', () => resolve(Buffer.concat(chunks)));
    //     });
    // }

    // // Peek a file in a tar archive
    // private static async peekTar(tarPath: string, targetFile: string): Promise<Buffer> {
    //     return new Promise((resolve, reject) => {
    //         const extract = tarStream.extract();
    //         const stream = fs.createReadStream(tarPath);

    //         let found = false;

    //         extract.on('entry', (header, fileStream, next) => {
    //             if (header.name === targetFile) {
    //                 found = true;
    //                 const chunks: Buffer[] = [];
    //                 fileStream.on('data', (chunk) => chunks.push(chunk));
    //                 fileStream.on('end', () => {
    //                     resolve(Buffer.concat(chunks));
    //                 });
    //             } else {
    //                 fileStream.resume();
    //                 fileStream.on('end', next);
    //             }
    //         });

    //         extract.on('finish', () => {
    //             if (!found) reject(new Error('File not found in archive'));
    //         });

    //         stream.pipe(extract);
    //     });
    // }
}

export default Package;
