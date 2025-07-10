import fs from 'fs';
import debug from 'debug';
import path from 'path';
import { Package } from './package';
import RegistryLoadError from '../errors/registry-load';
import { Project } from './project';
import GetTransitiveDepsError from '../errors/get-transitive-deps';

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

    // Get the transitive dependencies of a package/project
    async getTransitiveDeps(
        directDeps: Map<string, string>,
        overrides: Set<string>,
        result: Map<string, string>,
    ): Promise<void> {
        // Get the debugger
        const dbg = debug('apm:common:models:Registry:getTransitiveDeps');

        // Indicate that we are getting the project dependencies
        dbg(
            `Getting transitive dependencies given direct dependencies: ${JSON.stringify(Object.fromEntries(directDeps))}`,
        );

        // Filter out the direct dependencies that are overridden
        for (const [name] of directDeps.entries()) {
            dbg(`Checking if ${name} is in overrides`);
            dbg(`Overrides: ${JSON.stringify(Array.from(overrides))}`);
            // If the package exists in overrides, pop it from directDeps
            // as it has been overridden.
            if (overrides.has(name)) directDeps.delete(name);
        }

        // Error if any of the direct dependencies are already in result
        for (const [name, version] of directDeps.entries()) {
            dbg(`Checking if ${name}@${version} is in result`);
            dbg(`Result: ${JSON.stringify(Object.fromEntries(result))}`);
            // If the package exists in result, throw an error
            // as this is an unresolved peer dependency.
            if (result.has(name))
                throw new GetTransitiveDepsError(directDeps, `Unresolved peer dependency: ${name}@${version}`);
        }

        // Create a new set of overrides that includes the direct dependencies
        let localOverrides = new Set<string>([...overrides, ...directDeps.keys()]);

        // Visit each of the direct dependencies and recur on their dependencies
        for (const [name, version] of directDeps.entries()) {
            // Get the package
            const pkg = await this.get(name, version);

            // Get the dependencies of the package
            const deps = pkg.directDeps;

            // Recur on the dependencies of this package
            await this.getTransitiveDeps(deps, localOverrides, result);

            // Add the package to the results
            result.set(name, version);

            dbg(`Added ${name}@${version} to result`);
        }
    }
}

export { Registry };

export const __test__ = {
    getPackagePath,
};
