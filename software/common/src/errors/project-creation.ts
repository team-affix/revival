// Error for when a project cannot be created
class ProjectCreationError extends Error {
    constructor(name: string, cwd: string, message: string) {
        super(`Failed to create project '${name}' in '${cwd}': ${message}`);
        this.name = 'ProjectCreationError';
    }
}

export default ProjectCreationError;
