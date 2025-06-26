#!/usr/bin/env node

import { Command } from 'commander';
import { greeting, spawnCommand, copyFilesWithExtension } from './utils.js';
import * as path from 'path';

import { cwd_is_root_package, install } from './install.js';

// Set version manually (can be updated during build)
const VERSION = '1.0.0';

// Create a new commander program
const program = new Command();

// Configure the program with version, description, etc.
program
  .name('apm')
  .description('Agda Package Manager - A tool for managing Agda packages')
  .version(VERSION);

// Add a clone command
program
  .command('install')
  .description('Installs agda packages from dependencies file')
  .action(async () => {
    if (!cwd_is_root_package()) {
      console.error('Error: This command must be run from the root package of an apm environment');
      process.exit(1);
    }

    // Create empty queue of packages to install
    const queue : Set<string> = new Set();

    // Create empty map of installed packages
    const installed : Map<string, string> = new Map();

    await install(queue, installed);
  });

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
