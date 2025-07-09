import fs from 'fs';
import debug from 'debug';
import path from 'path';
import { Package } from './package';
import RegistryLoadError from '../errors/registry-load';

// Get the path to a package
function getPackagePath(cwd: string, name: string, version: string): string {
    return path.join(cwd, name, `${version}.tar`);
}

// Registry model
class Registry {
    // Constructs a registry model given the root path
    private constructor(public readonly cwd: string) {}

    // Load a registry from the given directory
    static async load(cwd: string): Promise<Registry> {
        // if the path does not exist or is a file, throw an error
        if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory())
            throw new RegistryLoadError(cwd, 'Path does not exist or is not a directory');

        // Return the registry
        return new Registry(cwd);
    }

    // Get a package from the registry
    async get(name: string, version: string): Promise<Package | null> {
        // Get the debugger
        const dbg = debug('apm:common:models:Registry:getPackage');

        // Indicate that we are getting a package
        dbg(`Getting package ${name}@${version}`);

        // Get the path to the package
        const filePath = getPackagePath(this.cwd, name, version);

        // Indicate the file path
        dbg(`File path: ${filePath}`);

        // Return the package
        return await Package.load(filePath);
    }
}

export { Registry };

export const __test__ = {
    getPackagePath,
};
