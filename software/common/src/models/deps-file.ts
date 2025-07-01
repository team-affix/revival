// import debug from 'debug';
// import FailedToParseDeps from '../errors/failed-to-parse-deps';

// // Parse the deps.txt file by its contents
// function parseDepsRaw(raw: string): Map<string, string> {
//     // Create a debug logger
//     const dbg = debug('apm:common:models:deps-file:parseDeps');

//     const depsLines = raw.split('\n');

//     dbg(`Deps: ${JSON.stringify(depsLines)}`);

//     // Create a map of (name,version) tuples
//     const result = new Map<string, string>();

//     // For each line in deps.txt, parse the line and add the tuple to the map
//     for (const line of depsLines) {
//         // Parse the line
//         const [name, version] = line.split(' ');

//         // If the line is empty, break
//         if (!name) break;

//         // If the name can be parsed, but the version cannot, throw an error
//         if (!version) throw new FailedToParseDeps(`Invalid dependency line: ${line}`);

//         // If the package is already in the map, throw an error
//         if (result.has(name)) {
//             throw new FailedToParseDeps(`Multiple versions of '${name}' listed`);
//         }

//         // Add the tuple to the map
//         result.set(name, version);
//     }

//     // Return the map
//     return result;
// }

// // Define a model for the parsed deps.txt file
// class DepsFile {
//     // Constructs a deps file model given the deps.txt file path
//     private constructor(private deps: Map<string, string>) {}

//     // Parse the deps.txt file
//     static parse(raw: string): DepsFile {
//         return new DepsFile(result);
//     }

//     // Get the map of dependencies
//     getDeps(): Map<string, string> {
//         return this.deps;
//     }
// }

// export default DepsFile;
