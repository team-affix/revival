// Error for when a project cannot be initialized
class ProjectInitError extends Error {
    constructor(name: string, cwd: string, message: string) {
        super(`Failed to initialize project '${name}' in '${cwd}': ${message}`);
        this.name = 'ProjectInitError';
    }
}

export default ProjectInitError;
