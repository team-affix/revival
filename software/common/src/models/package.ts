import fs from 'fs';
import path from 'path';
import debug from 'debug';

// Debugger
const dbg = debug('apm:common:models:package');

class Package {
    // Path to the package on disk
    // Constructs a package model given the registry root, name, and version
    private constructor(private packagePath: string, public name: string, public version: string) {}

    // Find a package in the file system given the registry root, name, and version
    static find(registryRoot: string, name: string, version: string): Package | null {
        const packagePath = path.join(registryRoot, name, `${version}.tar`);
        dbg(`Looking for package ${name}@${version} at ${packagePath}`);
        if (!fs.existsSync(packagePath)) return null;
        return new Package(packagePath, name, version);
    }

    // Get the binary of the package
    getBinary(): Buffer {
        return fs.readFileSync(this.packagePath);
    }
}

export default Package;
