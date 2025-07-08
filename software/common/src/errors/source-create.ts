// Error for when a source is created from an archive
class SourceCreateError extends Error {
    constructor(cwd: string, message: string) {
        super(`Failed to create source at '${cwd}': ${message}`);
        this.name = 'SourceCreateError';
    }
}

export default SourceCreateError;
