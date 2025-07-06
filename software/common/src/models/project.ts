import fs from 'fs';
import path from 'path';
import debug from 'debug';
import ProjectLoadError from '../errors/project-load';
import ProjectCreationError from '../errors/project-creation';
import ReadDepsFileError from '../errors/read-deps-file';
import WriteDepsFileError from '../errors/write-deps-file';
import FailedToParseDepsError from '../errors/failed-to-parse-deps';
import { Source } from './source';

// The name of the deps file
const DEPS_FILE_NAME = 'deps.txt';
const DEPS_FOLDER_NAME = 'deps';
const AGDA_LIB_FILE_NAME = '.agda-lib';

// Parse the dependencies given a raw dependencies file
function parseDirectDeps(raw: string): Map<string, string> {
    // Get the debuggers
    const dbg = debug('apm:common:models:Project:parseDeps');

    // Indicate that we are parsing the deps
    dbg(`Parsing deps: ${raw}`);

    const depsLines = raw.split('\n');

    dbg(`DepsLines: ${JSON.stringify(depsLines)}`);

    // Create a map of (name,version) tuples
    const result = new Map<string, string>();

    // For each line, parse the line and add the tuple to the map
    for (const line of depsLines) {
        // Parse the line
        const [name, version, extra] = line.split(' ');

        // If there are more than two parts, throw an error
        if (extra)
            throw new FailedToParseDepsError(`Error parsing line, expected 2 space-separated parts, got 3: ${line}`);

        // If the line is empty, continue
        if (!name) continue;

        // If the name can be parsed, but the version or domain cannot, throw an error
        if (!version) throw new FailedToParseDepsError(`Error parsing line: ${line}`);

        // If the package is already in the map, throw an error
        if (result.has(name))
            throw new FailedToParseDepsError(`Multiple versions of '${name}' listed in dependencies.`);

        // Add the tuple to the map
        result.set(name, version);
    }

    // Return the map
    return result;
}

// Read the direct dependencies from the deps file
function readDirectDepsFile(cwd: string): Map<string, string> {
    // Get the debugger
    const dbg = debug('apm:common:models:Project:readDirectDepsFile');

    // Indicate that we are reading the deps.txt file
    dbg(`Reading deps.txt file in ${cwd}`);

    // Get the path to the deps.txt file
    const depsPath = path.join(cwd, DEPS_FILE_NAME);

    // Indicate the path to the deps.txt file
    dbg(`DepsPath: ${depsPath}`);

    if (!fs.existsSync(depsPath) || !fs.statSync(depsPath).isFile())
        throw new ReadDepsFileError(cwd, `deps.txt invalid or missing in ${cwd}`);

    // Get the deps.txt file
    const depsRaw = fs.readFileSync(depsPath, 'utf8');

    // Indicate that we have read the deps.txt file
    dbg(`DepsRaw: ${depsRaw}`);

    // Parse the dependencies
    const directDeps = parseDirectDeps(depsRaw);

    // Indicate the parsed dependencies
    dbg(`DirectDeps: ${JSON.stringify(Object.fromEntries(directDeps))}`);

    // Return the parsed dependencies
    return directDeps;
}

// Write the direct dependencies to the deps file
async function writeDirectDepsFile(cwd: string, deps: Map<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
        // Get the debugger
        const dbg = debug('apm:common:models:Project:writeDirectDepsFile');

        // Get the deps.txt file
        const depsPath = path.join(cwd, DEPS_FILE_NAME);

        // Indicate that we are writing the deps.txt file
        dbg(`Writing deps.txt file to ${depsPath}`);

        // If the directory does not exist, throw an error
        if (!fs.existsSync(cwd)) throw new WriteDepsFileError(cwd, 'Directory does not exist');

        // Check if the file/folder exists, and remove it if it does
        if (fs.existsSync(depsPath)) throw new WriteDepsFileError(cwd, 'File already exists');

        // Create the write stream
        const writeStream = fs.createWriteStream(depsPath);

        // Handle errors
        writeStream.on('error', (err) => {
            reject(new WriteDepsFileError(cwd, err.message));
        });

        // Handle the finish event
        writeStream.on('finish', () => {
            // Indicate that we have written the deps.txt file
            dbg(`Deps.txt successfully written to: ${depsPath}`);

            // Resolve the promise
            resolve();
        });

        // For each dependency, write the dependency to the file
        for (const [name, version] of deps.entries()) {
            writeStream.write(`${name} ${version}\n`);
        }

        // Close the write stream
        writeStream.end();
    });
}

export class Project {
    // Constructs a project model given the project path
    private constructor(
        private cwd: string,
        private name: string,
        private directDeps: Map<string, string>,
        private rootSource: Source,
        private dependencySources: Source[],
    ) {}

    // Load a project given the project path
    static async load(cwd: string): Promise<Project> {
        // Get the debugger
        const dbg = debug('apm:common:models:project:load');
        // Indicate that we are loading a project
        dbg(`Loading project at ${cwd}`);
        // Check if the project path exists and is a directory
        if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory())
            throw new ProjectLoadError(cwd, 'Project path does not exist or is not a directory');
        // Get the project name
        const projectName = path.basename(cwd);
        // Indicate the project name
        dbg(`Project name: ${projectName}`);
        // Load the direct dependencies
        const directDeps = readDirectDepsFile(cwd);
        // Indicate the direct dependencies
        dbg(`Direct deps: ${JSON.stringify(Object.fromEntries(directDeps))}`);
        // Load the root source
        const rootSourcePath: string = path.join(cwd, projectName);
        const rootSource: Source = await Source.load(rootSourcePath);
        // Indicate the root source
        dbg(`Root source: ${JSON.stringify(rootSource.getAgdaFiles().concat(rootSource.getMdFiles()))}`);
        // Load the dependency sources (if deps folder exists)
        const depsFolder: string = path.join(cwd, DEPS_FOLDER_NAME);
        let dependencySources: Source[] = [];
        if (fs.existsSync(depsFolder)) {
            const depRelPaths: string[] = fs.readdirSync(depsFolder);
            dependencySources = await Promise.all(depRelPaths.map((p) => Source.load(path.join(depsFolder, p))));
        }
        // Indicate the dependency sources
        dbg(`Dependency sources: ${JSON.stringify(dependencySources.map((s) => s.getCwd()))}`);
        // Return the project model
        return new Project(cwd, projectName, directDeps, rootSource, dependencySources);
    }

    // Create a project
    static async create(cwd: string): Promise<Project> {
        // Get the debugger
        const dbg = debug('apm:common:models:project:create');
        // Get the project name
        const projectName = path.basename(cwd);
        // Indicate the project name
        dbg(`Project name: ${projectName}`);
        // Check if the project path exists and is a directory
        if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory())
            throw new ProjectCreationError(projectName, cwd, 'Path does not exist or is not a directory');
        // Create the deps.txt file
        const depsPath = path.join(cwd, DEPS_FILE_NAME);
        if (!fs.existsSync(depsPath)) await writeDirectDepsFile(cwd, new Map());
        // Get the root source path
        const rootSourcePath = path.join(cwd, projectName);
        // Indicate the root source path
        dbg(`Root source path: ${rootSourcePath}`);
        // Create the root source directory if it does not already exist
        if (!fs.existsSync(rootSourcePath)) fs.mkdirSync(rootSourcePath, { recursive: true });
        // Create the .agda-lib file if it does not already exist
        const agdaLibPath = path.join(cwd, AGDA_LIB_FILE_NAME);
        if (!fs.existsSync(agdaLibPath)) fs.writeFileSync(agdaLibPath, `name: ${projectName}\ninclude: . deps`);
        // Return the project model
        return await Project.load(cwd);
    }

    // Install the project
    async install(): Promise<void> {
        // Get the debugger
        const dbg = debug('apm:common:models:project:install');
        // Indicate that we are installing the project
        dbg(`Installing project at ${this.getCwd()}`);
        // Create deps folder if it does not already exist
        const depsFolderPath = path.join(this.getCwd(), DEPS_FOLDER_NAME);
        if (!fs.existsSync(depsFolderPath)) fs.mkdirSync(depsFolderPath, { recursive: true });
        // // Install the direct dependencies
        // for (const [name, version] of this.directDeps.entries()) {
        //     const depPath = path.join(depsFolderPath, name);
        // }
    }

    // Getter for the project path
    getCwd(): string {
        return this.cwd;
    }

    // Getter for the project name
    getName(): string {
        return this.name;
    }

    // Getter for the direct dependencies
    getDirectDeps(): Map<string, string> {
        return this.directDeps;
    }

    // Getter for the root source
    getRootSource(): Source {
        return this.rootSource;
    }

    // Getter for the dependency sources
    getDependencySources(): Source[] {
        return this.dependencySources;
    }
}

export const __test__ = {
    parseDirectDeps,
    readDirectDepsFile,
    writeDirectDepsFile,
};
