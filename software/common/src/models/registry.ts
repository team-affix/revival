import fs from 'fs';
import Package from './package';
import debug from 'debug';
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
    getPackage(name: string, version: string): Package | null {
        return Package.find(this.rootPath, name, version);
    }

    addPackage(name: string, version: string, binary: Buffer): void {
        // Check if the package is valid
    }
}

export default Registry;
