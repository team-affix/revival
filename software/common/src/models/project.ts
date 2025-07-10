import fs from 'fs';
import path from 'path';
import debug from 'debug';
import ProjectLoadError from '../errors/project-load';
import ProjectInitError from '../errors/project-init';
import ReadDepsFileError from '../errors/read-deps-file';
import WriteDepsFileError from '../errors/write-deps-file';
import FailedToParseDepsError from '../errors/failed-to-parse-deps';
import { Source } from './source';
import { Package } from './package';
import { Readable } from 'stream';

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

    // Indicate that we are reading the dependencies file
    dbg(`Reading dependencies file in ${cwd}`);

    // Get the path to the dependencies file
    const depsPath = path.join(cwd, DEPS_FILE_NAME);

    // Indicate the path to the dependencies file
    dbg(`DepsPath: ${depsPath}`);

    if (!fs.existsSync(depsPath) || !fs.statSync(depsPath).isFile())
        throw new ReadDepsFileError(cwd, `dependencies file invalid or missing in ${cwd}`);

    // Get the dependencies file
    const depsRaw = fs.readFileSync(depsPath, 'utf8');

    // Indicate that we have read the dependencies file
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

        // Get the dependencies file
        const depsPath = path.join(cwd, DEPS_FILE_NAME);

        // Indicate that we are writing the dependencies file
        dbg(`Writing dependencies file to ${depsPath}`);

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
            // Indicate that we have written the dependencies file
            dbg(`dependencies successfully written to: ${depsPath}`);

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

// Create the .agda-lib file
function createAgdaLibFile(cwd: string, projectName: string): void {
    // If the cwd does not exist, throw an error
    if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory())
        throw new ProjectInitError(projectName, cwd, 'Path does not exist or is not a directory');
    // Get the path to the .agda-lib file
    const filePath = path.join(cwd, AGDA_LIB_FILE_NAME);
    // Create the .agda-lib file
    fs.writeFileSync(filePath, `name: ${projectName}\ninclude: . ${DEPS_FOLDER_NAME}`);
}

// Read the project name from the .agda-lib file
function readProjectName(cwd: string): string {
    // Get the path to the .agda-lib file
    const filePath = path.join(cwd, AGDA_LIB_FILE_NAME);
    // If the file does not exist, throw an error
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
        throw new ProjectLoadError(cwd, `Agda lib file does not exist: ${filePath}`);
    // Get the content of the file
    const content = fs.readFileSync(filePath, 'utf-8');
    // Get the line that starts with 'name:'
    const line = content.split('\n').find((line) => line.startsWith('name: '));
    // If the line is not found, throw an error
    if (!line) throw new ProjectLoadError(cwd, `name: line missing in '${filePath}'`);
    // Get the project name
    const projectName = line.split(' ')[1].trim();
    // If the project name is not found, throw an error
    if (!projectName) throw new ProjectLoadError(cwd, `Project name missing in '${filePath}'`);
    // Return the project name
    return projectName;
}

// The project model
export class Project {
    // Constructs a project model given the project path
    private constructor(
        public readonly cwd: string,
        public readonly name: string,
        public readonly directDeps: Map<string, string>,
        public readonly rootSource: Source,
        public readonly dependencySources: Source[],
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
        const projectName = readProjectName(cwd);

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
        dbg(`Root source: ${JSON.stringify(rootSource.agdaFiles.concat(rootSource.mdFiles))}`);

        // Load the dependency sources (if deps folder exists)
        const depsFolder: string = path.join(cwd, DEPS_FOLDER_NAME);
        let dependencySources: Source[] = [];
        if (fs.existsSync(depsFolder)) {
            const depRelPaths: string[] = fs.readdirSync(depsFolder);
            dependencySources = await Promise.all(depRelPaths.map((p) => Source.load(path.join(depsFolder, p))));
        }

        // Indicate the dependency sources
        dbg(`Dependency sources: ${JSON.stringify(dependencySources.map((s) => s.cwd))}`);

        // Return the project model
        return new Project(cwd, projectName, directDeps, rootSource, dependencySources);
    }

    // Initializes a project in the given directory (expects the directory to exist)
    static async init(cwd: string, extra: { projectName: string } | { pkg: Package }): Promise<Project> {
        // Get the debugger
        const dbg = debug('apm:common:models:project:create');

        // Declare the initialization values
        let projectName: string;
        let deps: Map<string, string>;
        let archive: Readable | undefined;

        // Define initialization values based on the extra argument
        if ('projectName' in extra) {
            // Set up default initialization values
            projectName = extra.projectName;
            deps = new Map();
            archive = undefined;
        } else {
            // Set up initialization values from the package
            projectName = extra.pkg.name;
            deps = extra.pkg.directDeps;
            archive = extra.pkg.getArchive();
        }

        // Indicate the project name
        dbg(`Project name: ${projectName}`);

        // If the path does not exist or is not a directory, throw an error
        if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory())
            throw new ProjectInitError(projectName, cwd, 'Path does not exist or is not a directory');

        // Get paths to the project files
        const depsPath = path.join(cwd, DEPS_FILE_NAME);
        const rootSourcePath = path.join(cwd, projectName);
        const agdaLibPath = path.join(cwd, AGDA_LIB_FILE_NAME);

        // Ensure the dependencies file does not already exist
        if (fs.existsSync(depsPath))
            throw new ProjectInitError(projectName, cwd, 'Project dir not clean: Dependencies file already exists');

        // Ensure root source if it does not already exist
        if (fs.existsSync(rootSourcePath))
            throw new ProjectInitError(projectName, cwd, 'Project dir not clean: Root source path already exists');

        // Ensure the .agda-lib file does not already exist
        if (fs.existsSync(agdaLibPath))
            throw new ProjectInitError(projectName, cwd, 'Project dir not clean: .agda-lib file already exists');

        // Create the dependencies file
        await writeDirectDepsFile(cwd, deps);

        // Create the root source directory
        await Source.create(rootSourcePath, archive);

        // Create the .agda-lib file
        createAgdaLibFile(cwd, projectName);

        // Return the project model
        return await Project.load(cwd);
    }

    // Install the project
    async install(transitiveDeps: Package[]): Promise<Source[]> {
        // Get the debugger
        const dbg = debug('apm:common:models:project:install');

        // Indicate that we are installing the project
        dbg(`Installing project at ${this.cwd}`);

        // Create deps folder if it does not already exist
        const depsFolderPath = path.join(this.cwd, DEPS_FOLDER_NAME);
        if (!fs.existsSync(depsFolderPath)) fs.mkdirSync(depsFolderPath, { recursive: true });

        // Initialize the result empty
        let result: Source[] = [];

        // Install the direct dependencies
        for (const dep of transitiveDeps) {
            // Get the path to the dependency
            const depPath = path.join(depsFolderPath, dep.name);

            // If the dependency is already installed, continue
            if (fs.existsSync(depPath)) continue;

            // Install the dependency
            const source = await Source.create(depPath, dep.getArchive());

            // Add the source to the result
            result.push(source);
        }

        // Return the result
        return result;
    }
}

export const __test__ = {
    parseDirectDeps,
    readDirectDepsFile,
    writeDirectDepsFile,
    createAgdaLibFile,
    readProjectName,
};
