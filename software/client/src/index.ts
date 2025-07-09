#!/usr/bin/env node

import { Command } from 'commander';
import { greeting, spawnCommand, copyFilesWithExtension } from './utils.js';
import * as path from 'path';
import * as fs from 'fs';
import { debug } from 'debug';
import * as common from 'common';

// Set version manually (can be updated during build)
const VERSION = '1.0.0';

// Create a new commander program
const program = new Command();

// Configure the program with version, description, etc.
program.name('apm').description('Agda Package Manager - A tool for managing Agda packages').version(VERSION);

// program
//   .command("clean")
//   .description("Cleans the virtual environment of all non-root packages")
//   .action(() => {
//     if (!cwd_is_root_package()) {
//       console.error(
//         "Error: This command must be run from the root package of an apm environment"
//       );
//       process.exit(1);
//     }

//     clean();
//   });

// Add a clone command
// program
//   .command("install")
//   .description("Installs agda packages from dependencies file")
//   .argument("[registries...]", "Registry URLs to use for package installation")
//   .action(async (registries: string[]) => {
//     if (!cwd_is_root_package()) {
//       console.error(
//         "Error: This command must be run from the root package of an apm environment"
//       );
//       process.exit(1);
//     }

//     // Create debug logger
//     const dbg = debug("apm:install");

//     try {
//       // Create empty map of installed packages
//       const installed: Map<string, string> = new Map();

//       // Install the default package
//       await install_default_package(installed);

//       // Get the root package dependencies
//       const deps = get_deps();

//       dbg(`Dependencies: ${JSON.stringify(Object.fromEntries(deps))}`);

//       // Create initial queue of dependencies
//       const queue: Set<string> = new Set();
//       // Add all initial dependencies to the initial queue
//       for (const name of deps.keys()) {
//         queue.add(name);
//       }

//       dbg(`Queue: ${JSON.stringify(Array.from(queue))}`);

//       // Install the dependencies
//       for (const [name, version] of deps.entries()) {
//         await install(name, version, registries, queue, installed);
//       }

//       dbg(`Installed: ${JSON.stringify(Object.fromEntries(installed))}`);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error(error.message);
//       } else {
//         console.error(error);
//       }
//       process.exit(1);
//     }
//   });

program
    .command('init')
    .description('Initializes an apm project in the current directory')
    .argument('<project-name>', 'The name of the project')
    .action(async (projectName: string) => {
        // Create debug logger
        const dbg = debug('apm:project:create');

        try {
            // Get the current working directory
            const cwd = process.cwd();
            // Create the project
            await common.Project.init(cwd, { projectName });
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
            process.exit(1);
        }
    });

program
    .command('install')
    .description('Installs the dependencies for the current project')
    .action(async () => {
        // Create debug logger
        const dbg = debug('apm:project:install');

        try {
            // Get the current working directory
            const cwd = process.cwd();
            // Get the project
            const project = await common.Project.load(cwd);
            // Install the dependencies
            await project.install();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    });

program
    .command('pack')
    .description('Packs the current project into an apm file')
    .argument('<destination>', 'The destination path for the package')
    .action(async (destination: string) => {
        // Create debug logger
        const dbg = debug('apm:project:pack');

        try {
            // Get the current working directory
            const cwd = process.cwd();
            // Get the project
            const project = await common.Project.load(cwd);
            // Pack the project
            const archive = await project.rootSource.getArchive();
            // Construct package with archive
            const pkg = await common.Package.create(destination, project.name, project.directDeps, archive);
            // Write the package to the current working directory
            console.log(`Package created: ${pkg.version}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    });

program
    .command('unpack')
    .description('Unpacks an apm file into a project in the current directory')
    .argument('<source>', 'The source path for the apm file')
    .action(async (source: string) => {
        // Create debug logger
        const dbg = debug('apm:project:unpack');

        try {
            // Get the current working directory
            const cwd = process.cwd();
            // Load the package
            const pkg = await common.Package.load(source);
            // Unpack the package
            await common.Project.init(cwd, { pkg });
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    });

program
    .command('info')
    .description('Prints the details of the supplied package')
    .argument('<source>', 'The source path for the apm file')
    .action(async (source: string) => {
        // Create debug logger
        const dbg = debug('apm:project:stat');

        try {
            // Load the package
            const pkg = await common.Package.load(source);
            // Print the details
            console.log(`Package file: ${pkg.filePath}`);
            console.log(`Package name: ${pkg.name}`);
            console.log(`Package version: ${pkg.version}`);
            console.log(`Package dependencies: ${JSON.stringify(Object.fromEntries(pkg.directDeps))}`);
            console.log(`Package archive offset: ${pkg.archiveOffset}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    });

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
