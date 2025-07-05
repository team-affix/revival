import fs from 'fs';
import debug from 'debug';
import path from 'path';
// import { Package } from './package';
import RegistryNotFoundError from '../errors/registry-not-found';

// Registry model
class Registry {
    // Constructs a registry model given the root path
    constructor(private rootPath: string) {
        // if the path does not exist or is a file, throw an error
        if (!fs.existsSync(this.rootPath) || !fs.statSync(this.rootPath).isDirectory()) {
            throw new RegistryNotFoundError(this.rootPath);
        }
    }

    // // Get a package from the registry
    // async getPackage(name: string, version: string): Promise<Package | null> {
    //     // Get the debugger
    //     const dbg = debug('apm:common:models:Registry:getPackage');

    //     // Indicate that we are getting a package
    //     dbg(`Getting package ${name}@${version}`);

    //     // Get the path to the package
    //     const filePath = this.getPackagePath(name, version);

    //     // Indicate the file path
    //     dbg(`File path: ${filePath}`);

    //     // Check if the package exists
    //     if (!fs.existsSync(filePath)) return null;

    //     // Indicate that the package exists
    //     dbg(`Package exists`);

    //     // Return the package
    //     return await Package.load(filePath);
    // }

    // // Add a package to the registry
    // addPackage(name: string, version: string, binary: Buffer): void {
    //     // Check if the package is valid
    // }

    // // Get the path to a package
    // private getPackagePath(name: string, version: string): string {
    //     return path.join(this.rootPath, name, `${version}.tar`);
    // }
}

export default Registry;
