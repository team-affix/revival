import fs from 'fs';
import debug from 'debug';
import path from 'path';
import Package from './package';
import RegistryNotFoundError from '../errors/registry-not-found';

// Debugger
const dbg = debug('apm:common:models:registry');

// Registry model
class Registry {
    // Constructs a registry model given the root path
    constructor(private rootPath: string) {
        // if the path does not exist or is a file, throw an error
        if (!fs.existsSync(this.rootPath) || !fs.statSync(this.rootPath).isDirectory()) {
            throw new RegistryNotFoundError(this.rootPath);
        }
    }

    // Get a package from the registry
    async getPackage(name: string, version: string): Promise<Package | null> {
        const filePath = path.join(this.rootPath, `${name}.${version}.tar`);
        if (!fs.existsSync(filePath)) return null;
        return await Package.fromFile(filePath);
    }

    addPackage(name: string, version: string, binary: Buffer): void {
        // Check if the package is valid
    }
}

export default Registry;
