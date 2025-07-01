// Error thrown when a project already exists
class ProjectAlreadyExistsError extends Error {
    constructor(projectPath: string) {
        super(`Project at ${projectPath} already exists`);
        this.name = 'ProjectAlreadyExistsError';
    }
}

export default ProjectAlreadyExistsError;
