// Error for when a source is created at a directory
class SourceCreateError extends Error {
    constructor(cwd: string, message: string) {
        super(`Failed to create source at '${cwd}': ${message}`);
        this.name = 'SourceCreateError';
    }
}

export default SourceCreateError;
