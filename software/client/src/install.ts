import path from 'path';
import process from 'process';
import fs from 'fs';
import AdmZip from 'adm-zip';
import debug from 'debug';

// Check if the current directory is an apm root package
export function cwd_is_root_package() : boolean {
    // Get basename of current working directory
    const cwd = process.cwd();
    const cwdBasename = path.basename(cwd);

    // Get basename of parent directory
    const parent = path.dirname(cwd);
    const parentBasename = path.basename(parent);
    
    // If the basenames are the same, we are in the root package
    return cwdBasename === parentBasename;
}

// Get the package binary from the registry
async function get_package_binary(name: string, version: string) : Promise<Buffer> {
    // Get the stub binary data from the directory ../test_packages/name/version relative to the module
    const stubFolderPath = path.join(__dirname, '..', 'test_packages', name, version);

    // Create a new zip archive and add the folder contents
    const zip = new AdmZip();
    zip.addLocalFolder(stubFolderPath);
    const zipBytes = zip.toBuffer();

    // console.debug(`Zip bytes: MADE IT HERE`);
    // Return the zip bytes
    return zipBytes;
}

// Installs agda packages into the previous directory
export async function install(queue: Set<string>, installed: Map<string, string>) {
    // The way that the queue will work is:

    // 1. Create local temp_queue by looking thru deps.txt and:
    //    a. Parse deps.txt to get the (name,version) tuples
    //    b. Check if a package with the same name is in the caller queue
    //    c. If so, skip it (parent has overridden the dependency)
    //    d. If not, add its name to the temp_queue
    //    e. Create a new queue by merging the caller queue and the temp_queue
    //    f. Go thru the temp_queue and install the packages 1 by one, where for each package we:
    //       i. Check if the package is already installed
    //       ii. If so, error, as this is an unresolved peer dependency
    //       iii. If not, push to the installed list (DO NOT POP FROM temp_queue)
    //       iv. Get the package binary from the registry
    //       v. Mkdir the package name in the previous directory
    //       vi. CD into the package folder
    //       vii. Unzip the binary into CWD
    //       viii. Delete the binary
    //       ix. Invoke install(queue+temp_queue, installed) recursively
    
    // 1. Create local temp_queue
    const temp_queue: Set<string> = new Set();

    // a. Parse deps.txt to get the (name,version,domain) tuples
    
    // Check if deps.txt exists
    if (!fs.existsSync('deps.txt')) {
        throw new Error('deps.txt does not exist');
    }

    // Read deps.txt
    const deps = fs.readFileSync('deps.txt', 'utf8');
    const depsLines = deps.split('\n');

    console.debug(`Deps: ${JSON.stringify(depsLines)}`);

    // Create a map of (name,version) tuples
    const depsMap = new Map<string, string>();
    for (const line of depsLines) {
        // Parse the line
        const [name, version] = line.split(' ');

        // If the line is empty, break
        if (!name)
            break;

        // If the name can be parsed, but the version or domain cannot, throw an error
        if (!version)
            throw new Error(`Invalid line: ${line}`);

        // Add the tuple to the map
        depsMap.set(name, version);
    }

    for (const name of depsMap.keys()) {
        // b. Check if a package with the same name is in the caller queue
        if (queue.has(name)) {
            // c. If so, skip it (parent has overridden the dependency)
            depsMap.delete(name);
            debug(`Skipping ${name} (${depsMap.get(name)}), overridden as: ${installed.get(name)}`);
        }
        else {
            // d. If not, add its name to the temp_queue
            temp_queue.add(name);
        }
    }

    // e. Create a new queue by merging the caller queue and the temp_queue
    const newQueue = new Set(queue);
    for (const name of temp_queue) {
        newQueue.add(name);
    }

    // Get the current directory information and the parent directory
    const cwd = process.cwd();
    const parentDir = path.dirname(cwd);

    // f. Go thru the temp_queue and install the packages 1 by one, where for each package we:
    for (const name of temp_queue) {
        // i. Check if the package is already installed
        if (installed.has(name)) {
            // ii. If so, error, as this is an unresolved peer dependency
            throw new Error(`Unresolved peer dependency: ${name}`);
        }

        // iii. If not, push to the installed list (DO NOT POP FROM temp_queue)
        installed.set(name, depsMap.get(name)!);

        // iv. Get the package binary from the registry
        const binary = await get_package_binary(name, depsMap.get(name)!);


        // v. Mkdir the package name in the previous directory
        const packageDir = path.join(parentDir, name);
        fs.mkdirSync(packageDir, { recursive: true });

        // vi. CD into the package folder
        process.chdir(packageDir);
        
        // vii. Unzip the binary into CWD
        fs.writeFileSync('../binary.zip', binary);
        const zip = new AdmZip('../binary.zip');
        zip.extractAllTo(packageDir);

        // viii. Delete the binary
        fs.unlinkSync('../binary.zip');

        // ix. Invoke install(queue+temp_queue, installed) recursively
        install(newQueue, installed);

    }

    // Indicate that the package has been installed
    const packageName = path.basename(cwd);
    debug(`Installed: ${packageName}`);

}
