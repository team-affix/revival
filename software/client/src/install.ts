// import path from "path";
// import process from "process";
// import fs from "fs";
// import AdmZip from "adm-zip";
// import debug from "debug";
// import os from "os";
// import assert from "assert";

// // DECLARE CONSTANTS
// const DEFAULT_PACKAGE_NAME = "Default";

// // Check if the current directory is an apm root package
// export function cwd_is_root_package(): boolean {
//   // Get basename of current working directory
//   const cwd = process.cwd();
//   const cwdBasename = path.basename(cwd);

//   // Get basename of parent directory
//   const parent = path.dirname(cwd);
//   const parentBasename = path.basename(parent);

//   // If the basenames are the same, we are in the root package
//   return cwdBasename === parentBasename;
// }

// export function clean() {
//   // Cleans the virtual environment of all non-root packages

//   // Create debug logger
//   const dbg = debug("apm:clean");

//   // We expect this to be called from the root package
//   assert(cwd_is_root_package());

//   // Get the root package name
//   const cwd = process.cwd();
//   const rootPackageName = path.basename(cwd);

//   dbg(`Root package name: ${rootPackageName}`);

//   // Get the parent directory
//   const parentDir = path.dirname(cwd);

//   dbg(`Parent directory: ${parentDir}`);

//   // Get the list of packages in the parent directory
//   const files = fs.readdirSync(parentDir);

//   // For each folder/file in the parent directory, if it is not the root package, delete it
//   for (const file of files) {
//     if (file === rootPackageName) continue;

//     // indicate that we are deleting the file with strikethrough text
//     console.log(`\x1b[9m${file}\x1b[0m`);

//     // Delete the file
//     fs.rmSync(path.join(parentDir, file), { recursive: true, force: true });
//   }
// }

// // Get the package binary from the registry
// async function get_package_binary(
//   registries: string[],
//   name: string,
//   version: string
// ): Promise<Buffer> {
//   // If this is the default package name, fetch data locally relative to module
//   if (name === DEFAULT_PACKAGE_NAME) {
//     const defaultPackagePath = path.join(
//       __dirname,
//       "..",
//       "default_package",
//       DEFAULT_PACKAGE_NAME
//     );
//     // Create a new zip archive and add the folder contents
//     const zip = new AdmZip();
//     zip.addLocalFolder(defaultPackagePath);
//     const zipBytes = zip.toBuffer();
//     // Return the zip bytes
//     return zipBytes;
//   }

//   // Get the stub binary data from the directory ../test_packages/name/version relative to the module
//   const stubFolderPath = path.join(
//     __dirname,
//     "..",
//     "test_packages",
//     name,
//     version
//   );

//   // Create a new zip archive and add the folder contents
//   const zip = new AdmZip();
//   zip.addLocalFolder(stubFolderPath);
//   const zipBytes = zip.toBuffer();

//   return zipBytes;
// }

// // Pulls a package into the current directory
// export async function pull(
//   registries: string[],
//   name: string,
//   version: string
// ) {
//   // Get the current directory
//   const cwd = process.cwd();

//   // iv. Get the package binary from the registry
//   const binary = await get_package_binary(registries, name, version);

//   // Create binary in computer's temp directory /tmp/apmbin.zip
//   const binaryPath = path.join(os.tmpdir(), "apmbin.zip");
//   fs.writeFileSync(binaryPath, binary);
//   const zip = new AdmZip(binaryPath);

//   // vii. Unzip the binary into CWD
//   zip.extractAllTo(cwd);

//   // viii. Delete the binary
//   fs.unlinkSync(binaryPath);
// }

// // Parses dependency file in current directory
// // - Handles the case where multiple versions of the same package are listed
// export function get_deps(): Map<string, string> {
//   // Create a debug logger
//   const dbg = debug("apm:get_deps");

//   // Get the current directory
//   const cwd = process.cwd();

//   // The constant for the deps.txt filename
//   const DEPS_FILE_NAME = "deps.txt";

//   const depsFilePath = path.join(cwd, DEPS_FILE_NAME);

//   // Check if deps.txt exists
//   if (!fs.existsSync(depsFilePath)) {
//     throw new Error(`${DEPS_FILE_NAME} does not exist in ${cwd}`);
//   }

//   // Read deps.txt
//   const deps = fs.readFileSync(depsFilePath, "utf8");
//   const depsLines = deps.split("\n");

//   dbg(`Deps: ${JSON.stringify(depsLines)}`);

//   // Create a map of (name,version) tuples
//   const result = new Map<string, string>();

//   // For each line in deps.txt, parse the line and add the tuple to the map
//   for (const line of depsLines) {
//     // Parse the line
//     const [name, version] = line.split(" ");

//     // If the line is empty, break
//     if (!name) break;

//     // If the name can be parsed, but the version or domain cannot, throw an error
//     if (!version) throw new Error(`Invalid dependency line: ${line}`);

//     // If the package is already in the map, throw an error
//     if (result.has(name)) {
//       throw new Error(
//         `Multiple versions of '${name}' listed in ${depsFilePath}`
//       );
//     }

//     // Add the tuple to the map
//     result.set(name, version);
//   }

//   // Return the map
//   return result;
// }

// // Installs agda packages into the previous directory
// export async function install(
//   name: string,
//   version: string,
//   registries: string[],
//   queue: Set<string>,
//   installed: Map<string, string>
// ) {
//   // The way that the queue will work is:

//   // 1. Create local temp_queue by looking thru deps.txt and:
//   //    a. Parse deps.txt to get the (name,version) tuples
//   //    b. Check if a package with the same name is in the caller queue
//   //    c. If so, skip it (parent has overridden the dependency)
//   //    d. If not, add its name to the temp_queue
//   //    e. Create a new queue by merging the caller queue and the temp_queue
//   //    f. Go thru the temp_queue and install the packages 1 by one, where for each package we:
//   //       i. Check if the package is already installed
//   //       ii. If so, error, as this is an unresolved peer dependency
//   //       iii. If not, push to the installed list (DO NOT POP FROM temp_queue)
//   //       iv. Get the package binary from the registry
//   //       v. Mkdir the package name in the previous directory
//   //       vi. CD into the package folder
//   //       vii. Unzip the binary into CWD
//   //       viii. Delete the binary
//   //       ix. Invoke install(queue+temp_queue, installed) recursively

//   // Create a debug logger
//   const dbg = debug("apm:install");

//   // Get the current directory
//   const cwd = process.cwd();

//   // Get the parent directory
//   const parentDir = path.dirname(cwd);

//   // VERY FIRST THING IS INSTALL THE PACKAGE

//   // i. Check if the package is already installed
//   if (installed.has(name)) {
//     // ii. If so, error, as this is an unresolved peer dependency
//     throw new Error(`Unresolved peer dependency '${name}' in ${cwd}`);
//   }

//   dbg(`Installing ${name} (${version})`);

//   // iii. If not, push to the installed list (DO NOT POP FROM temp_queue)
//   installed.set(name, version);

//   // Get the package directory
//   const packageDir = path.join(parentDir, name);

//   if (fs.existsSync(packageDir)) {
//     // Package already pulled, so we just need to cd into it
//     process.chdir(packageDir);
//   } else {
//     // v. Mkdir the package name in the previous directory
//     fs.mkdirSync(packageDir, { recursive: true });

//     // vi. CD into the package folder
//     process.chdir(packageDir);

//     // iv. Pull the package into this folder (pull MUST NOT reset the cwd, as it is needed for next install call)
//     await pull(registries, name, version);

//     // Print the package name
//     console.log(name);
//   }

//   // Parse dependencies
//   const deps = get_deps();

//   // 1. Create local temp_queue
//   const temp_queue: Set<string> = new Set();

//   for (const depName of deps.keys()) {
//     // b. Check if a package with the same name is in the caller queue
//     if (queue.has(depName)) {
//       // c. If so, skip it (parent has overridden the dependency)
//       deps.delete(depName);
//       // Indicate that we are skipping the dependency
//       debug(`Skipping ${depName} (${deps.get(depName)}), overridden`);
//     } else {
//       // d. If not, add its name to the temp_queue
//       temp_queue.add(depName);
//     }
//   }

//   // e. Create a new queue by merging the caller queue and the temp_queue
//   const newQueue = new Set(queue);
//   for (const depName of temp_queue) {
//     newQueue.add(depName);
//   }

//   // f. Go thru the temp_queue and install the packages 1 by one
//   for (const depName of temp_queue) {
//     await install(depName, deps.get(depName)!, registries, newQueue, installed);
//   }

//   // Change back to the original directory
//   process.chdir(cwd);
// }

// export async function install_default_package(installed: Map<string, string>) {
//   await install(DEFAULT_PACKAGE_NAME, "", [], new Set(), installed);
// }
