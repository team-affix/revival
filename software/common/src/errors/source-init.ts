// Error for when a source is initialized in a directory
class SourceInitError extends Error {
    constructor(cwd: string, message: string) {
        super(`Failed to initialize source at '${cwd}': ${message}`);
        this.name = 'SourceInitError';
    }
}

export default SourceInitError;
