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
async function get_package_binary(name: string, version: string, domain: string) : Promise<Buffer> {
    // Get the package binary from the registry
    const url = `https://${domain}/packages/${name}/${version}`;
    const response = await fetch(url);
    const binary = await response.arrayBuffer();
    return Buffer.from(binary);
}

// Installs agda packages into the previous directory
export async function install(queue: Set<string>, installed: Map<string, { version: string, domain: string }>) {
    // The way that the queue will work is:

    // 1. Create local temp_queue by looking thru deps.txt and:
    //    a. Parse deps.txt to get the (name,version,domain) tuples
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
    const deps = fs.readFileSync('deps.txt', 'utf8');
    const depsLines = deps.split('\n');

    // Create a map of (name,version,domain) tuples
    const depsMap = new Map<string, { version: string, domain: string }>();
    for (const line of depsLines) {
        const [name, version, domain] = line.split(' ');
        depsMap.set(name, { version, domain });
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
        const binary = await get_package_binary(name, depsMap.get(name)!.version, depsMap.get(name)!.domain);


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
