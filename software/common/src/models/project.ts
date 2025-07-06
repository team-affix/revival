import fs from 'fs';
import path from 'path';
import debug from 'debug';
import { Package, Draft, pack, unpack } from './package';
import ProjectLoadError from '../errors/project-load';
import ProjectCreationError from '../errors/project-creation';

export class Project {
    // Constructs a project model given the project path
    private constructor(
        private projectPath: string,
        private drafts: Draft[],
        private rootDraft: Draft,
    ) {}

    // Load a project given the project path
    static load(projectPath: string): Project {
        // Get the debugger
        const dbg = debug('apm:common:models:project:load');
        // Indicate that we are loading a project
        dbg(`Loading project at ${projectPath}`);
        // Check if the project path exists and is a directory
        if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory())
            throw new ProjectLoadError(projectPath, 'Project path does not exist or is not a directory');
        // Get the project name
        const projectName = path.basename(projectPath);
        // Indicate the package name
        dbg(`Project name: ${projectName}`);
        // Load the all drafts (all directories)
        const draftPaths = fs
            .readdirSync(projectPath)
            .map((p) => path.join(projectPath, p))
            .filter((p) => fs.statSync(p).isDirectory());
        // Indicate all drafts that were found
        dbg(`Found ${draftPaths.length} drafts`);
        // Load the drafts
        const drafts = draftPaths.map((p) => Draft.load(p));
        // Get the root draft
        const rootDraft = drafts.find((d) => d.getName() === projectName);
        // Check if the root draft was found
        if (!rootDraft) throw new ProjectLoadError(projectPath, 'Root draft not found');
        // Return the project model
        return new Project(projectPath, drafts, rootDraft);
    }

    // Create a project
    static async create(cwd: string, projectName: string): Promise<Project> {
        // Check if the project path exists and is a directory
        const projectPath = path.join(cwd, projectName);
        if (fs.existsSync(projectPath)) throw new ProjectCreationError(projectName, cwd, 'Project path already exists');
        // Create the project directory
        fs.mkdirSync(projectPath, { recursive: true });
        // Create the root draft directory
        const rootDraftPath = path.join(projectPath, projectName);
        await Draft.create(rootDraftPath, projectName, new Map());
        // Return the project model
        return Project.load(projectPath);
    }

    // Getter for the project path
    getProjectPath(): string {
        return this.projectPath;
    }

    // Getter for the drafts
    getDrafts(): Draft[] {
        return this.drafts;
    }

    // Getter for the root draft
    getRootDraft(): Draft {
        return this.rootDraft;
    }

    // static createFromRootPackage(parentPath: string, rootPackage: Package): Project {
    //     // Get the project name from the package name
    //     const projectName = rootPackage.getName();
    //     // Check if the project path exists and is a directory
    //     const projectPath = path.join(parentPath, projectName);
    //     if (fs.existsSync(projectPath)) throw new ProjectAlreadyExistsError(projectPath);
    //     // Create the project directory
    //     fs.mkdirSync(projectPath, { recursive: true });
    //     // Create the root package directory
    // }

    // // Define installation logic
    // install(): void {
    //     // Get the root package
    //     const rootPackage = this.getRootPackage();
    //     // Install the root package
    //     rootPackage.install();
    // }
}
