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
    .command('project')
    .command('create')
    .description('Creates a new project and root draft to work in')
    .argument('<projectName>', 'The name of the project to create')
    .action(async (projectName: string) => {
        // Create debug logger
        const dbg = debug('apm:project:create');

        try {
            // Get the current working directory
            // const cwd = process.cwd();
            // Create the project
            await common.Project.create(cwd, projectName);
            // const project = await common.Project.create(cwd, projectName);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
            process.exit(1);
        }
    });

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
