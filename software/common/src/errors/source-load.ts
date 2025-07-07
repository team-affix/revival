// Error for when a source fails to load
class SourceLoadError extends Error {
    constructor(cwd: string, message: string) {
        super(`Failed to load source at '${cwd}': ${message}`);
        this.name = 'SourceLoadError';
    }
}

export default SourceLoadError;
