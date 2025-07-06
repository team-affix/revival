import fs from 'fs';
import path from 'path';
import debug from 'debug';
import ProjectLoadError from '../errors/project-load';
import ProjectCreationError from '../errors/project-creation';
import ReadDepsFileError from '../errors/read-deps-file';
import WriteDepsFileError from '../errors/write-deps-file';
import FailedToParseDepsError from '../errors/failed-to-parse-deps';

// The name of the deps file
const DEPS_FILE_NAME = 'deps.txt';

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
function readDirectDepsFile(dir: string): Map<string, string> {
    // Get the debugger
    const dbg = debug('apm:common:models:Project:readDirectDepsFile');

    // Indicate that we are reading the deps.txt file
    dbg(`Reading deps.txt file in ${dir}`);

    // Get the path to the deps.txt file
    const depsPath = path.join(dir, DEPS_FILE_NAME);

    // Indicate the path to the deps.txt file
    dbg(`DepsPath: ${depsPath}`);

    if (!fs.existsSync(depsPath) || !fs.statSync(depsPath).isFile())
        throw new ReadDepsFileError(dir, `deps.txt invalid or missing in ${dir}`);

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
async function writeDirectDepsFile(dir: string, deps: Map<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
        // Get the debugger
        const dbg = debug('apm:common:models:Project:writeDirectDepsFile');

        // Get the deps.txt file
        const depsPath = path.join(dir, DEPS_FILE_NAME);

        // Indicate that we are writing the deps.txt file
        dbg(`Writing deps.txt file to ${depsPath}`);

        // If the directory does not exist, throw an error
        if (!fs.existsSync(dir)) throw new WriteDepsFileError(dir, 'Directory does not exist');

        // Check if the file/folder exists, and remove it if it does
        if (fs.existsSync(depsPath)) throw new WriteDepsFileError(dir, 'File already exists');

        // Create the write stream
        const writeStream = fs.createWriteStream(depsPath);

        // Handle errors
        writeStream.on('error', (err) => {
            reject(new WriteDepsFileError(dir, err.message));
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

// export class Project {
//     // Constructs a project model given the project path
//     private constructor(
//         private projectPath: string,
//         private drafts: Draft[],
//         private rootDraft: Draft,
//     ) {}

//     // Load a project given the project path
//     static load(projectPath: string): Project {
//         // Get the debugger
//         const dbg = debug('apm:common:models:project:load');
//         // Indicate that we are loading a project
//         dbg(`Loading project at ${projectPath}`);
//         // Check if the project path exists and is a directory
//         if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory())
//             throw new ProjectLoadError(projectPath, 'Project path does not exist or is not a directory');
//         // Get the project name
//         const projectName = path.basename(projectPath);
//         // Indicate the package name
//         dbg(`Project name: ${projectName}`);
//         // Load the all drafts (all directories)
//         const draftPaths = fs
//             .readdirSync(projectPath)
//             .map((p) => path.join(projectPath, p))
//             .filter((p) => fs.statSync(p).isDirectory());
//         // Indicate all drafts that were found
//         dbg(`Found ${draftPaths.length} drafts`);
//         // Load the drafts
//         const drafts = draftPaths.map((p) => Draft.load(p));
//         // Get the root draft
//         const rootDraft = drafts.find((d) => d.getName() === projectName);
//         // Check if the root draft was found
//         if (!rootDraft) throw new ProjectLoadError(projectPath, 'Root draft not found');
//         // Return the project model
//         return new Project(projectPath, drafts, rootDraft);
//     }

//     // Create a project
//     static async create(cwd: string, projectName: string): Promise<Project> {
//         // Check if the project path exists and is a directory
//         const projectPath = path.join(cwd, projectName);
//         if (fs.existsSync(projectPath)) throw new ProjectCreationError(projectName, cwd, 'Project path already exists');
//         // Create the project directory
//         fs.mkdirSync(projectPath, { recursive: true });
//         // Create the root draft directory
//         const rootDraftPath = path.join(projectPath, projectName);
//         await Draft.create(rootDraftPath, projectName, new Map());
//         // Return the project model
//         return Project.load(projectPath);
//     }

//     // Getter for the project path
//     getProjectPath(): string {
//         return this.projectPath;
//     }

//     // Getter for the drafts
//     getDrafts(): Draft[] {
//         return this.drafts;
//     }

//     // Getter for the root draft
//     getRootDraft(): Draft {
//         return this.rootDraft;
//     }

//     // static createFromRootPackage(parentPath: string, rootPackage: Package): Project {
//     //     // Get the project name from the package name
//     //     const projectName = rootPackage.getName();
//     //     // Check if the project path exists and is a directory
//     //     const projectPath = path.join(parentPath, projectName);
//     //     if (fs.existsSync(projectPath)) throw new ProjectAlreadyExistsError(projectPath);
//     //     // Create the project directory
//     //     fs.mkdirSync(projectPath, { recursive: true });
//     //     // Create the root package directory
//     // }

//     // // Define installation logic
//     // install(): void {
//     //     // Get the root package
//     //     const rootPackage = this.getRootPackage();
//     //     // Install the root package
//     //     rootPackage.install();
//     // }
// }

export const __test__ = {
    parseDirectDeps,
    readDirectDepsFile,
    writeDirectDepsFile,
};
