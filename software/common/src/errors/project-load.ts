// Error for when a project cannot be loaded
class ProjectLoadError extends Error {
    constructor(dir: string, message: string) {
        super(`Failed to load project at '${dir}': ${message}`);
        this.name = 'ProjectLoadError';
    }
}

export default ProjectLoadError;
