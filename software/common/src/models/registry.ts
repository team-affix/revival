import fs from 'fs';
import debug from 'debug';
import path from 'path';
import os from 'os';
import { Package } from './package';
import RegistryLoadError from '../errors/registry-load';
import RegistryCreateError from '../errors/registry-create';
import GetInstallDepsError from '../errors/get-install-deps';

// The name of the packages directory
const PACKAGES_DIR_NAME = 'packages';

// Get the path to a package
function getPackagePath(cwd: string, name: string, version: string): string {
    return path.join(cwd, PACKAGES_DIR_NAME, name, `${version}.tar`);
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

        // If the packages directory does not exist, throw an error
        if (!fs.existsSync(path.join(cwd, PACKAGES_DIR_NAME)))
            throw new RegistryLoadError(cwd, 'Packages directory does not exist');

        // Return the registry
        return new Registry(cwd);
    }

    // Create a registry in the given directory
    static async create(cwd: string): Promise<Registry> {
        // If the directory exists, throw an error
        if (fs.existsSync(cwd)) throw new RegistryCreateError(cwd, 'Path already exists');

        // Create the directory
        fs.mkdirSync(cwd, { recursive: true });

        // Create the packages directory
        fs.mkdirSync(path.join(cwd, PACKAGES_DIR_NAME), { recursive: true });

        // Return the registry
        return await Registry.load(cwd);
    }

    // Get the default registry
    static async getDefault(): Promise<Registry> {
        // Create the default registry path
        const defaultRegistryPath = path.join(os.homedir(), '.apm', 'registry');

        // If the default registry path does not exist, create it
        if (!fs.existsSync(defaultRegistryPath)) return await Registry.create(defaultRegistryPath);

        // Return the default registry
        return await Registry.load(defaultRegistryPath);
    }

    // Get a package from the registry
    async get(name: string, version: string): Promise<Package> {
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

    // Get the installation dependencies of a package/project
    async getInstallDeps(
        directDeps: Map<string, string>,
        overrides: Set<string>,
        visited: Set<string>,
    ): Promise<Package[]> {
        // Get the debugger
        const dbg = debug('apm:common:models:Registry:getInstallDeps');

        // Indicate that we are getting the project dependencies
        dbg(
            `Getting installation dependencies given direct dependencies: ${JSON.stringify(Object.fromEntries(directDeps))}`,
        );

        // Filter out the direct dependencies that are overridden
        for (const [name] of directDeps.entries()) {
            dbg(`Checking if ${name} is in overrides`);
            dbg(`Overrides: ${JSON.stringify(Array.from(overrides))}`);
            // If the package exists in overrides, pop it from directDeps
            // as it has been overridden.
            if (overrides.has(name)) directDeps.delete(name);
        }

        // Error if any of the direct dependencies are already in visited
        for (const [name, version] of directDeps.entries()) {
            dbg(`Checking if ${name}@${version} is in visited`);
            dbg(`Visited: ${JSON.stringify(Array.from(visited))}`);
            // If the package exists in visited, throw an error
            // as this is an unresolved peer dependency.
            if (visited.has(name))
                throw new GetInstallDepsError(directDeps, `Unresolved peer dependency: ${name}@${version}`);
        }

        // Create a new set of overrides that includes the direct dependencies
        const localOverrides = new Set<string>([...overrides, ...directDeps.keys()]);

        // Create a result array
        const result: Package[] = [];

        // Visit each of the direct dependencies and recur on their dependencies
        for (const [name, version] of directDeps.entries()) {
            // Get the package
            const pkg = await this.get(name, version);

            // Get the dependencies of the package
            const deps = pkg.directDeps;

            // Recur on the dependencies of this package
            const subResult = await this.getInstallDeps(deps, localOverrides, visited);

            // Add the package to the results
            result.push(...subResult);

            // Add the package to the result
            result.push(pkg);

            // Indicate that we have added pkg and its install dependencies to the result
            dbg(`Added ${name}@${version} and its install dependencies to the result`);

            // Add the package to the visited set
            visited.add(name);

            // Indicate that we have visited the package
            dbg(`Added ${name} to visited`);
        }

        // Print the result
        dbg(`Result: ${JSON.stringify(result.map((pkg) => `${pkg.name}@${pkg.version}`))}`);

        // Return the result
        return result;
    }
}

export { Registry };

export const __test__ = {
    getPackagePath,
};
