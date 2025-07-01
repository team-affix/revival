// import fs from 'fs';
// import path from 'path';
// import ProjectAlreadyExistsError from '../errors/project-already-exists';
// import Package from './package';

// class Project {
//     // Constructs a project model given the project path
//     private constructor(private projectPath: string) {}

//     // Find a project given the project path
//     static find(projectPath: string): Project | null {
//         if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) return null;
//         return new Project(projectPath);
//     }

//     // Create a project
//     static createEmpty(parentPath: string, projectName: string): Project {
//         // Check if the project path exists and is a directory
//         const projectPath = path.join(parentPath, projectName);
//         if (fs.existsSync(projectPath)) throw new ProjectAlreadyExistsError(projectPath);
//         // Create the project directory
//         fs.mkdirSync(projectPath, { recursive: true });
//         // Create the root package directory
//         const projectBasename = path.basename(projectPath);
//         const rootPackagePath = path.join(projectPath, projectBasename);
//         fs.mkdirSync(rootPackagePath, { recursive: true });
//         // Create the deps.txt file
//         const depsPath = path.join(rootPackagePath, 'deps.txt');
//         fs.writeFileSync(depsPath, '');
//         // Return the project model
//         return new Project(projectPath);
//     }

//     static createFromRootPackage(parentPath: string, rootPackage: Package): Project {
//         // Get the project name from the package name
//         const projectName = rootPackage.getName();
//         // Check if the project path exists and is a directory
//         const projectPath = path.join(parentPath, projectName);
//         if (fs.existsSync(projectPath)) throw new ProjectAlreadyExistsError(projectPath);
//         // Create the project directory
//         fs.mkdirSync(projectPath, { recursive: true });
//         // Create the root package directory
//     }

//     // Define installation logic
//     install(): void {
//         // Get the root package
//         const rootPackage = this.getRootPackage();
//         // Install the root package
//         rootPackage.install();
//     }
// }

// export default Project;
