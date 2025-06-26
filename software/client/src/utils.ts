/**
 * Returns a greeting message
 * @param name - The name to greet
 * @returns A greeting string
 */
export function greeting(name: string): string {
  return `Hello, ${name}!`;
}

// Import Node.js child_process module for executing shell commands
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

/**
 * Executes a shell command using spawn for better handling of interactive commands
 * @param command - The command to run
 * @param args - Command arguments as an array
 * @returns Promise that resolves when the command completes
 */
export function spawnCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit', // This passes through stdin/stdout/stderr to the parent process
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`Command completed successfully`);
        resolve();
      } else {
        console.error(`Command failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`Failed to start command: ${err}`);
      reject(err);
    });
  });
}

/**
 * Copies files with specific extension from source to target directory
 * @param sourceDir - Source directory path
 * @param targetDir - Target directory path
 * @param extension - File extension to filter (include the dot, e.g. '.agda')
 * @returns Array of copied file paths
 */
export function copyFilesWithExtension(
  sourceDir: string, 
  targetDir: string, 
  extension: string
): string[] {
  // Make sure the extension starts with a dot
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  
  // If the target directory already exists, throw an error
  if (fs.existsSync(targetDir)) {
    throw new Error(`Target directory already exists: ${targetDir}`);
  }

  // Create the target directory
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Find all files with the specified extension using glob
  const pattern = path.join(sourceDir, `**/*${ext}`);
  const matchingFiles = glob.sync(pattern);
  
  const copiedFiles: string[] = [];
   
  // Copy each matching file to the target directory
  for (const sourcePath of matchingFiles) {
    // Get the relative path from the source directory
    const relativePath = path.relative(sourceDir, sourcePath);
    const targetPath = path.join(targetDir, relativePath);
    
    // Create the target directory structure
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    
    // Copy the file
    fs.copyFileSync(sourcePath, targetPath);
    copiedFiles.push(targetPath);
    console.log(`Copied: ${sourcePath} → ${targetPath}`);
  }
  
  return copiedFiles;
}

// ESM allows for named exports like above
// or default exports like below:
export default {
  greeting,
  spawnCommand,
  copyFilesWithExtension,
}; 