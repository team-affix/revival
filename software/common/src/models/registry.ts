import fs from 'fs';
import debug from 'debug';
import path from 'path';
import os from 'os';
import { Package } from './package';
import { PackageTree } from '../utils/package-tree';
import RegistryLoadError from '../errors/registry-load';
import RegistryCreateError from '../errors/registry-create';
import GetProjectTreeError from '../errors/get-project-tree';

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

    // Gets a package tree, which includes the package itself and all of its dependencies
    // It also includes dependencies which are overridden.
    // The order of the result is a valid topological sort of the package tree.
    async getPackageTree(name: string, version: string): Promise<Package[]> {
        // Get the debugger
        const dbg = debug('apm:common:models:Registry:getPackageTree');

        // Indicate that we are getting the package tree
        dbg(`Getting package tree for ${name}@${version}`);

        // Get the package
        const pkg = await this.get(name, version);

        // Get the dependencies of the package
        const deps = pkg.directDeps;

        // Get the package tree of the dependencies
        const subTrees: Package[][] = await Promise.all(
            Array.from(deps.entries()).map(([name, version]) => this.getPackageTree(name, version)),
        );

        // Flatten the sub trees
        const flattenedSubTrees = subTrees.flat();

        // Return the package tree
        return [...flattenedSubTrees, pkg];
    }

    // Get the project tree of a project given its direct dependencies
    async getProjectTree(
        directDeps: Map<string, string>,
        overrides: Set<string> = new Set<string>(),
        visited: Set<string> = new Set<string>(),
    ): Promise<PackageTree[]> {
        // Get the debugger
        const dbg = debug('apm:common:models:Registry:getProjectTree');

        // Indicate that we are getting the project dependencies
        dbg(`Getting project tree given direct dependencies: ${JSON.stringify(Object.fromEntries(directDeps))}`);

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
                throw new GetProjectTreeError(directDeps, `Unresolved peer dependency: ${name}@${version}`);
        }

        // Create a new set of overrides that includes the direct dependencies
        const localOverrides = new Set<string>([...overrides, ...directDeps.keys()]);

        // Create a result array
        const result: PackageTree[] = [];

        // Visit each of the direct dependencies and recur on their dependencies
        for (const [name, version] of directDeps.entries()) {
            // Get the package
            const pkg = await this.get(name, version);

            // Get the dependencies of the package
            const deps = pkg.directDeps;

            // Recur on the dependencies of this package
            const subResult = await this.getProjectTree(deps, localOverrides, visited);

            // Add the package to the results
            const tree = new PackageTree(pkg, subResult);

            // Add the package to the result
            result.push(tree);

            // Indicate that we have added pkg and its project tree to the result
            dbg(`Added ${name}@${version} and its project tree to the result`);

            // Add the package to the visited set
            visited.add(name);

            // Indicate that we have visited the package
            dbg(`Added ${name} to visited`);
        }

        // Print the result
        dbg(`Result: ${result.map((tree) => tree.toString()).join('\n')}`);

        // Return the result
        return result;
    }
}

export { Registry };

export const __test__ = {
    getPackagePath,
};
